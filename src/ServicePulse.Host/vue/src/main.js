import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import Toast, { POSITION } from "vue-toastification";
import "vue-toastification/dist/index.css";
import SimpleTypeahead from "vue3-simple-typeahead";
import "vue3-simple-typeahead/dist/vue3-simple-typeahead.css"; //Optional default CSS
import "./assets/main.css";
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faPlus, faLevelUp } from "@fortawesome/free-solid-svg-icons";

//Add font-awesome icons that will be used in the solution
library.add(faPlus, faLevelUp);

const app = createApp(App);

app.use(router);
app.component("font-awesome-icon", FontAwesomeIcon);
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

app.mount("#app");
