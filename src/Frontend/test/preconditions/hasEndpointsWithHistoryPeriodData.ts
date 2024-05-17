import { historyPeriodForOneMinute, historyPeriodFor, oneEndpointWithHistoryPeriodFor } from "../mocks/history-period-template";
import { SetupFactoryOptions } from "../driver";

const monitoringInstanceUrl = window.defaultConfig.monitoring_urls[0];

export const hasHistoryPeriodDataForOneMinute = ({ driver }: SetupFactoryOptions) => {
  console.log("Setting up history period data for one minute");
  console.log(historyPeriodForOneMinute()[0].metrics.processingTime.points[0]);
  driver.mockEndpoint(`${monitoringInstanceUrl}monitored-endpoints?history=1`, {
    body: historyPeriodForOneMinute(),
  });
  return historyPeriodForOneMinute();
};

export const hasOneEndpointWithHistoryPeriodDataFor =
  (historyPeriod: number) =>
  ({ driver }: SetupFactoryOptions) => {
    driver.mockEndpoint(`${monitoringInstanceUrl}monitored-endpoints?history=${historyPeriod}`, {
      body: [oneEndpointWithHistoryPeriodFor(historyPeriod)],
    });
    return [oneEndpointWithHistoryPeriodFor(historyPeriod)];
  };
