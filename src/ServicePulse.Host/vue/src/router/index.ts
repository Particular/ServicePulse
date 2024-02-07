import { createRouter, createWebHashHistory } from "vue-router";
import DashboardView from "@/views/DashboardView.vue";
import FailedMessagesView from "@/views/FailedMessagesView.vue";
import EventsView from "@/views/EventsView.vue";
import ConfigurationView from "@/views/ConfigurationView.vue";

const router = createRouter({
  history: createWebHashHistory(window.defaultConfig.base_url),
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
          component: () => import("@/components/failedmessages/FailedMessageGroups.vue"),
        },
        {
          path: "all-failed-messages",
          component: () => import("@/components/failedmessages/AllFailedMessages.vue"),
        },
        {
          path: "deleted-message-groups",
          component: () => import("@/components/failedmessages/DeletedMessageGroups.vue"),
        },
        {
          path: "all-deleted-messages",
          component: () => import("@/components/failedmessages/AllDeletedMessages.vue"),
        },
        {
          path: "pending-retries",
          component: () => import("@/components/failedmessages/PendingRetries.vue"),
        },
        {
          name: "message-groups",
          path: "group/:groupId",
          component: () => import("@/components/failedmessages/AllFailedMessages.vue"),
        },
        {
          name: "deleted-message-groups",
          path: "deleted-messages/group/:groupId",
          component: () => import("@/components/failedmessages/AllDeletedMessages.vue"),
        },
      ],
    },
    {
      path: "/failed-messages/message/:id",
      name: "message",
      component: () => import("@/components/failedmessages/MessageView.vue"),
      meta: {
        title: "Message • ServicePulse",
      },
    },
    {
      path: "/events",
      name: "events",
      component: EventsView,
      meta: {
        title: "Events • ServicePulse",
      },
    },
    {
      path: "/configuration",
      name: "configuration",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: ConfigurationView,
      meta: {
        title: "Configuration • ServicePulse",
      },
      children: [
        {
          name: "license",
          path: "",
          component: () => import("@/components/configuration/PlatformLicense.vue"),
        },
        {
          name: "health-check-notifications",
          path: "health-check-notifications",
          component: () => import("@/components/configuration/HealthCheckNotifications.vue"),
        },
        {
          name: "retry-redirects",
          path: "retry-redirects",
          component: () => import("@/components/configuration/RetryRedirects.vue"),
        },
        {
          name: "connections",
          path: "connections",
          component: () => import("@/components/configuration/PlatformConnections.vue"),
        },
        {
          name: "endpoint-connection",
          path: "endpoint-connection",
          component: () => import("@/components/configuration/EndpointConnection.vue"),
        },
      ],
    },
  ],
  strict: false,
});

router.beforeEach((to, from, next) => {
  document.title = to.meta.title || "ServicePulse";
  next();
});

export default router;
