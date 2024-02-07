import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import Toast, { type PluginOptions, POSITION } from "vue-toastification";
import "vue-toastification/dist/index.css";
import SimpleTypeahead from "vue3-simple-typeahead";
import "vue3-simple-typeahead/dist/vue3-simple-typeahead.css"; //Optional default CSS
import "./assets/main.css";

const app = createApp(App);

app.use(router);
const toastOptions: PluginOptions = {
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

app.config.errorHandler = (err, instance, info) => {
  console.error(instance, err);
};

app.mount("#app");
