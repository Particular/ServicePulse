import { SetupFactoryOptions } from "../driver";
import { customCheckItems } from "../mocks/custom-checks-template";

const content = JSON.stringify([]);
const failedCustomCheckItems = customCheckItems.filter((check) => check.status === "Fail");
const passedCustomCheckItems = customCheckItems.filter((check) => check.status === "Pass");

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
  driver.mockEndpointDynamic(`${serviceControlInstanceUrl}customchecks`, (url) => {
    const status = url.searchParams.get("status");
    if (status === "fail") {
      return {
        body: failedCustomCheckItems,
        headers: { "Total-Count": failedCustomCheckItems.length.toString() },
      };
    }

    return {
      body: passedCustomCheckItems,
      headers: { "Total-Count": passedCustomCheckItems.length.toString() },
    };
  });
};
export const hasCustomChecksPassing = ({ driver }: SetupFactoryOptions) => {
  const serviceControlInstanceUrl = window.defaultConfig.service_control_url;
  driver.mockEndpoint(`${serviceControlInstanceUrl}customchecks`, {
    body: passedCustomCheckItems,
    headers: {
      "Total-Count": passedCustomCheckItems.length.toString(), //count of passing custom checks
    },
  });
};
