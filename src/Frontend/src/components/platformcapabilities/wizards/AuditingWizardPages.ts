import type { WizardPage } from "../WizardDialog.vue";
import { CapabilityStatus } from "../types";

const AuditingInstanceNotConfiguredPages: WizardPage[] = [
  {
    title: "What is Auditing?",
    content: `
      <p>Auditing captures a copy of every successful message processed by your NServiceBus endpoints, allowing you to:</p>
      <ul>
        <li><strong>Display and discover messages</strong> - View processed messages in your system</li>
        <li><strong>Track message flow</strong> - See the complete journey of messages through your system</li>
        <li><strong>View the sequence of events</strong> - Understand how messages are processed over time</li>
        <li><strong>Visualize saga state</strong> - Monitor and debug your saga workflows</li>
        <li><strong>Debug issues</strong> - Inspect message contents and headers for troubleshooting</li>
      </ul>
    `,
    images: [{ src: "/img/all-messages.png", caption: "Display and Discover Messages" }],
    learnMoreUrl: "https://docs.particular.net/nservicebus/operations/auditing",
    learnMoreText: "Learn more about auditing",
  },
  {
    title: "Display and Discover Messages",
    content: `
      <p>Browse and search through all processed messages in your system:</p>
      <ul>
        <li><strong>Message List</strong> - View all messages in a searchable list</li>
        <li><strong>Advanced Filtering</strong> - Filter messages by endpoint, time range, and more</li>
        <li><strong>Full-text Search</strong> - Search message contents to find specific data</li>
        <li><strong>Sorting Options</strong> - Sort by time processed, endpoint, or message type</li>
        <li><strong>Auto Refresh</strong> - Keep your message list up to date with the latest processed messages</li>
      </ul>
    `,
    images: [
      { src: "/img/all-messages-filter.png", caption: "Advanced Filtering and full-text search" },
      { src: "/img/all-messages-sort.png", caption: "Sorting Options" },
      { src: "/img/all-messages-refresh.png", caption: "Auto Refresh" },
    ],
    learnMoreUrl: "https://docs.particular.net/servicepulse/all-messages",
    learnMoreText: "Learn about message discovery",
  },
  {
    title: "Track Message Flow",
    content: `
      <p>Follow the complete journey of messages through your distributed system:</p>
      <ul>
        <li><strong>Conversation tracking</strong> - See all related messages grouped together by conversation ID</li>
        <li><strong>Message timeline</strong> - View the sequence of events as messages flow between endpoints</li>
        <li><strong>Endpoint mapping</strong> - Understand which endpoints send and receive each message type</li>
        <li><strong>Flow visualization</strong> - Get a clear picture of your system's message-based interactions</li>
      </ul>
    `,
    images: [
      { src: "/img/flow-diagram.png", caption: "Track Message Flow" },
      { src: "/img/flow-diagram-nodes.png", caption: "Message Nodes", maxHeight: "600px" },
    ],
    learnMoreUrl: "https://docs.particular.net/servicepulse/flow-diagram",
    learnMoreText: "Learn about message tracking",
  },
  {
    title: "View the Sequence of Events",
    content: `
      <p>Understand the order and timing of message processing with sequence diagrams:</p>
      <ul>
        <li><strong>Timeline view</strong> - See messages arranged chronologically as they were processed</li>
        <li><strong>Endpoint interactions</strong> - Visualize how endpoints communicate with each other</li>
        <li><strong>Handler execution</strong> - Track which handlers processed each message</li>
      </ul>
    `,
    images: [{ src: "/img/sequence-diagram.png" }],
    learnMoreUrl: "https://docs.particular.net/servicepulse/sequence-diagram",
    learnMoreText: "Learn about sequence diagrams",
  },
  {
    title: "Visualize Workflow State",
    content: `
      <p>Monitor and debug your saga workflows with saga diagrams:</p>
      <ul>
        <li><strong>Saga lifecycle</strong> - View the complete history of a saga from start to completion</li>
        <li><strong>State changes</strong> - Track how saga state evolves as messages are processed</li>
        <li><strong>Message correlation</strong> - See which messages initiated and updated the saga</li>
        <li><strong>Timeout tracking</strong> - Monitor saga timeouts and their triggers</li>
      </ul>
    `,
    images: [
      { src: "/img/saga-diagram-overview.png", caption: "Saga Lifecycle" },
      { src: "/img/saga-diagram-state-change.png", caption: "Saga State Changes" },
      { src: "/img/saga-diagram-timeout-view.png", caption: "Timeout Tracking" },
    ],
    learnMoreUrl: "https://docs.particular.net/servicepulse/saga-diagram",
    learnMoreText: "Learn about saga diagrams",
  },
  {
    title: "Debug Issues",
    content: `
      <p>Inspect message details to troubleshoot problems in your system:</p>
      <ul>
        <li><strong>Message headers</strong> - View all metadata including timestamps, correlation IDs, and custom headers</li>
        <li><strong>Message body</strong> - Examine the full payload content of each message</li>
        <li><strong>Processing details</strong> - See which endpoint processed the message and when</li>
        <li><strong>Header Search</strong> - Quickly find specific message headers</li>
      </ul>
    `,
    images: [
      { src: "/img/message-details-headers.png", caption: "Message Headers" },
      { src: "/img/message-details-body.png", caption: "Message Body" },
      { src: "/img/message-metadata.png", caption: "Processing Details" },
    ],
    learnMoreUrl: "https://docs.particular.net/servicepulse/message-details",
    learnMoreText: "Learn about message inspection",
  },
  {
    title: "Setup ServiceControl Audit Instance",
    content: `
      <p>To enable auditing in ServicePulse, you need to setup a ServiceControl Audit instance. There are multiple ways to do this:</p>
      <ul>
        <li><strong><a href="https://docs.particular.net/servicecontrol/audit-instances/deployment/powershell" target="_blank">Scripted Deployment</a></strong> - Use a script to automate the installation and configuration of the audit instance</li>
        <li><strong><a href="https://docs.particular.net/servicecontrol/audit-instances/deployment/containers" target="_blank">Containers</a></strong> - Run the audit instance inside a container</li>
        <li><strong><a href="https://docs.particular.net/servicecontrol/audit-instances/deployment/scmu" target="_blank">ServiceControl Management Utility</a></strong> - Use the management utility to create and configure the audit instance</li>
      </ul>
      <p>The audit instance stores processed messages and makes them available for viewing in ServicePulse.</p>
    `,
    images: [{ src: "/img/audit-instance-overview.png", caption: "ServiceControl Audit Instance Architecture" }],
    learnMoreUrl: "https://docs.particular.net/servicecontrol/audit-instances/deployment/",
    learnMoreText: "Learn about deploying audit instances",
  },
];

