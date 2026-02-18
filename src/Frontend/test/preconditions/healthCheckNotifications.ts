import { SetupFactoryOptions } from "../driver";

const emailNotificationsTemplate = {
  enabled: false,
  enable_tls: false,
  smtp_server: "smtp.example.com",
  smtp_port: 25,
  authentication_account: "",
  authentication_password: "",
  from: "from@example.com",
  to: "to@example.com",
};

export const hasEmailNotificationsDisabledWithToggleCapture = () => {
  let capturedBody: unknown = null;

  return ({ driver }: SetupFactoryOptions) => {
    const serviceControlUrl = window.defaultConfig.service_control_url;

    driver.mockEndpoint(`${serviceControlUrl}notifications/email`, {
      body: emailNotificationsTemplate,
    });

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

export const hasEmailNotificationsWithCompleteSettings = (overrides: Partial<typeof emailNotificationsTemplate> = {}) => {
  const completeTemplate = {
    ...emailNotificationsTemplate,
    smtp_server: "smtp.example.com",
    smtp_port: 25,
    from: "from@example.com",
    to: "to@example.com",
    ...overrides,
  };

  return ({ driver }: SetupFactoryOptions) => {
    const serviceControlUrl = window.defaultConfig.service_control_url;
    driver.mockEndpoint(`${serviceControlUrl}notifications/email`, {
      body: completeTemplate,
    });

    return {
      template: completeTemplate,
      getTemplate: () => completeTemplate,
    };
  };
};

export const hasEmailNotificationsWithIncompleteSettings = (overrides: Partial<typeof emailNotificationsTemplate> = {}) => {
  const incompleteTemplate = {
    ...emailNotificationsTemplate,
    smtp_server: "",
    smtp_port: null,
    from: "",
    to: "",
    ...overrides,
  };

  return ({ driver }: SetupFactoryOptions) => {
    const serviceControlUrl = window.defaultConfig.service_control_url;
    driver.mockEndpoint(`${serviceControlUrl}notifications/email`, {
      body: incompleteTemplate,
    });

    return {
      template: incompleteTemplate,
      getTemplate: () => incompleteTemplate,
    };
  };
};
