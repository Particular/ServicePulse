import { SetupFactoryOptions } from "../driver";

const emailNotificationsTemplate = {
  enabled: false,
  enable_tls: false,
};

export const hasEmailNotificationsDisabledWithToggleCapture = () => {
  // capturedBody is closed over so tests can inspect it via the returned object
  let capturedBody: unknown = null;

  return ({ driver }: SetupFactoryOptions) => {
    const serviceControlUrl = window.defaultConfig.service_control_url;

    // Precondition: Email notifications are OFF
    driver.mockEndpoint(`${serviceControlUrl}notifications/email`, {
      body: emailNotificationsTemplate,
    });

    // Capture toggle POST body for assertions in tests
    driver.mockEndpointDynamic(`${serviceControlUrl}notifications/email/toggle`, "post", async (_url, _params, request) => {
      capturedBody = await request.json();
      return Promise.resolve({ body: {}, status: 200 });
    });

    return {
      template: emailNotificationsTemplate,
      getCapturedBody: () => capturedBody,
    };
  };
};
export const hasEmailNotificationsEnabledWithToggleCapture = () => {
  let capturedBody: unknown = null;
  const enabledTemplate = {
    enabled: true,
    enable_tls: false,
  };

  return ({ driver }: SetupFactoryOptions) => {
    const serviceControlUrl = window.defaultConfig.service_control_url;

    driver.mockEndpoint(`${serviceControlUrl}notifications/email`, {
      body: enabledTemplate,
    });

    driver.mockEndpointDynamic(`${serviceControlUrl}notifications/email/toggle`, "post", async (_url, _params, request) => {
      capturedBody = await request.json();
      return Promise.resolve({ body: {}, status: 200 });
    });

    return {
      enabledTemplate,
      getCapturedBody: () => capturedBody,
    };
  };
};