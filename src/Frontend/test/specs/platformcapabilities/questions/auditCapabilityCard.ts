import { createCapabilityCardHelpers, platformCapabilitiesSection, platformCapabilitiesCollapsedButton, allCapabilityCards } from "./capabilityCardHelpers";

// Re-export shared helpers
export { platformCapabilitiesSection, platformCapabilitiesCollapsedButton, allCapabilityCards };

// Create helpers using factory
const helpers = createCapabilityCardHelpers({
  title: "Auditing",
  actionButtonPattern: /Learn More|Get Started|View Messages/i,
});

// Export individual functions for backwards compatibility
export const auditingCapabilityCard = helpers.card;
export const auditingCapabilityCardSync = helpers.cardSync;
export const auditingStatusBadge = helpers.statusBadge;
export const auditingDescription = helpers.description;
export const auditingActionButton = helpers.actionButton;
export const auditingStatusIndicators = helpers.statusIndicators;
export const isAuditingCardLoading = helpers.isLoading;
export const auditingLoadingText = helpers.loadingText;
export const isAuditingCardAvailable = helpers.isAvailable;
export const isAuditingCardUnavailable = helpers.isUnavailable;
export const isAuditingCardPartiallyUnavailable = helpers.isPartiallyUnavailable;
export const isAuditingCardNotConfigured = helpers.isNotConfigured;
export const auditingHideButton = helpers.hideButton;
export const auditingIndicatorByLabel = helpers.indicatorByLabel;
