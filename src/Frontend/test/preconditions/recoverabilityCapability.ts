import { SetupFactoryOptions } from "../driver";

/**
 * Precondition: ServiceControl instance is unavailable (returns error)
 * This simulates an unavailable ServiceControl instance by returning 500 errors
 * for the errors endpoint which is used to determine connection state.
 */
export const hasServiceControlUnavailable = ({ driver }: SetupFactoryOptions) => {
  const serviceControlInstanceUrl = window.defaultConfig.service_control_url;

  // Return 500 error for the errors endpoint (used for connection state check)
  // This is what determines if ServiceControl is "connected" or not
  driver.mockEndpoint(`${serviceControlInstanceUrl}errors*`, {
    body: { error: "Service unavailable" },
    status: 500,
  });
};
