import * as React from "react";
import AppShellNew from "../components/molecules/AppShellNew";
import Announcements from "../components/molecules/Announcements";
import { Box, Text } from "grommet";
import Projects from "../components/molecules/Projects";
import RecentBlogs from "../components/molecules/RecentBlogs";
import Resources from "../components/molecules/Resources";
import EmailSubscription from "../components/molecules/EmailSubscription";

const NewHome = () => {
  return (
    <AppShellNew>
      <Box align="center" margin={{ horizontal: "large", vertical: "small" }}>
        <Announcements />
        <Box className="flex flex-col items-center pb-12 gap-14">
          <p className="text-[150px] leading-[90%] tracking-[-5%] mx-auto mt-14 mb-0">Reclaim your <br/> online space</p>

          <Text className="w-[30%] text-center">Short Statement about what Uli isUse Uli to redact slurs and abusive content, archive problematic content, and collectively push back against online gender based violence.</Text>

          <Box className="flex flex-row gap-8 font-bold">
            <Text className="cursor-pointer">Our Process</Text>
            <Text className="cursor-pointer">About Us</Text>
          </Box>
        </Box>
      </Box>
      <Projects />
      <RecentBlogs />
      <Resources />
      <EmailSubscription />
    </AppShellNew>
  );
};

export default NewHome;
