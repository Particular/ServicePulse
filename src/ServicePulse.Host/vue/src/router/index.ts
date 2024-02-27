import { createRouter, createWebHashHistory, type RouteRecordRaw } from "vue-router";
import config, { type RouteItem } from "./config";

function meta(item: { title: string }) {
  return { title: `${item.title} • ServicePulse` };
}

const routes = config.flatMap<RouteRecordRaw>((item) => {
  const result: RouteRecordRaw[] = [];
  result.push({
    path: item.path,
    name: item.path,
    meta: meta(item),
    component: item.component,
    children: item.children?.map<RouteRecordRaw>((child) => ({
      path: child.path,
      name: `${item.path}/${child.path}`,
      meta: meta(child),
      component: child.component,
    })),
  });

  result.push(
    ...(item.alias?.map((value) => ({
      path: value,
      redirect: item.path,
    })) ?? [])
  );

  return result;
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
