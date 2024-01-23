import { createApp } from "vue";
import App from "./App.vue";
import makeRouter from "./router";
import { mount } from "./mount";
import Toast, { POSITION } from "vue-toastification";
import "vue-toastification/dist/index.css";
import SimpleTypeahead from "vue3-simple-typeahead";
import "vue3-simple-typeahead/dist/vue3-simple-typeahead.css"; //Optional default CSS
import "./assets/main.css";

mount({ router: makeRouter() });

const toastOptions = {
  position: POSITION.BOTTOM_RIGHT,
  timeout: 5000,
  transition: "Vue-Toastification__fade",
  hideProgressBar: true,
  containerClassName: "toast-container",
  toastClassName: "vue-toast",
  closeButtonClassName: "toast-close-button",
};
app.use(Toast, toastOptions);
app.use(SimpleTypeahead);