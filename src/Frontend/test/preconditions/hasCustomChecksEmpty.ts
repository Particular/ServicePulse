//import CustomCheck from "@/resources/CustomCheck";
import { SetupFactoryOptions } from "../driver";

const content = JSON.stringify([]);

export const hasCustomChecksEmpty = ({ driver }: SetupFactoryOptions) => {
  const serviceControlInstanceUrl = window.defaultConfig.service_control_url;
  driver.mockEndpoint(`${serviceControlInstanceUrl}customchecks`, {
    body: content,
    headers: {
      "Total-Count": "0", //count of failing custom checks
    },
  });
};
