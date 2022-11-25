import { useFetchFromServiceControl } from "./serviceServiceControlUrls";

export function getEventLogItems() {
  return useFetchFromServiceControl("eventlogitems").then((response) => {
    return response.json();
  });
}
