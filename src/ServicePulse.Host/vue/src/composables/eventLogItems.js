import { fetchFromServiceControl } from "./serviceServiceControlUrls";

export function getEventLogItems() {
  return fetchFromServiceControl("eventlogitems").then((response) => {
    return response.json();
  });
}
