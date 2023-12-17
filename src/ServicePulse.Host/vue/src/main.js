import { createApp } from "vue";
import { Tooltip } from "bootstrap";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import SimpleTypeahead from "vue3-simple-typeahead";
import Toast, { POSITION } from "vue-toastification";
import "vue-toastification/dist/index.css";
import "vue3-simple-typeahead/dist/vue3-simple-typeahead.css"; //Optional default CSS
import "./assets/main.css";

const toastOptions = {
  position: POSITION.BOTTOM_RIGHT,
  timeout: 5000,
  transition: "Vue-Toastification__fade",
  hideProgressBar: true,
  containerClassName: "toast-container",
  toastClassName: "vue-toast",
  closeButtonClassName: "toast-close-button",
};

createApp(App)
  .use(router)
  .use(Toast, toastOptions)
  .use(SimpleTypeahead)
  .use(createPinia())
  // make v-tooltip available in all components
  .directive("tooltip", {
    mounted: (element) => {
      new Tooltip(element);
    },
  })
  .mount("#app");
