import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";

import "./assets/main.css";

const app = createApp(App);

app.use(router);
const toastOptions = {
    //container : "toast-container",
    //toastClassName : "toast"
};
app.use(Toast, toastOptions);

app.mount("#app");
