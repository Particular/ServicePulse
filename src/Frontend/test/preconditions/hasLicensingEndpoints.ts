import type { SetupFactoryOptions } from "../driver";
import type QueueThroughputSummary from "@/resources/QueueThroughputSummary";

export const hasLicensingEndpoints =
  (
    body: QueueThroughputSummary[] = [
      <QueueThroughputSummary>{
        name: "Sender",
        is_known_endpoint: true,
        user_indicator: "",
        max_daily_throughput: 10,
      },
    ]
  ) =>
  ({ driver }: SetupFactoryOptions) => {
    driver.mockEndpoint(`${window.defaultConfig.service_control_url}licensing/endpoints`, {
      body,
      method: "get",
      status: 200,
    });
    return [];
  };
