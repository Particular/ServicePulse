/// <reference types="vite/client" />

export {};

declare global {
  interface Window {
    defaultConfig: {
      default_route: string;
      base_url: string;
      version: string;
      service_control_url: string;
      monitoring_urls: string;
      showPendingRetry: boolean;
    };
  }
}
