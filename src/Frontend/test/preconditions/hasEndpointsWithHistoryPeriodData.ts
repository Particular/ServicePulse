import * as historyPeriodTemplate from "../mocks/history-period-template";
import { SetupFactoryOptions } from "../driver";

export const hasEndpointWithMetricsPoints =
  (historyPeriod: number, queueLength: number | number[], throughput: number | number[], retries: number | number[], processingTime: number | number[], criticalTime: number | number[]) =>
  ({ driver }: SetupFactoryOptions) => {
    const body = historyPeriodTemplate.oneEndpointWithMetricsPoints(queueLength, throughput, retries, processingTime, criticalTime);
    //console.log(`Mocked Endpoint: ${window.defaultConfig.monitoring_urls[0]}monitored-endpoints?history=${historyPeriod}`);
    driver.mockEndpoint(`${window.defaultConfig.monitoring_urls[0]}monitored-endpoints`, {
      body: foo(body, historyPeriod, queueLength, throughput, retries, processingTime, criticalTime),
    });
    return [body];
  };

const foo = (body: any, historyPeriod: number, queueLength: number | number[], throughput: number | number[], retries: number | number[], processingTime: number | number[], criticalTime: number | number[]) => {
  console.log(
    `Mocked Endpoint: ${window.defaultConfig.monitoring_urls[0]}monitored-endpoints?history=${historyPeriod}, queueLength: ${queueLength}, throughput: ${throughput}, retries: ${retries}, processingTime: ${processingTime}, criticalTime: ${criticalTime}`
  );
  return body;
};
