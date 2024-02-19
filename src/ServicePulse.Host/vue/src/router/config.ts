import DashboardView from "@/views/DashboardView.vue";
import type { RouteComponent } from "vue-router";
import FailedMessagesView from "@/views/FailedMessagesView.vue";
import EventsView from "@/views/EventsView.vue";
import ConfigurationView from "@/views/ConfigurationView.vue";
import routeLinks from "@/router/routeLinks";

export interface RouteItem {
  path: string;
  alias?: string[];
  title: string;
  component: RouteComponent | (() => Promise<RouteComponent>);
  children?: RouteItem[];
}

const config: RouteItem[] = [
  {
    path: routeLinks.dashboard,
    alias: ["/"],
    component: DashboardView,
    title: "Dashboard",
  },
  {
    path: routeLinks.failedMessage.root,
    component: FailedMessagesView,
    title: "Failed Messages",
    children: [
      {
        title: "Failed Messages",
        path: routeLinks.failedMessage.failedMessagesGroups.template,
        component: () => import("@/components/failedmessages/FailedMessageGroups.vue"),
      },
      {
        path: routeLinks.failedMessage.allFailedMessages.template,
        title: "All Failed Messages",
        component: () => import("@/components/failedmessages/AllFailedMessages.vue"),
      },
      {
        path: routeLinks.failedMessage.deletedMessagesGroup.template,
        title: "Deleted Message Groups",
        component: () => import("@/components/failedmessages/DeletedMessageGroups.vue"),
      },
      {
        path: routeLinks.failedMessage.allDeletedMessages.template,
        title: "All Deleted Messages",
        component: () => import("@/components/failedmessages/AllDeletedMessages.vue"),
      },
      {
        path: routeLinks.failedMessage.pendingRetries.template,
        title: "Pending Retries",
        component: () => import("@/components/failedmessages/PendingRetries.vue"),
      },
      {
        title: "All Failed Messages",
        path: routeLinks.failedMessage.group.template,
        component: () => import("@/components/failedmessages/AllFailedMessages.vue"),
      },
      {
        title: "All Deleted Messages",
        path: routeLinks.failedMessage.deletedGroup.template,
        component: () => import("@/components/failedmessages/AllDeletedMessages.vue"),
      },
      {
        path: routeLinks.failedMessage.message.template,
        title: "Message",
        component: () => import("@/components/failedmessages/MessageView.vue"),
      },
    ],
  },
  {
    path: routeLinks.events,
    component: EventsView,
    title: "Events",
  },
  {
    path: routeLinks.configuration.root,
    title: "Configuration",
    component: ConfigurationView,
    children: [
      {
        title: "License",
        path: routeLinks.configuration.license.template,
        component: () => import("@/components/configuration/PlatformLicense.vue"),
      },
      {
        title: "Health Check Notifications",
        path: routeLinks.configuration.healthCheckNotifications.template,
        component: () => import("@/components/configuration/HealthCheckNotifications.vue"),
      },
      {
        title: "Retry Redirects",
        path: routeLinks.configuration.retryRedirects.template,
        component: () => import("@/components/configuration/RetryRedirects.vue"),
      },
      {
        title: "Connections",
        path: routeLinks.configuration.connections.template,
        component: () => import("@/components/configuration/PlatformConnections.vue"),
      },
      {
        title: "Endpoint Connection",
        path: routeLinks.configuration.endpointConnection.template,
        component: () => import("@/components/configuration/EndpointConnection.vue"),
      },
    ],
  },
];

export default config;
