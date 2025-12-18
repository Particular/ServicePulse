import { WizardPage } from "../types";
import { CapabilityStatus } from "../constants";
import WhatIsMonitoring from "./monitoring/WhatIsMonitoring.vue";
import OverallPerformanceMetrics from "./monitoring/OverallPerformanceMetrics.vue";
import LogicalEndpointMonitoring from "./monitoring/LogicalEndpointMonitoring.vue";
import PhysicalEndpointMonitoring from "./monitoring/PhysicalEndpointMonitoring.vue";
import SetupMonitoringInstance from "./monitoring/SetupMonitoringInstance.vue";
import InstallMonitoringPlugin from "./monitoring/InstallMonitoringPlugin.vue";
import ConfigureMonitoringEndpoints from "./monitoring/ConfigureMonitoringEndpoints.vue";
import VerifyMonitoringSetup from "./monitoring/VerifyMonitoringSetup.vue";

const MonitoringInstanceNotConfiguredPages: WizardPage[] = [
  {
    title: "What is Monitoring?",
    content: WhatIsMonitoring,
    images: [{ src: "/img/servicepulse-monitoring-tab.png", caption: "Real-time Performance Metrics" }],
    learnMoreUrl: "https://docs.particular.net/monitoring/",
    learnMoreText: "Learn more about monitoring",
  },
  {
    title: "Overall Performance Metrics",
    content: OverallPerformanceMetrics,
    images: [{ src: "/img/servicepulse-monitoring-tab.png", caption: "Real-time Performance Metrics" }],
    learnMoreUrl: "https://docs.particular.net/monitoring/metrics/definitions",
    learnMoreText: "Learn about metric definitions",
  },
  {
    title: "Logical Endpoint Monitoring",
    content: LogicalEndpointMonitoring,
    images: [{ src: "/img/servicepulse-monitoring-details.png", caption: "Logical Endpoint Monitoring" }],
    learnMoreUrl: "https://docs.particular.net/monitoring/metrics/in-servicepulse",
    learnMoreText: "Learn about endpoint monitoring",
  },
  {
    title: "Physical Endpoint Monitoring",
    content: PhysicalEndpointMonitoring,
    images: [{ src: "/img/servicepulse-physicalinstance-breakdown.png", caption: "Physical Endpoint Monitoring" }],
    learnMoreUrl: "https://docs.particular.net/monitoring/metrics/in-servicepulse",
    learnMoreText: "Learn about instance monitoring",
  },
  {
    title: "Setup ServiceControl Monitoring Instance",
    content: SetupMonitoringInstance,
    images: [{ src: "/img/monitor-instance-overview.png", caption: "NServiceBus Monitoring Architecture" }],
    learnMoreUrl: "https://docs.particular.net/servicecontrol/monitoring-instances/deployment/",
    learnMoreText: "Learn about deploying monitoring instances",
  },
];

const MonitoringEndpointsNotConfiguredPages: WizardPage[] = [
  {
    title: "Install the Monitoring Plugin",
    content: InstallMonitoringPlugin,
    learnMoreUrl: "https://docs.particular.net/monitoring/metrics/install-plugin",
    learnMoreText: "Learn how to install the plugin",
  },
  {
    title: "Configure Your Endpoints",
    content: ConfigureMonitoringEndpoints,
    learnMoreUrl: "https://docs.particular.net/monitoring/metrics/install-plugin#configuration",
    learnMoreText: "View configuration options",
  },
  {
    title: "Verify Your Setup",
    content: VerifyMonitoringSetup,
    learnMoreUrl: "https://docs.particular.net/servicecontrol/troubleshooting",
    learnMoreText: "Troubleshooting guide",
  },
];

export function getMonitoringWizardPages(status: CapabilityStatus): WizardPage[] {
  switch (status) {
    case CapabilityStatus.InstanceNotConfigured:
      return MonitoringInstanceNotConfiguredPages;
    case CapabilityStatus.EndpointsNotConfigured:
      return MonitoringEndpointsNotConfiguredPages;
    default:
      return [];
  }
}
