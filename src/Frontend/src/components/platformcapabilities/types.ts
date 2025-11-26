import { CapabilityStatus } from "./constants";

export interface StatusIndicator {
  label: string;
  status: CapabilityStatus;
  tooltip: string;
}

export interface WizardImage {
  src: string;
  caption?: string;
  maxHeight?: string;
}

export interface WizardPage {
  title: string;
  content: string;
  image?: string | WizardImage;
  images?: (string | WizardImage)[];
  learnMoreUrl?: string;
  learnMoreText?: string;
}
