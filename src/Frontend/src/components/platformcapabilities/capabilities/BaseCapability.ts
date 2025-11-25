import { type ComputedRef } from "vue";
import { faCheck, faInfoCircle, faTimes, faExclamationTriangle, type IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { CapabilityStatus, type StatusIndicator } from "@/components/platformcapabilities/types";

export interface CapabilityComposable {
  status: ComputedRef<CapabilityStatus>;
  icon: ComputedRef<IconDefinition>;
  description: ComputedRef<string>;
  indicators: ComputedRef<StatusIndicator[]>;
  isLoading: ComputedRef<boolean>;
  helpButtonText: ComputedRef<string>;
  helpButtonUrl: ComputedRef<string>;
}

export type CapabilityStatusToStringMap = Partial<Record<CapabilityStatus, string>>;

export function useCapabilityBase() {
  const getIconForStatus = (status: CapabilityStatus): IconDefinition => {
    switch (status) {
      case CapabilityStatus.Available:
        return faCheck;
      case CapabilityStatus.EndpointsNotConfigured:
      case CapabilityStatus.InstanceNotConfigured:
        return faInfoCircle;
      case CapabilityStatus.Unavailable:
        return faTimes;
      case CapabilityStatus.PartiallyUnavailable:
        return faExclamationTriangle; // Warning icon for partially unavailable
    }
  };

  const getDescriptionForStatus = (status: CapabilityStatus, descriptions: CapabilityStatusToStringMap): string => {
    return descriptions[status] ?? "";
  };

  const getHelpButtonTextForStatus = (status: CapabilityStatus, helpButtonTexts: CapabilityStatusToStringMap): string => {
    return helpButtonTexts[status] || "Learn More";
  };

  const getHelpButtonUrlForStatus = (status: CapabilityStatus, helpButtonUrls: CapabilityStatusToStringMap): string => {
    return helpButtonUrls[status] || "#/dashboard";
  };

  const createIndicator = (label: string, status: CapabilityStatus, tooltip: string, url?: string, version?: string): StatusIndicator => {
    let fullTooltip = tooltip;
    if (url) {
      fullTooltip = `${fullTooltip} - ${url}`;
    }
    if (version && version !== "Unknown") {
      fullTooltip = `${fullTooltip} - v${version}`;
    }
    return {
      label,
      status,
      tooltip: fullTooltip,
    };
  };

  return {
    getIconForStatus,
    getDescriptionForStatus,
    getHelpButtonTextForStatus,
    getHelpButtonUrlForStatus,
    createIndicator,
  };
}
