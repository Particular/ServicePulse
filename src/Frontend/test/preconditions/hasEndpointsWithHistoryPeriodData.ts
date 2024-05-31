import * as historyPeriodTemplate from "../mocks/history-period-template";
import { SetupFactoryOptions } from "../driver";

export const hasHistoryPeriodDataForOneMinute = ({ driver }: SetupFactoryOptions) => {
  driver.mockEndpoint(`${window.defaultConfig.monitoring_urls[0]}monitored-endpoints?history=1`, {
    body: historyPeriodTemplate.historyPeriodForOneMinute(),
  });
  return historyPeriodTemplate.historyPeriodForOneMinute();
};

export const hasOneEndpointWithHistoryPeriodDataFor =
  (historyPeriod: number) =>
  ({ driver }: SetupFactoryOptions) => {
    driver.mockEndpoint(`${window.defaultConfig.monitoring_urls[0]}monitored-endpoints?history=${historyPeriod}`, {
      body: [historyPeriodTemplate.oneEndpointWithHistoryPeriodFor(historyPeriod)],
    });
    return [historyPeriodTemplate.oneEndpointWithHistoryPeriodFor(historyPeriod)];
  };

export const hasOneEndpointWithHistoryPeriodDataForOneMinute =
  () =>
  ({ driver }: SetupFactoryOptions) => {
    driver.mockEndpoint(`${window.defaultConfig.monitoring_urls[0]}monitored-endpoints?history=1`, {
      body: historyPeriodTemplate.oneEndpointWithHistoryPeriodForOneMinute(),
    });
    return historyPeriodTemplate.oneEndpointWithHistoryPeriodForOneMinute();
  };

const getEndpointSparklineData = (historyPeriod: number) => {
  switch (historyPeriod) {
    case 1:
      return historyPeriodTemplate.oneEndpointWithSparklineForOneMinute();
    case 5:
      return historyPeriodTemplate.oneEndpointWithSparklineForFiveMinutes();
    case 10:
      return historyPeriodTemplate.oneEndpointWithSparklineForTenMinutes();
    case 15:
      return historyPeriodTemplate.oneEndpointWithSparklineForFifteenMinutes();
    case 30:
      return historyPeriodTemplate.oneEndpointWithSparklineForThirtyMinutes();
    case 60:
      return historyPeriodTemplate.oneEndpointWithSparklineForSixtyMinutes();
    default:
      return [];
  }
};

export const hasOneEndpointWithSparklineDataFor =
  (historyPeriod: number) =>
  ({ driver }: SetupFactoryOptions) => {
    driver.mockEndpoint(`${window.defaultConfig.monitoring_urls[0]}monitored-endpoints?history=${historyPeriod}`, {
      body: getEndpointSparklineData(historyPeriod),
    });
    return [getEndpointSparklineData(historyPeriod)];
  };
