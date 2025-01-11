import CustomCheck from "@/resources/CustomCheck";
import { SetupFactoryOptions } from "../driver";

export const hasZeroCustomChecks = ({ driver }: SetupFactoryOptions) => {
  const serviceControlInstanceUrl = window.defaultConfig.service_control_url;
  driver.mockEndpoint(`${serviceControlInstanceUrl}customchecks`, {
    body: [],
    headers: {
      "Total-Count": "0",
    },
  });
};

const customCheckTemplate = <CustomCheck>{
  id: "CustomChecks/6131fa95-9414-1898-9c83-c5b18587945b",
  custom_check_id: "Audit Message Ingestion",
  category: "ServiceControl.Audit Health",
  status: "Pass",
  failure_reason: "I dont know the reason",
  reported_at: "2025-01-10T05:06:30.4074087Z",
  originating_endpoint: {
    name: "Particular.ServiceControl.Audit",
    host_id: "ff605b55-6fbb-af56-5753-73c1ff73e601",
    host: "ABC",
  },
};

export const hasCustomChecks =
  (params: { failing: boolean; reason: string }[]) =>
  ({ driver }: SetupFactoryOptions) => {
    const serviceControlInstanceUrl = window.defaultConfig.service_control_url;

    const customChecks = params.map((check) => {
      return {
        ...customCheckTemplate,
        status: check.failing ? "Fail" : "Pass",
        failure_reason: check.reason.toString(),
      };
    });

    const failedCustomChecks = customChecks.filter((check) => check.status === "Fail");

    driver.mockEndpointDynamic(`${serviceControlInstanceUrl}customchecks`, (url) => {
      const status = url.searchParams.get("status");
      if (status === "fail") {
        return {
          body: failedCustomChecks,
          headers: { "Total-Count": failedCustomChecks.length.toString() },
        };
      }

      return {
        body: customChecks,
        headers: { "Total-Count": customChecks.length.toString() },
      };
    });
  };
