import DashboardView from "@/views/DashboardView.vue";
import type { RouteComponent } from "vue-router";
import FailedMessagesView from "@/views/FailedMessagesView.vue";
import MonitoringView from "@/views/MonitoringView.vue";
import EventsView from "@/views/EventsView.vue";
import ConfigurationView from "@/views/ConfigurationView.vue";
import routeLinks from "@/router/routeLinks";
import CustomChecksView from "@/views/CustomChecksView.vue";
import HeartbeatsView from "@/views/HeartbeatsView.vue";
import ThroughputReportView from "@/views/ThroughputReportView.vue";
import AuditView from "@/views/AuditView.vue";
import LoggedOutView from "@/views/LoggedOutView.vue";

export interface RouteItem {
  path: string;
  alias?: string;
  redirect?: string;
  title: string;
  component?: RouteComponent | (() => Promise<RouteComponent>);
  children?: RouteItem[];
  allowAnonymous?: boolean;
}

const config: RouteItem[] = [
  {
    path: routeLinks.loggedOut,
    component: LoggedOutView,
    title: "Signed Out",
    allowAnonymous: true,
  },
  {
    path: routeLinks.dashboard,
    component: DashboardView,
    title: "Dashboard",
  },
  {
    path: routeLinks.heartbeats.instances.template,
    component: () => import("@/components/heartbeats/EndpointInstances.vue"),
    title: "Endpoint Instances",
  },
  {
    path: routeLinks.heartbeats.root,
    component: HeartbeatsView,
    title: "Heartbeats",
    redirect: routeLinks.heartbeats.unhealthy.link,
    children: [
      {
        title: "Unhealthy Endpoints",
        path: routeLinks.heartbeats.unhealthy.link,
        component: () => import("@/components/heartbeats/UnhealthyEndpoints.vue"),
      },
      {
        title: "Healthy Endpoints",
        path: routeLinks.heartbeats.healthy.link,
        component: () => import("@/components/heartbeats/HealthyEndpoints.vue"),
      },
      {
        title: "Heartbeat Configuration",
        path: routeLinks.heartbeats.configuration.link,
        component: () => import("@/components/heartbeats/HeartbeatConfiguration.vue"),
      },
    ],
  },
  {
    path: routeLinks.messages.root,
    component: AuditView,
    title: "All Messages",
  },
  {
    path: routeLinks.failedMessage.root,
    component: FailedMessagesView,
    title: "Failed Messages",
    redirect: routeLinks.failedMessage.failedMessagesGroups.link,
    children: [
      {
        title: "Failed Message Groups",
        path: routeLinks.failedMessage.failedMessagesGroups.template,
        component: () => import("@/components/failedmessages/FailedMessageGroups.vue"),
      },
      {
        path: routeLinks.failedMessage.failedMessages.template,
        title: "All Failed Messages",
        component: () => import("@/components/failedmessages/FailedMessages.vue"),
      },
      {
        path: routeLinks.failedMessage.deletedMessagesGroup.template,
        title: "Deleted Message Groups",
        component: () => import("@/components/failedmessages/DeletedMessageGroups.vue"),
      },
      {
        path: routeLinks.failedMessage.deletedMessages.template,
        title: "All Deleted Messages",
        component: () => import("@/components/failedmessages/DeletedMessages.vue"),
      },
      {
        path: routeLinks.failedMessage.pendingRetries.template,
        title: "Pending Retries",
        component: () => import("@/components/failedmessages/PendingRetries.vue"),
      },
      {
        title: "Failed Messages",
        path: routeLinks.failedMessage.group.template,
        component: () => import("@/components/failedmessages/FailedMessages.vue"),
      },
      {
        title: "Deleted Messages",
        path: routeLinks.failedMessage.deletedGroup.template,
        component: () => import("@/components/failedmessages/DeletedMessages.vue"),
      },
      {
        path: routeLinks.failedMessage.message.template,
        title: "Message",
        redirect: routeLinks.messages.failedMessage.template,
      },
    ],
  },
  {
    path: routeLinks.messages.failedMessage.template,
    title: "Message",
    component: () => import("@/components/messages/MessageView.vue"),
  },
  {
    path: routeLinks.messages.successMessage.template,
    title: "Message",
    component: () => import("@/components/messages/MessageView.vue"),
  },
  {
    path: routeLinks.monitoring.root,
    component: MonitoringView,
    title: "Monitored Endpoints",
  },
  {
    path: routeLinks.monitoring.endpointDetails.template,
    component: () => import("@/components/monitoring/EndpointDetails.vue"),
    title: "Endpoint Details",
  },
  {
    path: routeLinks.customChecks,
    title: "Custom checks",
    component: CustomChecksView,
  },
  {
    path: routeLinks.events,
    component: EventsView,
    title: "Events",
  },
  {
    path: routeLinks.throughput.root,
    component: ThroughputReportView,
    title: "Usage",
    redirect: routeLinks.throughput.queues.root,
    children: [
      {
        title: "Endpoints",
        path: routeLinks.throughput.queues.root,
        redirect: routeLinks.throughput.queues.detectedEndpoints.link,
        component: () => import("@/views/throughputreport/EndpointsView.vue"),
        children: [
          {
            title: "Detected Endpoint Queues",
            path: routeLinks.throughput.queues.detectedEndpoints.template,
            component: () => import("@/views/throughputreport/queues/DetectedEndpointsView.vue"),
          },
          {
            title: "Detected Broker Queues",
            path: routeLinks.throughput.queues.detectedBrokerQueues.template,
            component: () => import("@/views/throughputreport/queues/DetectedBrokerQueuesView.vue"),
          },
        ],
      },
      {
        title: "License Details",
        path: routeLinks.throughput.licenseDetails.root,
        redirect: routeLinks.throughput.licenseDetails.licensedEndpoints.link,
        component: () => import("@/views/throughputreport/EndpointsView.vue"),
        children: [
          {
            title: "License Details",
            path: routeLinks.throughput.licenseDetails.root,
            redirect: routeLinks.throughput.licenseDetails.licensedEndpoints.link,
            component: () => import("@/views/throughputreport/licenseDetails/LicenseDetails.vue"),
            children: [
              {
                title: "Licensed Endpoints",
                path: routeLinks.throughput.licenseDetails.licensedEndpoints.template,
                component: () => import("@/views/throughputreport/licenseDetails/LicensedEndpointsView.vue"),
              },
              {
                title: "Infrastructure Queues",
                path: routeLinks.throughput.licenseDetails.infrastructureQueues.template,
                component: () => import("@/views/throughputreport/licenseDetails/InfrastructureQueuesView.vue"),
              },
              {
                title: "Excluded Queues",
                path: routeLinks.throughput.licenseDetails.excludedQueues.template,
                component: () => import("@/views/throughputreport/licenseDetails/ExcludedQueuesView.vue"),
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: routeLinks.configuration.root,
    title: "Configuration",
    component: ConfigurationView,
    redirect: routeLinks.configuration.license.link,
    children: [
      {
        title: "License",
        path: routeLinks.configuration.license.template,
        component: () => import("@/components/configuration/PlatformLicense.vue"),
      },
      {
        title: "MassTransit Connector",
        path: routeLinks.configuration.massTransitConnector.template,
        component: () => import("@/components/configuration/MassTransitConnector.vue"),
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
      {
        title: "Usage Setup",
        path: routeLinks.throughput.setup.root,
        redirect: routeLinks.throughput.setup.connectionSetup.link,
        component: () => import("@/views/throughputreport/SetupView.vue"),
        children: [
          {
            title: "Connection Setup",
            path: routeLinks.throughput.setup.connectionSetup.template,
            component: () => import("@/views/throughputreport/setup/ConnectionSetupView.vue"),
          },
          {
            title: "Mask Report Data",
            path: routeLinks.throughput.setup.mask.template,
            component: () => import("@/views/throughputreport/setup/MasksView.vue"),
          },
          {
            title: "Diagnostics",
            path: routeLinks.throughput.setup.diagnostics.template,
            component: () => import("@/views/throughputreport/setup/DiagnosticsView.vue"),
          },
        ],
      },
    ],
  },
];

export default config;
