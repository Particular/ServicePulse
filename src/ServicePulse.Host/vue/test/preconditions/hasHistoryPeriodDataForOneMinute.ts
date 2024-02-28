import content from "../mocks/historyPeriodForOneMinute.json";
import {SetupFactoryOptions} from '../driver'

export const hasHistoryPeriodDataForOneMinute = ({ driver }: SetupFactoryOptions) => {
  driver.mockEndpoint(`http://localhost:33633/monitored-endpoints?history=1`, {
    body: content,
  });
  return content;
};
