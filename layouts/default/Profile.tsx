import React from "react";
import { Image } from "@chakra-ui/react";

export type ProfileProps = {
  name: unknown;
};
export const Profile: React.FC<ProfileProps> = () => (
  <div>
    <Image
      width="50px"
      height="50px"
      borderRadius="100%"
      src="https://avatars.githubusercontent.com/u/4590714"
    />
    teset
  </div>
);
