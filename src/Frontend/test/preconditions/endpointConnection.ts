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
        HeartbeatsQueue: "Particular.ServiceControl@XXX",
        Frequency: "00:00:10",
        TimeToLive: "00:00:40",
      },
      CustomChecks: {
        Enabled: true,
        CustomChecksQueue: "Particular.ServiceControl@XXX",
      },
      ErrorQueue: "error",
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
      body: {
        settings: defaultSettings,
        errors: [],
      } as any as ServiceControlInstanceConnection,
    });
  };
export const hasMonitoringConnection =
  (settings: Partial<MetricsConnectionDetails> = {}) =>
  ({ driver }: SetupFactoryOptions) => {
    const monitoringUrl = window.defaultConfig.monitoring_urls[0];

    const defaultSettings: MetricsConnectionDetails = {
      Enabled: true,
      MetricsQueue: "Particular.Monitoring",
      Interval: "00:00:01",
      ...settings,
    };

    driver.mockEndpoint(`${monitoringUrl}connection`, {
      body: {
        Metrics: defaultSettings,
        errors: [],
      },
    });
  };
