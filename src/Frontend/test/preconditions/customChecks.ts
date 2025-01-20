import { SetupFactoryOptions } from "../driver";
import { customCheckItems } from "../mocks/custom-checks-template";

const content = JSON.stringify([]);
const failedCustomCheckItems = customCheckItems.filter((check) => check.status === "Fail");
const failedCustomCheckCount = failedCustomCheckItems.length.toString();
const passedCustomCheckItems = customCheckItems.filter((check) => check.status === "Pass");
const passedCustomCheckCount = passedCustomCheckItems.length.toString();

export const hasCustomChecksEmpty = ({ driver }: SetupFactoryOptions) => {
  const serviceControlInstanceUrl = window.defaultConfig.service_control_url;
  driver.mockEndpoint(`${serviceControlInstanceUrl}customchecks`, {
    body: content,
    headers: {
      "Total-Count": "0", //count of failing custom checks
    },
  });
};
export const hasCustomChecksFailing = ({ driver }: SetupFactoryOptions) => {
  const serviceControlInstanceUrl = window.defaultConfig.service_control_url;
  driver.mockEndpoint(`${serviceControlInstanceUrl}customchecks`, {
    body: failedCustomCheckItems,
    headers: {
      "Total-Count": failedCustomCheckCount, //count of failing custom checks
    },
  });
};
export const hasCustomChecksPassing = ({ driver }: SetupFactoryOptions) => {
  const serviceControlInstanceUrl = window.defaultConfig.service_control_url;
  driver.mockEndpoint(`${serviceControlInstanceUrl}customchecks`, {
    body: passedCustomCheckItems,
    headers: {
      "Total-Count": passedCustomCheckCount, //count of passing custom checks
    },
  });
};
