import QueueAddress from "@/resources/QueueAddress";
import Redirect from "@/resources/Redirect";
import { RemoteInstance } from "@/resources/RemoteInstance";
import Message from "@/resources/Message";
import { SetupFactoryOptions } from "test/driver";

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
