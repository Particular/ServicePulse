import content from "../mocks/event-log-items.json";
import {SetupFactoryOptions} from '../driver'

export const hasEventLogItems = ({ driver }: SetupFactoryOptions) => {
  driver.mockEndpoint(`http://localhost:33333/api/eventlogitems`, {
    body: content,
  });
  return content;
};
