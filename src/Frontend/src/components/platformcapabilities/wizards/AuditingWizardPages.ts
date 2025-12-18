import { CapabilityStatus } from "../constants";
import { WizardPage } from "../types";
import WhatIsAuditing from "./auditing/WhatIsAuditing.vue";
import DisplayAndDiscoverMessages from "./auditing/DisplayAndDiscoverMessages.vue";
import TrackMessageFlow from "./auditing/TrackMessageFlow.vue";
import ViewSequenceOfEvents from "./auditing/ViewSequenceOfEvents.vue";
import VisualizeWorkflowState from "./auditing/VisualizeWorkflowState.vue";
import DebugIssues from "./auditing/DebugIssues.vue";
import SetupAuditInstance from "./auditing/SetupAuditInstance.vue";
import EnableAuditing from "./auditing/EnableAuditing.vue";
import ConfigureEndpoints from "./auditing/ConfigureEndpoints.vue";
import VerifySetup from "./auditing/VerifySetup.vue";

const AuditingInstanceNotConfiguredPages: WizardPage[] = [
  {
    title: "What is Auditing?",
    content: WhatIsAuditing,
    images: [{ src: "/img/all-messages.png", caption: "Display and Discover Messages" }],
    learnMoreUrl: "https://docs.particular.net/nservicebus/operations/auditing",
    learnMoreText: "Learn more about auditing",
  },
  {
    title: "Display and Discover Messages",
    content: DisplayAndDiscoverMessages,
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
    content: TrackMessageFlow,
    images: [
      { src: "/img/flow-diagram.png", caption: "Track Message Flow" },
      { src: "/img/flow-diagram-nodes.png", caption: "Message Nodes", maxHeight: "600px" },
    ],
    learnMoreUrl: "https://docs.particular.net/servicepulse/flow-diagram",
    learnMoreText: "Learn about message tracking",
  },
  {
    title: "View the Sequence of Events",
    content: ViewSequenceOfEvents,
    images: [{ src: "/img/sequence-diagram.png" }],
    learnMoreUrl: "https://docs.particular.net/servicepulse/sequence-diagram",
    learnMoreText: "Learn about sequence diagrams",
  },
  {
    title: "Visualize Workflow State",
    content: VisualizeWorkflowState,
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
    content: DebugIssues,
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
    content: SetupAuditInstance,
    images: [{ src: "/img/audit-instance-overview.png", caption: "ServiceControl Audit Instance Architecture" }],
    learnMoreUrl: "https://docs.particular.net/servicecontrol/audit-instances/deployment/",
    learnMoreText: "Learn about deploying audit instances",
  },
];

const AuditingEndpointsNotConfiguredPages: WizardPage[] = [
  {
    title: "Enable Auditing for Your Endpoints",
    content: EnableAuditing,
    learnMoreUrl: "https://docs.particular.net/nservicebus/operations/auditing",
    learnMoreText: "Learn how to configure auditing",
  },
  {
    title: "Configure Your Endpoints",
    content: ConfigureEndpoints,
    learnMoreUrl: "https://docs.particular.net/nservicebus/operations/auditing#configuring-auditing",
    learnMoreText: "View configuration options",
  },
  {
    title: "Verify Your Setup",
    content: VerifySetup,
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
    default:
      return [];
  }
}
