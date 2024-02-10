/** @type { import('@storybook/vue3-vite').StorybookConfig } */
const config = {
  stories: ["../src/components/**/*.stories.js"],
  addons: ["@storybook/addon-links", "@storybook/addon-essentials", "@storybook/addon-interactions", "@storybook/addon-actions", "storybook-vue3-router"],
  framework: {
    name: "@storybook/vue3-vite",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
};
export default config;
