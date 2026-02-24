import { SetupFactoryOptions } from "../driver";
import { ServiceControlInstanceConnection } from "@/components/serviceControlClient";
import { MetricsConnectionDetails } from "@/components/monitoring/monitoringClient";

export const hasServiceControlConnection =
  (settings: Partial<ServiceControlInstanceConnection["settings"]> = {}) =>
  ({ driver }: SetupFactoryOptions) => {
    const serviceControlUrl = window.defaultConfig.service_control_url;

    const defaultSettings = {
      Heartbeats: {
        Enabled: true,
        HeartbeatsQueue: "Particular.ServiceControl.Heartbeats",
        HeartbeatsInterval: "00:00:30",
      },
      CustomChecks: {
        Enabled: true,
        CustomChecksQueue: "Particular.ServiceControl.CustomChecks",
      },
      ErrorQueue: {
        Enabled: true,
        ErrorQueue: "error",
      },
      SagaAudit: {
        Enabled: true,
        SagaAuditQueue: "audit",
      },
      MessageAudit: {
        Enabled: true,
        AuditQueue: "audit",
      },
      ...settings,
    };

    driver.mockEndpoint(`${serviceControlUrl}connection`, {
      body: <ServiceControlInstanceConnection>{
        settings: defaultSettings,
        errors: [],
      },
    });
  };

export const hasMonitoringConnection =
  (settings: Partial<MetricsConnectionDetails> = {}) =>
  ({ driver }: SetupFactoryOptions) => {
    const monitoringUrl = window.defaultConfig.monitoring_urls[0];

    const defaultSettings: MetricsConnectionDetails = {
      Enabled: true,
      MetricsQueue: "Particular.Monitoring",
      Interval: "00:00:30",
      ...settings,
    };

    driver.mockEndpoint(`${monitoringUrl}connection`, {
      body: {
        Metrics: defaultSettings,
        errors: [],
      },
    });
  };
