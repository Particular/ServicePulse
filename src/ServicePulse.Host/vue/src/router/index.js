import { createRouter, createWebHistory } from "vue-router";
import DashboardView from "../views/DashboardView.vue";
import FailedMessagesView from "../views/FailedMessagesView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/dashboard",
      name: "dashboard",
      component: DashboardView,
      meta: {
        title: "Dashboard • ServicePulse",
      },
    },
    {
      path: "/",
      redirect: "/dashboard",
    },
    {
      path: "/failed-messages",
      name: "failed-messages",
      component: FailedMessagesView,
      meta: {
        title: "Failed Messages • ServicePulse",
      },
    },
    {
      path: "/failed-messages/message/:id",
      name: "message",
      component: () => import("../views/MessageView.vue"),
      meta: {
        title: "Message • ServicePulse",
      },
    },
    {
      path: "/configuration",
      name: "configuration",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import("../views/ConfigurationView.vue"),
      meta: {
        title: "Configuration • ServicePulse",
      },
    },
  ],
  strict: false,
});

router.beforeEach((to, from, next) => {
  document.title = to.meta.title || "ServicePulse";
  next();
});

export default router;
