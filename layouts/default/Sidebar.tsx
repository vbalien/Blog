import React from "react";
import { Box } from "@chakra-ui/react";
import { Profile } from "./Profile";

export type SidebarProps = {
  name: unknown;
};
export const Sidebar: React.FC<SidebarProps> = () => (
  <Box
    backgroundColor="#5B4C7C"
    color="#fff"
    width="calc(50% - 350px)"
    minWidth="350px"
    display="flex"
    flexDirection="column"
    alignItems="flex-end"
  >
    <Box width="350px">
      <Profile name="Jisu Kim" />
    </Box>
  </Box>
);
