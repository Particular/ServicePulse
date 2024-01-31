import { useFetchFromServiceControl } from "./serviceServiceControlUrls";

export interface EventLogItem {
  id: string;
  description: string;
  severity: string;
  raised_at: string;
  related_to: string[];
  category: string;
  event_type: string;
}

export async function getEventLogItems() {
  let response = await useFetchFromServiceControl("eventlogitems");
  return await response.json() as unknown as EventLogItem[];
}
