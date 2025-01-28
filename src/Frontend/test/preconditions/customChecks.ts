import { SetupFactoryOptions } from "../driver";
import { passedCustomCheckItems, customCheckItems } from "../mocks/custom-checks-template";

const emptyContent = JSON.stringify([]);

export const hasCustomChecksEmpty = ({ driver }: SetupFactoryOptions) => {
  const serviceControlInstanceUrl = window.defaultConfig.service_control_url;
  driver.mockEndpoint(`${serviceControlInstanceUrl}customchecks`, {
    body: emptyContent,
    headers: {
      "Total-Count": "0", //count of failing custom checks
    },
  });
};

export const hasCustomChecksPassing = ({ driver }: SetupFactoryOptions) => {
  const serviceControlInstanceUrl = window.defaultConfig.service_control_url;
  driver.mockEndpointDynamic(`${serviceControlInstanceUrl}customchecks`, (url) => {
    const status = url.searchParams.get("status");
    let dataForCustomCheckItems = passedCustomCheckItems;

    if (status === "fail") {
      dataForCustomCheckItems = dataForCustomCheckItems.filter((check) => check.status === "Fail");
    }

    return {
      body: dataForCustomCheckItems,
      headers: { "Total-Count": dataForCustomCheckItems.length.toString() },
    };
  });
};
export const hasCustomChecks = ({ driver }: SetupFactoryOptions) => {
  const serviceControlInstanceUrl = window.defaultConfig.service_control_url;
  driver.mockEndpointDynamic(`${serviceControlInstanceUrl}customchecks`, (url) => {
    const status = url.searchParams.get("status");
    let dataForCustomCheckItems = customCheckItems;

    if (status === "fail") {
      dataForCustomCheckItems = dataForCustomCheckItems.filter((check) => check.status === "Fail");
    }

    return {
      body: dataForCustomCheckItems,
      headers: { "Total-Count": dataForCustomCheckItems.length.toString() },
    };
  });
};
