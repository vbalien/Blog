import React from "react";
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from "@storybook/react/types-6-0";

import { Sidebar, SidebarProps } from "layouts/default/Sidebar";

export default {
  title: "Layout/Sidebar",
  component: Sidebar,
} as Meta;

const Template: Story<SidebarProps> = args => <Sidebar {...args} />;

export const Default = Template.bind({});
Default.args = {
  name: {},
};
