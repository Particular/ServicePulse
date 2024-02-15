import { createApp } from "vue";
import { Tooltip } from "bootstrap";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import SimpleTypeahead from "vue3-simple-typeahead";
import Toast, { type PluginOptions, POSITION } from "vue-toastification";
import "vue-toastification/dist/index.css";
import "vue3-simple-typeahead/dist/vue3-simple-typeahead.css"; //Optional default CSS
import "./assets/main.css";

const app = createApp(App);

const toastOptions: PluginOptions = {
  position: POSITION.BOTTOM_RIGHT,
  timeout: 5000,
  transition: "Vue-Toastification__fade",
  hideProgressBar: true,
  containerClassName: "toast-container",
  toastClassName: "vue-toast",
  closeButtonClassName: "toast-close-button",
};

app.config.errorHandler = (err, instance, info) => {
  console.error(instance, err);
};

app
  .use(router)
  .use(Toast, toastOptions)
  .use(SimpleTypeahead)
  .use(createPinia())
  // make v-tooltip available in all components
  .directive("tooltip", {
    mounted: (el) => {
      const tooltip = new Tooltip(el, { trigger: "hover" });
      el.tooltip = tooltip;
    },
    beforeUnmount: (el) => {
      el.tooltip.hide();
    },
  })
  .mount("#app");
