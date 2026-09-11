from apify_client import ApifyClient
import os
import json
import logging
import sys
import time

PROFILE = "natgeo"

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "scraper_output")


# Writes data to a JSON file under OUTPUT_DIR and returns the full path.
def save_json(data, filename):
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    output_path = os.path.join(OUTPUT_DIR, filename)
    with open(output_path, "w") as f:
        json.dump(data, f, indent=2)
    return output_path


# Erlport delivers Elixir strings as raw bytes; decode them back to str/list/dict recursively.
def decode_bytes(obj):
    if isinstance(obj, dict):
        return {decode_bytes(k): decode_bytes(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [decode_bytes(i) for i in obj]
    elif isinstance(obj, bytes):
        return obj.decode("utf-8")
    else:
        return obj


# Sets up the shared Apify client for this process; must run before any other call.
def initialize(token):
    global apify_client
    apify_client = ApifyClient(decode_bytes(token))
    return


# Runs the Apify actor to fetch a profile's recent posts (full item dump), without saving anything.
def _fetch_posts(profile, limit=10):
    run_input = {
        "username": [profile],
        "resultsLimit": limit,
        "skipPinnedPosts": True,
        "dataDetailLevel": "basicData",
    }

    try:
        run = apify_client.actor("nH2AHrwxeTRJoN5hX").call(run_input=run_input)

        posts = list(apify_client.dataset(run.default_dataset_id).iterate_items())

        return posts
    except Exception:
        logging.exception("Something went wrong while getting Posts")
        raise


# Fetches a profile's recent posts and saves them to a JSON file.
def scrape_posts(profile, limit=10):
    profile = decode_bytes(profile)
    posts = _fetch_posts(profile, limit)
    output_path = save_json(posts, f"posts-{profile}-{int(time.time())}.json")
    return {"status": "ok", "output_path": output_path, "count": len(posts)}


# Runs the Apify actor to fetch comments for the given posts, without saving anything.
def _fetch_comments(posts: list[str], limit=100, enableNest=False):
    if enableNest:
        run_input = {
            "directUrls": posts,
            "resultsLimit": limit,
            "includeNestedComments": True,
        }
        actor = "apify/instagram-comment-scraper"
    else:
        run_input = {
            "postUrls": posts,
            "maxCommentsPerPost": limit,
            "sortOrder": "recent",
        }
        actor = "scrapesmith/instagram-comments-scraper"

    try:
        actor_client = apify_client.actor(actor)
        call_result = actor_client.call(run_input=run_input)

        dataset_client = apify_client.dataset(call_result.default_dataset_id)
        comments = dataset_client.list_items().items

        return comments
    except Exception:
        logging.exception("Something went wrong while getting comments")
        raise


# Fetches comments for the given post(s) and saves them to a JSON file.
def scrape_comments(posts: list[str], limit=1000, enableNest=False):
    comments = _fetch_comments(decode_bytes(posts), limit, enableNest)
    output_path = save_json(comments, f"comments-{int(time.time())}.json")
    return {"status": "ok", "output_path": output_path, "count": len(comments)}


# Fetches a profile's posts and their comments, then saves the combined result as one JSON file.
def scrape_posts_comments(profile, postLimit=10, commentLimit=100, enableNest=False):
    profile = decode_bytes(profile)
    try:
        posts = _fetch_posts(profile, postLimit)

        if posts == []:
            print("No Posts were fetched")
            return {"status": "no_posts"}

        urls = [post["url"] for post in posts]
        all_comments = _fetch_comments(urls, commentLimit, enableNest)

        if all_comments == []:
            print("No Comments were fetched")
            return {"status": "no_comments"}

        formatted_output = []

        for post in posts:
            matched_comments = [
                comment for comment in all_comments if comment["postUrl"] == post["url"]
            ]
            entry = {
                "post": post["url"],
                "reported_comments_count": post.get("commentsCount"),
                "fetched_comments_count": len(matched_comments),
                "requested_comments_limit": commentLimit,
                "comments": matched_comments,
            }
            formatted_output.append(entry)

        output_path = save_json(
            formatted_output, f"latest-posts-comments-{profile}-{int(time.time())}.json"
        )

        print(f"Saved {len(formatted_output)} posts with comments for {profile} to {output_path}")
        return {"status": "ok", "output_path": output_path, "count": len(formatted_output)}
    except Exception:
        logging.exception("Failed to get posts with comments")
        raise


if __name__ == "__main__":
    profile = sys.argv[1] if len(sys.argv) > 1 else PROFILE
    initialize(os.getenv("APIFY_TOKEN"))
    scrape_posts_comments(profile)
