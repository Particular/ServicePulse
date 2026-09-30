import { screen, within } from "@testing-library/vue";

export type EndpointInstanceRow = {
  hostName: string;
  lastHeartbeat: string;
};

export function getEndpointInstanceRows(): EndpointInstanceRow[] {
  const instanceRowgroup = screen.queryByRole("rowgroup", { name: "endpoints" });

  if (!instanceRowgroup) {
    return [];
  }

  return within(instanceRowgroup)
    .queryAllByRole("row")
    .map((row) => ({
      hostName: within(row).getByLabelText("instance-name").textContent ?? "",
      lastHeartbeat: within(row).getByTitle("Last Heartbeat").textContent ?? "",
    }));
}
