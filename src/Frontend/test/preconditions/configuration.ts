import type QueueAddress from "@/resources/QueueAddress";
import type Redirect from "@/resources/Redirect";
import type { RemoteInstance } from "@/resources/RemoteInstance";
import type Message from "@/resources/Message";
import type { SetupFactoryOptions } from "../driver";

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
