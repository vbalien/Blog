import React from "react";
import { Image, Flex, Box, Text, HStack, Link } from "@chakra-ui/react";
import { VscGithub, VscMail } from "react-icons/vsc";
import { FiTwitter } from "react-icons/fi";
import { Icon } from "@chakra-ui/icons";

export type ProfileProps = {
  name: string;
  description: string;
};
export const Profile: React.FC<ProfileProps> = ({ name, description }) => (
  <Flex direction="row" m="5em 0">
    <Image
      width="5em"
      height="5em"
      borderRadius="full"
      alignSelf="center"
      src="https://avatars.githubusercontent.com/u/4590714"
    />
    <Flex direction="column" ml="0.7em">
      <Text fontSize="xl">{name}</Text>
      <Box>{description}</Box>
      <HStack spacing="0.7em" mt="0.5em">
        <Link target="_blank" href="https://twitter.com/_elnyan">
          <Icon as={FiTwitter} w="1.2em" h="1.2em" />
        </Link>
        <Link target="_blank" href="https://github.com/vbalien">
          <Icon as={VscGithub} w="1.2em" h="1.2em" />
        </Link>
        <Link target="_blank" href="mailto:webmaster@alien.moe">
          <Icon as={VscMail} w="1.2em" h="1.2em" />
        </Link>
      </HStack>
    </Flex>
  </Flex>
);
