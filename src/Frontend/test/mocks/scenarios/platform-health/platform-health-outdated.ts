import { worker, setupComplete as baseSetupComplete } from "./platform-health";
import { installPlatformHealthDevControls } from "../../platform-health-state";
import { makeMockEndpoint, makeMockEndpointDynamic } from "../../../mock-endpoint";

export { worker };

const mockEndpoint = makeMockEndpoint({ mockServer: worker });
const mockEndpointDynamic = makeMockEndpointDynamic({ mockServer: worker });

export const setupComplete = Promise.resolve().then(async () => {
  await baseSetupComplete;

  mockEndpointDynamic(`${window.defaultConfig.service_control_url}messages2/*`, "get", () =>
    Promise.resolve({
      body: [
        {
          id: "msg-1",
          message_id: "msg-1",
          message_type: "TestMessage",
          sending_endpoint: { name: "Sender", host_id: "host-1", host: "localhost" },
          receiving_endpoint: { name: "Receiver", host_id: "host-2", host: "localhost" },
          time_sent: new Date().toISOString(),
          processed_at: new Date().toISOString(),
          critical_time: "00:00:00.1234567",
          processing_time: "00:00:00.0123456",
          delivery_time: "00:00:00.0012345",
          is_system_message: false,
          conversation_id: "conv-1",
          headers: [],
          status: "Successful",
          message_intent: "send",
          body_url: "",
          body_size: 100,
          instance_id: "instance-1",
        },
      ],
    })
  );

  mockEndpoint(`${window.defaultConfig.monitoring_urls[0]}monitored-endpoints`, {
    body: [{ name: "TestEndpoint" }],
  });

  installPlatformHealthDevControls();
  window.__platformHealth?.setScenario("single-region-outdated");
});
