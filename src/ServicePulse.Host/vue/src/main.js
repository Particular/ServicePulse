import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import Toast, { POSITION } from "vue-toastification";
import "vue-toastification/dist/index.css";

import "./assets/main.css";

const app = createApp(App);

app.use(router);
const toastOptions = {
    position: POSITION.BOTTOM_RIGHT,
    timeout: 3000,
    transition: "Vue-Toastification__fade",
    //containerClassName: "toast-container"
    //container : "toast-container",
    //toastClassName : "toast"
};
app.use(Toast, toastOptions);

app.mount("#app");
