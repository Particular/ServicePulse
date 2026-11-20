import { screen, within } from "@testing-library/vue";

export interface EndpointConfigurationItem {
  endpointName: string;
  instances: string;
  lastHeartbeat: string;
  trackingEnabled: boolean;
  endpointRow: HTMLElement;
}

export async function getEndpointsForConfiguration() {
  const endpointList = await screen.findByRole("rowgroup", { name: "endpoints" });
  const endpointRows = await within(endpointList).findAllByRole("row");

  const map = new Map<string, EndpointConfigurationItem>(
    endpointRows.map((row) => {
      const endpointName = String(within(row).getByRole("link", { name: "details-link" }).textContent);
      const instances = String(within(row).getByLabelText("instance-count").textContent);
      const lastHeartbeat = String(within(row).getByTitle("Last Heartbeat").textContent);
      const trackingSwitch = <HTMLInputElement>within(row).getByRole("switch", { name: endpointName });
      const trackingEnabled = trackingSwitch.checked;

      return [
        endpointName,
        {
          endpointName: endpointName,
          instances: instances,
          lastHeartbeat: lastHeartbeat,
          trackingEnabled: trackingEnabled,
          endpointRow: row,
        },
      ];
    })
  );

  return map;
}
