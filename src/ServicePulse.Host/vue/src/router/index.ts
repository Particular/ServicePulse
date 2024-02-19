import { createRouter, createWebHashHistory, type RouteRecordRaw } from "vue-router";
import config from "./config";

function meta(item: { title: string }) {
  return { title: `${item.title} • ServicePulse` };
}

const routes = config.map((item) => {
  return {
    path: item.path,
    meta: meta(item),
    alias: item.alias ?? [],
    component: item.component,
    children: item.children?.map<RouteRecordRaw>((child) => ({
      path: child.path,
      meta: meta(child),
      component: child.component,
    })),
  };
});

const router = createRouter({
  history: createWebHashHistory(window.defaultConfig.base_url),
  routes,
});

router.beforeEach((to, from, next) => {
  document.title = to.meta.title;
  next();
});

export default router;
