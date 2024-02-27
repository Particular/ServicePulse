import { createRouter, createWebHashHistory, type RouteRecordRaw } from "vue-router";
import config from "./config";

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

export default function makeRouter() {
  return createRouter({
    history: createWebHashHistory(window.defaultConfig.base_url),
    routes: routes,
    strict: false,
  });
}
