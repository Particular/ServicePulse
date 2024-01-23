import { createApp } from "vue";
import App from "./App.vue";

export function mount({ router }) {
  const app = createApp(App);
  app.use(router);
  app.mount(`#app`);

  return app;
}
