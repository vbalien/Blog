const path = require("path");

module.exports = {
  stories: [
    "../stories/**/*.stories.mdx",
    "../stories/**/*.stories.@(js|jsx|ts|tsx)",
  ],
  addons: ["@storybook/addon-links", "@storybook/addon-essentials"],
  webpackFinal: async config => {
    config.resolve.modules = [path.join(__dirname, "../"), "node_modules"];
    config.resolve.alias = {
      ...config.resolve.alias,
      "@emotion/core": "@emotion/react",
      "emotion-theming": "@emotion/react",
    };
    return config;
  },
};
