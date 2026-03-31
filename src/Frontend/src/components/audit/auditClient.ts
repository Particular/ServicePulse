import { type default as Message, MessageStatus } from "@/resources/Message";
import type { SortInfo } from "@/components/SortInfo";
import type { DateRange } from "@/types/date";
import serviceControlClient from "@/components/serviceControlClient";

export interface AuditQuery {
  endpointName?: string;
  dateRange?: DateRange;
  messageFilterString?: string;
  itemsPerPage?: number;
  sort?: SortInfo;
}

class AuditClient {
  public async getMessages(query: AuditQuery): Promise<[Response, Message[]]> {
    const [fromDate, toDate] = query.dateRange ?? [];
    const from = fromDate?.toISOString() ?? "";
    const to = toDate?.toISOString() ?? "";
    return await serviceControlClient.fetchTypedFromServiceControl<Message[]>(
      `messages2/?endpoint_name=${query.endpointName ?? ""}&from=${from}&to=${to}&q=${query.messageFilterString ?? ""}&page_size=${query.itemsPerPage ?? 100}&sort=${query.sort?.property ?? "time_sent"}&direction=${query.sort?.isAscending ? "asc" : "desc"}`
    );
  }

  public async hasSuccessfulMessages(): Promise<boolean> {
    // Fetch the latest 10 messages and check if any are successful
    // ideally we would want to filter successful messages server-side, but the API doesn't currently support that
    const [, data] = await serviceControlClient.fetchTypedFromServiceControl<Message[]>(`messages2/?page_size=10&sort=time_sent&direction=desc`);
    return data?.some((msg) => msg.status === MessageStatus.Successful) ?? false;
  }
}

export default new AuditClient();
