import type QueueAddress from "@/resources/QueueAddress";
import type Redirect from "@/resources/Redirect";
import type { RemoteInstance } from "@/resources/RemoteInstance";
import type Message from "@/resources/Message";
import type { LicensedEndpointDetails } from "@/resources/LicenseDetails";
import type { SetupFactoryOptions } from "../driver";
import { serviceControlVersionSupportingAllMessages } from "./platformCapabilities";

export const knownQueuesDefaultHandler = ({ driver }: SetupFactoryOptions) => {
  driver.mockEndpoint(`${window.defaultConfig.service_control_url}errors/queues/addresses`, {
    body: <QueueAddress[]>[],
  });
};

export const redirectsDefaultHandler = ({ driver }: SetupFactoryOptions) => {
  driver.mockEndpoint(`${window.defaultConfig.service_control_url}redirects`, {
    body: <Redirect[]>[],
  });
};

export const hasRemoteInstances =
  (body: RemoteInstance[] = []) =>
  ({ driver }: SetupFactoryOptions) => {
    driver.mockEndpoint(`${window.defaultConfig.service_control_url}configuration/remotes`, {
      body,
    });
  };

export const hasMessages =
  (body: Message[] = []) =>
  ({ driver }: SetupFactoryOptions) => {
    driver.mockEndpointDynamic(`${window.defaultConfig.service_control_url}messages2/*`, "get", () =>
      Promise.resolve({
        body,
      })
    );
  };

export const licenseDetailsDefaultHandler = ({ driver }: SetupFactoryOptions) => {
  driver.mockEndpoint(`${window.defaultConfig.service_control_url}license/details`, {
    body: <LicensedEndpointDetails>{
      products: [],
      endpoints: [],
      infrastructure_queues: [],
      excluded_queues: [],
      service_end_date: "2026-12-31T00:00:00Z",
      valid_id: true,
    },
  });
};

const versionHeader = { "X-Particular-Version": serviceControlVersionSupportingAllMessages };

function ensureTrailingSlash(url: string) {
  return url.endsWith("/") ? url : `${url}/`;
}

export const serviceControlConnectionSucceeds =
  (url = window.defaultConfig.service_control_url) =>
  ({ driver }: SetupFactoryOptions) => {
    driver.mockEndpoint(url, {
      body: {},
      headers: versionHeader,
    });
  };

export const serviceControlConnectionFailsValidation =
  (url = window.defaultConfig.service_control_url) =>
  ({ driver }: SetupFactoryOptions) => {
    driver.mockEndpoint(url, {
      body: {},
    });
  };

export const serviceControlConnectionUnavailable =
  (url = window.defaultConfig.service_control_url) =>
  ({ driver }: SetupFactoryOptions) => {
    driver.mockEndpoint(url, {
      networkError: true,
    });
  };

export const monitoringConnectionSucceeds =
  (url = window.defaultConfig.monitoring_urls[0]) =>
  ({ driver }: SetupFactoryOptions) => {
    const monitoringUrl = ensureTrailingSlash(url);
    driver.mockEndpoint(`${monitoringUrl}monitored-endpoints`, {
      body: [],
      headers: versionHeader,
    });
  };

export const monitoringConnectionFailsValidation =
  (url = window.defaultConfig.monitoring_urls[0]) =>
  ({ driver }: SetupFactoryOptions) => {
    const monitoringUrl = ensureTrailingSlash(url);
    driver.mockEndpoint(`${monitoringUrl}monitored-endpoints`, {
      body: [],
    });
  };

export const monitoringConnectionUnavailable =
  (url = window.defaultConfig.monitoring_urls[0]) =>
  ({ driver }: SetupFactoryOptions) => {
    const monitoringUrl = ensureTrailingSlash(url);
    driver.mockEndpoint(`${monitoringUrl}monitored-endpoints`, {
      networkError: true,
    });
  };
