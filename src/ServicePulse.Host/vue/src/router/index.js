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
      component: FailedMessagesView,
      meta: {
        title: "Failed Messages • ServicePulse",
      },
      children: [
        {
          name: "failed-messages",
          path: "",
          component: () => import("../components/failedmessages/FailedMessageGroups.vue"),
        },
        {
          path: "all-failed-messages",
          component: () => import("../components/failedmessages/AllFailedMessages.vue"),
        },
        {
          path: "deleted-message-groups",
          component: () => import("../components/failedmessages/DeletedMessageGroups.vue"),
        },
        {
          path: "all-deleted-messages",
          component: () => import("../components/failedmessages/AllDeletedMessages.vue"),
        },
        {
          path: "pending-retries",
          component: () => import("../components/failedmessages/PendingRetries.vue"),
        },
        {
          name: "message-groups",
          path: "group/:groupId",
          component: () => import("../components/failedmessages/AllFailedMessages.vue"),
        },
        {
          name: "deleted-message-groups",
          path: "deleted-messages/group/:groupId",
          component: () => import("../components/failedmessages/AllDeletedMessages.vue"),
        },
      ],
    },
    {
      path: "/failed-messages/message/:id",
      name: "message",
      component: () => import("../components/failedmessages/MessageView.vue"),
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
