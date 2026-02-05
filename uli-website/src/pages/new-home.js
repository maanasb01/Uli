import * as React from "react"
import AppShellNew from "../components/molecules/AppShellNew"
import AnnouncementBanner from "../components/molecules/AnnouncementBanner"
import { Box, Text } from "grommet"
import Projects from "../components/molecules/Projects"
import RecentBlogs from "../components/molecules/RecentBlogs"


const NewHome = () => {
  return (
    <AppShellNew>
      <Box align="center" margin={{horizontal: "large", vertical:"small"}}>

        <AnnouncementBanner>
          <Box>
            <Text size="xlarge">Announcement</Text>
            <br />
            <Box>That white background would typically be a solid fill with border radius, and using Auto Layout <br /> would be able to grow and shrink based on the label overrides per instance.</Box>
            <button className="border border-1 border-dashed bg-inherit px-4 py-2 w-fit self-center mt-5 cursor-pointer"> <Text>Learn more</Text></button>
          </Box>

        </AnnouncementBanner>
      </Box>
        <Projects />
        <RecentBlogs />
    </AppShellNew >
  )
}

export default NewHome
