import { createCapabilityCardHelpers } from "./capabilityCardHelpers";

// Create helpers using factory
const helpers = createCapabilityCardHelpers({
  title: "Monitoring",
  actionButtonPattern: /Learn More|Get Started|View Metrics/i,
});

// Export individual functions for backwards compatibility
export const monitoringCapabilityCard = helpers.card;
export const monitoringCapabilityCardSync = helpers.cardSync;
export const monitoringStatusBadge = helpers.statusBadge;
export const monitoringActionButton = helpers.actionButton;
export const monitoringStatusIndicators = helpers.statusIndicators;
export const isMonitoringCardAvailable = helpers.isAvailable;
export const isMonitoringCardUnavailable = helpers.isUnavailable;
export const isMonitoringCardNotConfigured = helpers.isNotConfigured;
export const monitoringIndicatorByLabel = helpers.indicatorByLabel;
