import makeRouter from "./router";
import SimpleTypeahead from "vue3-simple-typeahead";
import { Tooltip } from "bootstrap";
import { mount } from "./mount";
import Toast, { POSITION } from "vue-toastification";
import "vue-toastification/dist/index.css";
import "vue3-simple-typeahead/dist/vue3-simple-typeahead.css"; //Optional default CSS
import "./assets/main.css";

const app = mount({ router: makeRouter() });

const toastOptions = {
  position: POSITION.BOTTOM_RIGHT,
  timeout: 5000,
  transition: "Vue-Toastification__fade",
  hideProgressBar: true,
  containerClassName: "toast-container",
  toastClassName: "vue-toast",
  closeButtonClassName: "toast-close-button",
};
app
  .use(Toast, toastOptions)
  .use(SimpleTypeahead)
  .use(Toast, toastOptions)  
  // make v-tooltip available in all components
  .directive("tooltip", {
    mounted: (el) => {
      const tooltip = new Tooltip(el, { trigger: "hover" });
      el.tooltip = tooltip;
    },
    beforeUnmount: (el) => {
      el.tooltip.hide();
    },
  });
