import { WizardPage } from "../types";
import { CapabilityStatus } from "../constants";

const ErrorEndpointsNotConfiguredPages: WizardPage[] = [
  {
    title: "Configure Recoverability",
    content: `
      <p>Your ServiceControl Error instance is connected, but no failed messages have been received yet. This could be because no message processing failures have occurred, endpoints are not configured to send failed messages to ServiceControl, or endpoints are not currently running.</p>
      <p>To ensure failed messages appear in ServicePulse when failures occur, configure recoverability in your NServiceBus endpoints:</p>
      <ul>
        <li><strong>Configure the error queue</strong> - Tell your endpoints where to send failed messages</li>
        <li><strong>Deploy your changes</strong> - Restart endpoints with the new configuration</li>
      </ul>
    `,
    learnMoreUrl: "https://docs.particular.net/nservicebus/recoverability/",
    learnMoreText: "Learn about recoverability",
  },
  {
    title: "Configure Your Endpoints",
    content: `
      <p>Add error queue configuration to your endpoint setup code:</p>
      <p><code>endpointConfiguration.SendFailedMessagesTo("error");</code></p>
      <p>Make sure the error queue name matches what your ServiceControl Error instance is monitoring.</p>
    `,
    learnMoreUrl: "https://docs.particular.net/nservicebus/recoverability/configure-error-handling",
    learnMoreText: "View configuration options",
  },
  {
    title: "Verify Your Setup",
    content: `
      <p>Once configured:</p>
      <ul>
        <li><strong>Trigger a test failure</strong> - Send a message that will fail processing</li>
        <li><strong>Check this capability card</strong> - it will automatically update when failures are detected</li>
        <li><strong>View the Failed Messages tab</strong> to see and manage your failed messages</li>
      </ul>
      <p>If failed messages don't appear after a few minutes, check your endpoint logs and ServiceControl logs for any errors.</p>
    `,
    learnMoreUrl: "https://docs.particular.net/servicecontrol/troubleshooting",
    learnMoreText: "Troubleshooting guide",
  },
];

export function getErrorWizardPages(status: CapabilityStatus): WizardPage[] {
  switch (status) {
    case CapabilityStatus.EndpointsNotConfigured:
      return ErrorEndpointsNotConfiguredPages;
    default:
      return [];
  }
}
