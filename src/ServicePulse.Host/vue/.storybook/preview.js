/** @type { import('@storybook/vue3').Preview } */

import { setup } from "@storybook/vue3";
import { Tooltip } from "bootstrap";
import '../src/assets/main.css';

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
setup((app) => app.directive("tooltip", {
  mounted: (element) => {
    new Tooltip(element);
  },
}));

export default preview;
