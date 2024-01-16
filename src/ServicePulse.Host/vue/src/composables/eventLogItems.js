import { useFetchFromServiceControl } from "./serviceServiceControlUrls";

export async function getEventLogItems() {
  const response = await useFetchFromServiceControl("eventlogitems");
  const data = await response.json();
  return data;
}
