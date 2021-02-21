import React from "react";
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from "@storybook/react/types-6-0";

import { Profile, ProfileProps } from "layouts/default/Profile";

export default {
  title: "Layout/Profile",
  component: Profile,
} as Meta;

const Template: Story<ProfileProps> = args => <Profile {...args} />;

export const Default = Template.bind({});
Default.args = {
  name: {},
};
