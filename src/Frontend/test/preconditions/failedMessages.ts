import dayjs from "@/utils/dayjs";
import { FailedMessageStatus, type FailedMessage } from "@/resources/FailedMessage";
import type GroupOperation from "@/resources/GroupOperation";
import type { SetupFactoryOptions } from "../driver";

const RETRY_SETTLE_DELAY = 1500;

export interface FailedMessageOptions {
  messageType?: string;
  endpoint?: string;
  machine?: string;
  failedHoursAgo?: number;
  retryFailures?: number;
  exceptionMessage?: string;
}

export const createFailedMessage = (
  id: string,
  { messageType = `Sales.OrderFailed.${id}`, endpoint = "Sales.Service", machine = "MACHINE-B", failedHoursAgo = 2, retryFailures = 0, exceptionMessage = `Order ${id} could not be processed` }: FailedMessageOptions = {}
): FailedMessage => {
  const timeOfFailure = dayjs().subtract(failedHoursAgo, "hour");

  return {
    id,
    message_type: messageType,
    time_sent: timeOfFailure.subtract(1, "minute").toISOString(),
    is_system_message: false,
    exception: {
      exception_type: "System.InvalidOperationException",
      message: exceptionMessage,
      source: "Sales.Service",
      stack_trace: "   at Sales.OrderHandler.Handle(OrderFailed message, IMessageHandlerContext context)",
    },
    message_id: `message-${id}`,
    number_of_processing_attempts: retryFailures + 1,
    status: FailedMessageStatus.Unresolved,
    sending_endpoint: { name: "Sales.Client", host_id: "host-sender", host: "MACHINE-A" },
    receiving_endpoint: { name: endpoint, host_id: "host-receiver", host: machine },
    queue_address: endpoint,
    time_of_failure: timeOfFailure.toISOString(),
    last_modified: timeOfFailure.toISOString(),
    edited: false,
    edit_of: "",
  };
};

export interface FailedMessageGroup {
  id: string;
  title: string;
  messageIds: string[];
}

export interface FailedMessagesTestBed {
  failedMessages: FailedMessage[];
  retriedIds: string[];
}

export const hasFailedMessages =
  ({ messages = [], groups = [] }: { messages?: FailedMessage[]; groups?: FailedMessageGroup[] } = {}) =>
  ({ driver }: SetupFactoryOptions): FailedMessagesTestBed => {
    const serviceControlUrl = window.defaultConfig.service_control_url;
    const table = [...messages];
    const membership = new Map(groups.map((group) => [group.id, new Set(group.messageIds)]));
    const titles = new Map(groups.map((group) => [group.id, group.title]));
    const retriedIds: string[] = [];

    const groupOperations = (): GroupOperation[] =>
      groups.map((group) => ({
        id: group.id,
        title: group.title,
        type: "Endpoint Name",
        count: membership.get(group.id)?.size ?? 0,
        comment: "",
        operation_status: "none",
        operation_progress: 0,
        need_user_acknowledgement: false,
      }));

    const respondWith = (rows: FailedMessage[]) => ({ body: rows, headers: { "Total-Count": String(rows.length) } });

    const unresolvedRows = () => table.filter((message) => message.status === FailedMessageStatus.Unresolved);

    const sortRows = (rows: FailedMessage[], url: URL) => {
      const sort = url.searchParams.get("sort");
      if (sort !== "time_of_failure" && sort !== "message_type") {
        return rows;
      }
      const direction = url.searchParams.get("direction") === "asc" ? 1 : -1;
      return [...rows].sort((a, b) => (sort === "time_of_failure" ? a.time_of_failure.localeCompare(b.time_of_failure) : (a.message_type ?? "").localeCompare(b.message_type ?? "")) * direction);
    };

    driver.mockEndpointDynamic(`${serviceControlUrl}errors`, "get", (url) => {
      if (url.searchParams.get("status") !== FailedMessageStatus.Unresolved) {
        return Promise.resolve(respondWith([]));
      }
      return Promise.resolve(respondWith(sortRows(unresolvedRows(), url)));
    });

    driver.mockEndpointDynamic(`${serviceControlUrl}recoverability/groups/:groupId/errors`, "get", (url, params) => {
      const memberIds = membership.get(String(params.groupId));
      if (!memberIds) {
        return Promise.resolve(respondWith([]));
      }
      const rows = unresolvedRows().filter((message) => memberIds.has(message.id));
      return Promise.resolve(respondWith(sortRows(rows, url)));
    });

    driver.mockEndpointDynamic(`${serviceControlUrl}recoverability/groups/id/:groupId`, "get", (_url, params) => {
      const groupId = String(params.groupId);
      const memberIds = membership.get(groupId);
      return Promise.resolve({ body: { id: groupId, title: titles.get(groupId) ?? "Unknown group", type: "Endpoint Name", count: memberIds?.size ?? 0 } });
    });

    driver.mockEndpointDynamic(`${serviceControlUrl}recoverability/groups/`, "get", () => Promise.resolve({ body: groupOperations() }));

    driver.mockEndpointDynamic(`${serviceControlUrl}errors/retry`, "post", async (_url, _params, request) => {
      const ids = ((await request.json()) as string[]) ?? [];
      ids.forEach((id) => retriedIds.push(id));
      setTimeout(() => {
        ids.forEach((id) => {
          const message = table.find((candidate) => candidate.id === id);
          if (message) {
            message.status = FailedMessageStatus.RetryIssued;
          }
          membership.forEach((memberIds) => memberIds.delete(id));
        });
      }, RETRY_SETTLE_DELAY);
      return { body: {} };
    });

    return { failedMessages: table, retriedIds };
  };
