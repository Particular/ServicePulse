import { createCapabilityCardHelpers } from "./capabilityCardHelpers";

// Create helpers using factory
const helpers = createCapabilityCardHelpers({
  title: "Recoverability",
  actionButtonPattern: /Learn More|View Failed Messages/i,
  statusBadgePattern: /Available|Unavailable/,
});

// Export individual functions for backwards compatibility
export const recoverabilityCapabilityCard = helpers.card;
export const recoverabilityCapabilityCardSync = helpers.cardSync;
export const recoverabilityStatusBadge = helpers.statusBadge;
export const recoverabilityActionButton = helpers.actionButton;
export const recoverabilityStatusIndicators = helpers.statusIndicators;
export const isRecoverabilityCardAvailable = helpers.isAvailable;
export const isRecoverabilityCardUnavailable = helpers.isUnavailable;
export const recoverabilityIndicatorByLabel = helpers.indicatorByLabel;
