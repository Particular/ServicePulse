import { WizardPage } from "../types";
import { CapabilityStatus } from "../constants";

const MonitoringInstanceNotConfiguredPages: WizardPage[] = [
  {
    title: "What is Monitoring?",
    content: `
      <p>Monitoring gives you real-time visibility into your NServiceBus system performance:</p>
      <ul>
        <li><strong>Overall Performance metrics</strong> - Understand how your endpoints are performing</li>
        <li><strong>Logical Endpoint Monitoring</strong> - View aggregated metrics across all instances of an endpoint</li>
        <li><strong>Physical Endpoint Monitoring</strong> - Drill down into individual endpoint instances for detailed metrics</li>
      </ul>
    `,
    images: [{ src: "/img/servicepulse-monitoring-tab.png", caption: "Real-time Performance Metrics" }],
    learnMoreUrl: "https://docs.particular.net/monitoring/",
    learnMoreText: "Learn more about monitoring",
  },
  {
    title: "Overall Performance Metrics",
    content: `
      <p>Get detailed insights into your endpoint performance with real-time metrics:</p>
      <ul>
        <li><strong>Throughput</strong> - Messages processed per second for each endpoint</li>
        <li><strong>Processing time</strong> - Average time to handle each message type</li>
        <li><strong>Queue length</strong> - Current number of messages waiting to be processed</li>
        <li><strong>Critical time</strong> - Total time from message send to processing completion</li>
      </ul>
    `,
    images: [{ src: "/img/servicepulse-monitoring-tab.png", caption: "Real-time Performance Metrics" }],
    learnMoreUrl: "https://docs.particular.net/monitoring/metrics/definitions",
    learnMoreText: "Learn about metric definitions",
  },
  {
    title: "Logical Endpoint Monitoring",
    content: `
      <p>Monitor your logical endpoints to understand how each service in your system is performing:</p>
      <ul>
        <li><strong>Endpoint details</strong> - See your logical endpoint at a glance</li>
        <li><strong>Aggregated metrics</strong> - View combined metrics across all instances of an endpoint</li>
        <li><strong>Throughput trends</strong> - Track message processing rates over time</li>
        <li><strong>Health indicators</strong> - Quickly identify endpoints that need attention</li>
      </ul>
    `,
    images: [{ src: "/img/servicepulse-monitoring-details.png", caption: "Logical Endpoint Monitoring" }],
    learnMoreUrl: "https://docs.particular.net/monitoring/metrics/in-servicepulse",
    learnMoreText: "Learn about endpoint monitoring",
  },
  {
    title: "Physical Endpoint Monitoring",
    content: `
      <p>Drill down into individual endpoint instances for detailed performance analysis:</p>
      <ul>
        <li><strong>Instance-level metrics</strong> - See performance data for each running instance</li>
        <li><strong>Compare instances</strong> - Identify performance variations between instances</li>
        <li><strong>Resource utilization</strong> - Understand how each instance is handling its workload</li>
        <li><strong>Scaling insights</strong> - Make informed decisions about scaling your endpoints</li>
      </ul>
    `,
    images: [{ src: "/img/servicepulse-physicalinstance-breakdown.png", caption: "Physical Endpoint Monitoring" }],
    learnMoreUrl: "https://docs.particular.net/monitoring/metrics/in-servicepulse",
    learnMoreText: "Learn about instance monitoring",
  },
  {
    title: "Setup ServiceControl Monitoring Instance",
    content: `
      <p>To enable monitoring in ServicePulse, you need to set up a ServiceControl Monitoring instance. There are multiple ways to do this:</p>
      <ul>
        <li><strong><a href="https://docs.particular.net/servicecontrol/monitoring-instances/deployment/powershell" target="_blank">Scripted Deployment</a></strong> - Use a script to automate the installation and configuration of the monitoring instance</li>
        <li><strong><a href="https://docs.particular.net/servicecontrol/monitoring-instances/deployment/containers" target="_blank">Containers</a></strong> - Run the monitoring instance inside a container</li>
        <li><strong><a href="https://docs.particular.net/servicecontrol/monitoring-instances/deployment/scmu" target="_blank">ServiceControl Management Utility</a></strong> - Use the management utility to create and configure the monitoring instance</li>
      </ul>
      <p>The monitoring instance collects and aggregates metrics from your endpoints.</p>
    `,
    images: [{ src: "/img/monitor-instance-overview.png", caption: "NServiceBus Monitoring Architecture" }],
    learnMoreUrl: "https://docs.particular.net/servicecontrol/monitoring-instances/deployment/",
    learnMoreText: "Learn about deploying monitoring instances",
  },
];

const MonitoringEndpointsNotConfiguredPages: WizardPage[] = [
  {
    title: "Install the Monitoring Plugin",
    content: `
      <p>Your ServiceControl Monitoring instance is connected, but no endpoints are sending metrics yet.</p>
      <p>To see metrics in ServicePulse, install the monitoring plugin in your NServiceBus endpoints:</p>
      <ul>
        <li><strong>Add the NuGet package</strong> - Install <code>NServiceBus.Metrics.ServiceControl</code></li>
        <li><strong>Configure the plugin</strong> - Point it to your monitoring instance</li>
        <li><strong>Deploy your changes</strong> - Restart endpoints with the new configuration</li>
      </ul>
    `,
    learnMoreUrl: "https://docs.particular.net/monitoring/metrics/install-plugin",
    learnMoreText: "Learn how to install the plugin",
  },
  {
    title: "Configure Your Endpoints",
    content: `
      <p>Add the metrics plugin to your endpoint configuration:</p>
      <pre>
    <code>var metrics = endpointConfiguration.EnableMetrics();
      metrics.SendMetricDataToServiceControl(
        serviceControlMetricsAddress: SERVICE_CONTROL_METRICS_ADDRESS,
        interval: TimeSpan.FromMinutes(1),
        instanceId: "INSTANCE_ID_OPTIONAL");</code></pre>
      <p>Make sure the queue name matches your ServiceControl Monitoring instance queue.</p>
    `,
    learnMoreUrl: "https://docs.particular.net/monitoring/metrics/install-plugin#configuration",
    learnMoreText: "View configuration options",
  },
  {
    title: "Verify Your Setup",
    content: `
      <p>Once configured:</p>
      <ul>
        <li><strong>Start your endpoints</strong> - Metrics will begin flowing immediately</li>
        <li><strong>Check this capability card</strong> - it will automatically update when metrics are detected</li>
        <li><strong>View the Monitoring tab</strong> to see real-time performance data</li>
      </ul>
      <p>Metrics are sent at regular intervals (default: every 10 seconds), so you should see data appear within a minute.</p>
    `,
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