const AuditingUnavailablePages: WizardPage[] = [
  {
    title: "Audit Instance Unavailable",
    content: `
      <p>ServicePulse cannot connect to your ServiceControl Audit instance. This could be due to:</p>
      <ul>
        <li><strong>Service not running</strong> - The ServiceControl Audit service may have stopped</li>
        <li><strong>Network issues</strong> - There may be connectivity problems between ServicePulse and ServiceControl</li>
        <li><strong>Configuration mismatch</strong> - The URL configured in ServicePulse may be incorrect</li>
      </ul>
    `,
    learnMoreUrl: "https://docs.particular.net/servicecontrol/troubleshooting",
    learnMoreText: "View troubleshooting guide",
  },
  {
    title: "Check the Service Status",
    content: `
      <p>To resolve this issue, try the following steps:</p>
      <ul>
        <li><strong>Step 1:</strong> Open Windows Services and check if the ServiceControl Audit service is running</li>
        <li><strong>Step 2:</strong> If stopped, try starting the service</li>
        <li><strong>Step 3:</strong> Check the ServiceControl Audit logs for any errors</li>
        <li><strong>Step 4:</strong> Verify the audit instance URL in your ServicePulse configuration</li>
      </ul>
      <p>Logs are typically located in the ServiceControl installation directory under the Logs folder.</p>
    `,
    learnMoreUrl: "https://docs.particular.net/servicecontrol/logging",
    learnMoreText: "Learn about ServiceControl logging",
  },
  {
    title: "Verify Your Configuration",
    content: `
      <p>Ensure ServicePulse is configured with the correct audit instance URL:</p>
      <ul>
        <li><strong>Check the URL</strong> - Verify the ServiceControl Audit API URL is correct</li>
        <li><strong>Test connectivity</strong> - Try accessing the API URL directly in a browser</li>
        <li><strong>Check firewall rules</strong> - Ensure the port is accessible</li>
      </ul>
      <p>Once the service is running and accessible, this page will automatically update.</p>
    `,
    learnMoreUrl: "https://docs.particular.net/servicecontrol/audit-instances/",
    learnMoreText: "View configuration guide",
  },
];

const AuditingEndpointsNotConfiguredPages: WizardPage[] = [
  {
    title: "Enable Auditing for Your Endpoints",
    content: `
      <p>Your ServiceControl Audit instance is connected, but no endpoints are sending audit messages yet.</p>
      <p>To see messages in ServicePulse, you need to enable auditing in your NServiceBus endpoints:</p>
      <ul>
        <li><strong>Configure the audit queue</strong> - Tell your endpoints where to send audit copies</li>
        <li><strong>Deploy your changes</strong> - Restart endpoints with the new configuration</li>
        <li><strong>Process some messages</strong> - Send test messages to verify auditing works</li>
      </ul>
    `,
    learnMoreUrl: "https://docs.particular.net/nservicebus/operations/auditing",
    learnMoreText: "Learn how to configure auditing",
  },
  {
    title: "Configure Your Endpoints",
    content: `
      <p>Add auditing configuration to your endpoint setup code:</p>
      <p><code>endpointConfiguration.AuditProcessedMessagesTo("audit");</code></p>
      <p>Or configure via app settings:</p>
      <p><code>&lt;add key="ServiceControl/Queue" value="audit" /&gt;</code></p>
      <p>Make sure the audit queue name matches what your ServiceControl Audit instance is monitoring.</p>
    `,
    learnMoreUrl: "https://docs.particular.net/nservicebus/operations/auditing#configuring-auditing",
    learnMoreText: "View configuration options",
  },
  {
    title: "Verify Your Setup",
    content: `
      <p>Once configured:</p>
      <ul>
        <li><strong>Send a test message</strong> through one of your endpoints</li>
        <li><strong>Check this page</strong> - it will automatically update when messages are detected</li>
        <li><strong>View the Messages tab</strong> to see your processed messages</li>
      </ul>
      <p>If messages still don't appear after a few minutes, check your endpoint logs and ServiceControl logs for any errors.</p>
    `,
    learnMoreUrl: "https://docs.particular.net/servicecontrol/troubleshooting",
    learnMoreText: "Troubleshooting guide",
  },
];

export function getAuditingWizardPages(status: CapabilityStatus): WizardPage[] {
  switch (status) {
    case CapabilityStatus.InstanceNotConfigured:
      return AuditingInstanceNotConfiguredPages;
    case CapabilityStatus.EndpointsNotConfigured:
      return AuditingEndpointsNotConfiguredPages;
    case CapabilityStatus.Unavailable:
      return AuditingUnavailablePages;
    default:
      return [];
  }
}
