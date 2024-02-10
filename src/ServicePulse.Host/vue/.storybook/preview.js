/** @type { import('@storybook/vue3').Preview } */

import { setup } from "@storybook/vue3";
import { Tooltip } from "bootstrap";
import { createPinia } from "pinia";
import "@/assets/main.css";

const pinia = new createPinia();

const preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

// make v-tooltip available in all components for storybook
setup((app) => {
  app.use(pinia);
  app.directive("tooltip", {
    mounted: (el) => {
      const tooltip = new Tooltip(el, { trigger: "hover" });
      el.tooltip = tooltip;
    },
    beforeUnmount: (el) => {
      el.tooltip.hide();
    },
  });
});

export default preview;
