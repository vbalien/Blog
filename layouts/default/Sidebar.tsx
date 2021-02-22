import React from "react";
import { Box, VStack, List, ListItem, ListIcon, Link } from "@chakra-ui/react";
import { VscArchive, VscProject, VscHome, VscTag } from "react-icons/vsc";
import { Link as RouterLink } from "react-router-dom";
import { Profile } from "./Profile";
import AsyncPage from "core/client/AsyncPage";
import normalizePagename from "core/utils/normalizePagename";

export type SidebarProps = {
  name: string;
  description: string;
};
export const Sidebar: React.FC<SidebarProps> = ({ name, description }) => (
  <Box
    backgroundColor="#a4508b"
    backgroundImage="linear-gradient(326deg, #a4508b 0%, #5f0a87 74%)"
    color="#fff"
    width="calc(50% - 350px)"
    minWidth="350px"
    display="flex"
    flexDirection="column"
    alignItems="flex-end"
  >
    <VStack width="350px">
      <Profile name={name} description={description} />
      <Box as="nav" alignSelf="flex-end" mr="3em">
        <List spacing="0.7em" fontWeight="light" fontSize="2xl">
          <ListItem>
            <Link
              as={RouterLink}
              to="/"
              onMouseOver={() =>
                AsyncPage.preload({ page: normalizePagename("/") })
              }
            >
              <ListIcon as={VscHome} />
              Home
            </Link>
          </ListItem>
          <ListItem>
            <Link
              as={RouterLink}
              to="/products.html"
              onMouseOver={() =>
                AsyncPage.preload({ page: normalizePagename("/products.html") })
              }
            >
              <ListIcon as={VscProject} />
              Products
            </Link>
          </ListItem>
          <ListItem>
            <Link
              as={RouterLink}
              to="/archives/page/"
              onMouseOver={() =>
                AsyncPage.preload({
                  page: normalizePagename("/archives/page/"),
                })
              }
            >
              <ListIcon as={VscArchive} />
              Archives
            </Link>
          </ListItem>
          <ListItem>
            <Link
              as={RouterLink}
              to="/tags/"
              onMouseOver={() =>
                AsyncPage.preload({
                  page: normalizePagename("/tags/"),
                })
              }
            >
              <ListIcon as={VscTag} />
              Tags
            </Link>
          </ListItem>
        </List>
      </Box>
    </VStack>
  </Box>
);
