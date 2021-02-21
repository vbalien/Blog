import React from "react";
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from "@storybook/react/types-6-0";

import DefaultLayout from "layouts/default";

export default {
  title: "Layout/index",
  component: DefaultLayout,
} as Meta;

const Template: Story<unknown> = args => (
  <DefaultLayout {...args}>Content</DefaultLayout>
);

export const Default = Template.bind({});
Default.args = {};
