import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";

export function mount({ router }) {
  const app = createApp(App);
  app.use(router).use(createPinia());
  app.mount(`#app`);

  return app;
}
