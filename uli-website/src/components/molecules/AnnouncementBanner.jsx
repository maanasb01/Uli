import { Box, Text } from "grommet";
import React, { useState, useEffect, useContext } from "react";


export default function AnnouncementBanner({ children }) {
    return (
        <Box align="center" className="

    w-fit
    mx-auto
    text-center
    border-solid
    border-[1.5em]
    px-2
    [border-image-source:url('/announcement-long-div.svg')]
    [border-image-slice:33%_4%_fill]
    [border-image-repeat:round]>
    ">
            {children}

        </Box>
    );
}
