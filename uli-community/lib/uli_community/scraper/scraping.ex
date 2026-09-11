defmodule UliCommunity.Scraper.Scraping do
  @moduledoc """
  Module for handling scraping data from web.
  This module interfaces with Python code through erlport to run the scraping functions.
  """
  use GenServer
  use Export.Python
  require Logger

  @python_path Application.compile_env(:uli_community, [:python, :python_path])
  @python_executable Application.compile_env(:uli_community, [:python, :python])
  @server_name __MODULE__

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: @server_name)
  end

  def scrape_posts(profile, limit \\ 10) do
    GenServer.cast(@server_name, {:scrape_posts, profile, limit})
  end

  def scrape_comments(posts, limit \\ 1000, nesting? \\ false) do
    GenServer.cast(@server_name, {:scrape_comments, posts, limit, nesting?})
  end

  def scrape_posts_comments(profile, post_limit \\ 10, comment_limit \\ 100, nesting? \\ false) do
    GenServer.cast(
      @server_name,
      {:scrape_posts_comments, profile, post_limit, comment_limit, nesting?}
    )
  end

  @impl true
  def init(_opts) do
    token = Application.get_env(:uli_community, :apify_token)

    if is_nil(token) do
      Logger.error("APIFY_TOKEN is missing")
      {:stop, "APIFY_TOKEN is missing"}
    else
      case Python.start(python_path: @python_path, python: @python_executable) do
        {:ok, py} ->
          try do
            Python.call(py, "insta_scraper", "initialize", [token])
            {:ok, %{py_process: py}}
          rescue
            e ->
              Logger.error("Failed to initialize Python code for Scraper: #{inspect(e)}")
              {:stop, "Failed to initialize Python code for Scraper"}
          end

        {:error, reason} ->
          Logger.error("Failed to start Python process for Scraper: #{inspect(reason)}")
          {:stop, "Failed to initialize Python environment for Scraper"}
      end
    end
  end

  @impl true
  def handle_cast({:scrape_posts, profile, limit}, state) do
    py_process = state.py_process

    Task.start(fn ->
      try do
        result = Python.call(py_process, "insta_scraper", "scrape_posts", [profile, limit])
        Logger.info("Scraping posts finished for #{profile}: #{inspect(result)}")
      rescue
        e ->
          Logger.error("Failed to run scraper for getting posts: #{inspect(e)}")
      end
    end)

    {:noreply, state}
  end

  @impl true
  def handle_cast({:scrape_comments, posts, limit, nesting?}, state) do
    py_process = state.py_process

    Task.start(fn ->
      try do
        result =
          Python.call(py_process, "insta_scraper", "scrape_comments", [posts, limit, nesting?])

        Logger.info("Scraping comments finished for #{inspect(posts)}: #{inspect(result)}")
      rescue
        e ->
          Logger.error("Failed to run scraper for getting comments: #{inspect(e)}")
      end
    end)

    {:noreply, state}
  end

  @impl true
  def handle_cast({:scrape_posts_comments, profile, post_limit, comment_limit, nesting?}, state) do
    py_process = state.py_process

    Task.start(fn ->
      try do
        result =
          Python.call(py_process, "insta_scraper", "scrape_posts_comments", [
            profile,
            post_limit,
            comment_limit,
            nesting?
          ])

        Logger.info("Scraping finished for #{profile}: #{inspect(result)}")
      rescue
        e ->
          Logger.error("Failed to run scraper for getting posts comments: #{inspect(e)}")
      end
    end)

    {:noreply, state}
  end

  @impl true
  def terminate(_reason, state) do
    Python.stop(state.py_process)
    :ok
  end
end
