import type { WizardPage } from "../WizardDialog.vue";
import { CapabilityStatus } from "../types";

const AuditingInstanceNotConfiguredPages: WizardPage[] = [
  {
    title: "What is Auditing?",
    content: `
      <p>Auditing captures a copy of every successful message processed by your NServiceBus endpoints, allowing you to:</p>
      <ul>
        <li><strong>Track message flow</strong> - See the complete journey of messages through your system</li>
        <li><strong>Debug issues</strong> - Inspect message contents and headers for troubleshooting</li>
        <li><strong>Analyze patterns</strong> - Understand how your system processes messages over time</li>
      </ul>
    `,
    learnMoreUrl: "https://docs.particular.net/nservicebus/operations/auditing",
    learnMoreText: "Learn more about auditing",
  },
  {
    title: "Set Up ServiceControl Audit Instance",
    content: `
      <p>To enable auditing in ServicePulse, you need to set up a ServiceControl Audit instance:</p>
      <ul>
        <li><strong>Step 1:</strong> Download and install ServiceControl</li>
        <li><strong>Step 2:</strong> Run the ServiceControl Management utility</li>
        <li><strong>Step 3:</strong> Create a new Audit instance and configure its transport</li>
        <li><strong>Step 4:</strong> Connect ServicePulse to your ServiceControl instance</li>
      </ul>
      <p>The audit instance stores processed messages and makes them available for viewing in ServicePulse.</p>
    `,
    learnMoreUrl: "https://docs.particular.net/servicecontrol/audit-instances/",
    learnMoreText: "View setup guide",
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
