import UpdateEmailNotificationsSettingsRequest from "@/resources/UpdateEmailNotificationsSettingsRequest";
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
export const hasEmailNotificationsWithSaveCapture = () => {
  let currentConfig = {
    enabled: false,
    enable_tls: false,
    smtp_server: "smtp.example.com",
    smtp_port: 25,
    authentication_account: "",
    authentication_password: "",
    from: "from@example.com",
    to: "to@example.com",
  };

  return ({ driver }: SetupFactoryOptions) => {
    const serviceControlUrl = window.defaultConfig.service_control_url;

    // GET returns the currentConfig
    driver.mockEndpointDynamic(`${serviceControlUrl}notifications/email`, "get", () => {
      return Promise.resolve({ body: currentConfig, status: 200 });
    });

    // POST updates currentConfig from the request body
    driver.mockEndpointDynamic(`${serviceControlUrl}notifications/email`, "post", async (_url, _params, request) => {
      const newSettings = (await request.json()) as UpdateEmailNotificationsSettingsRequest;

      currentConfig = {
        ...currentConfig,
        enable_tls: newSettings.enable_tls,
        smtp_server: newSettings.smtp_server,
        smtp_port: newSettings.smtp_port,
        authentication_account: newSettings.authorization_account,
        authentication_password: newSettings.authorization_password,
        from: newSettings.from,
        to: newSettings.to,
      };

      return Promise.resolve({ body: currentConfig, status: 200 });
    });

    // test endpoint
    driver.mockEndpointDynamic(`${serviceControlUrl}notifications/email/test`, "post",  () => {
      return Promise.resolve({ body: {}, status: 200 });
    });

    return {
      getCurrentConfig: () => currentConfig,
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
    // Mock the test endpoint to return success
    driver.mockEndpoint(`${serviceControlUrl}notifications/email/test`, {
      method: "post",
      status: 200,
      body: {},
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
    // Mock the test endpoint to return failure
    driver.mockEndpoint(`${serviceControlUrl}notifications/email/test`, {
      method: "post",
      status: 400,
      body: {},
    });
    return {
      template: incompleteTemplate,
      getTemplate: () => incompleteTemplate,
    };
  };
};
