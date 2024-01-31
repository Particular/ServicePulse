import { useFetchFromServiceControl } from "./serviceServiceControlUrls";

export async function getEventLogItems() {
  let response = await useFetchFromServiceControl("eventlogitems");
  return response.json();
}
