import dayjs from "@/utils/dayjs";
import { FailedMessageStatus, type FailedMessage } from "@/resources/FailedMessage";
import type { SetupFactoryOptions } from "../driver";

export interface DeletedMessageOptions {
  messageType?: string;
  endpoint?: string;
  machine?: string;
  failedDaysAgo?: number;
  deletedMinutesAgo?: number;
  retryFailures?: number;
  exceptionMessage?: string;
}

export const createDeletedMessage = (
  id: string,
  { messageType = `Sales.OrderFailed.${id}`, endpoint = "Sales.Service", machine = "MACHINE-B", failedDaysAgo = 3, deletedMinutesAgo = 10, retryFailures = 0, exceptionMessage = `Order ${id} could not be processed` }: DeletedMessageOptions = {}
): FailedMessage => {
  const timeOfFailure = dayjs().subtract(failedDaysAgo, "day");

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
    status: FailedMessageStatus.Archived,
    sending_endpoint: { name: "Sales.Client", host_id: "host-sender", host: "MACHINE-A" },
    receiving_endpoint: { name: endpoint, host_id: "host-receiver", host: machine },
    queue_address: endpoint,
    time_of_failure: timeOfFailure.toISOString(),
    last_modified: dayjs().subtract(deletedMinutesAgo, "minute").toISOString(),
    edited: false,
    edit_of: "",
  };
};

export interface DeletedMessageGroup {
  id: string;
  title: string;
  messageIds: string[];
}

export interface DeletedMessagesTestBed {
  deletedMessages: FailedMessage[];
  restoredIds: string[];
}

export const hasDeletedMessages =
  ({ messages = [], groups = [] }: { messages?: FailedMessage[]; groups?: DeletedMessageGroup[] } = {}) =>
  ({ driver }: SetupFactoryOptions): DeletedMessagesTestBed => {
    const serviceControlUrl = window.defaultConfig.service_control_url;
    const table = [...messages];
    const membership = new Map(groups.map((group) => [group.id, new Set(group.messageIds)]));
    const titles = new Map(groups.map((group) => [group.id, group.title]));
    const restoredIds: string[] = [];

    const withinModifiedWindow = (url: URL) => {
      const range = url.searchParams.get("modified");
      if (!range) {
        return () => true;
      }
      const [start, end] = range.split("...");
      const from = dayjs(start).valueOf();
      const until = dayjs(end).valueOf();
      return (message: FailedMessage) => {
        const modified = dayjs(message.last_modified).valueOf();
        return modified >= from && modified <= until;
      };
    };

    const respondWith = (rows: FailedMessage[]) => ({ body: rows, headers: { "Total-Count": String(rows.length) } });

    driver.mockEndpointDynamic(`${serviceControlUrl}errors`, "get", (url) => {
      if (url.searchParams.get("status") !== FailedMessageStatus.Archived) {
        return Promise.resolve(respondWith([]));
      }
      return Promise.resolve(respondWith(table.filter(withinModifiedWindow(url))));
    });

    driver.mockEndpointDynamic(`${serviceControlUrl}recoverability/groups/:groupId/errors`, "get", (url, params) => {
      const memberIds = membership.get(String(params.groupId));
      if (!memberIds) {
        return Promise.resolve(respondWith([]));
      }
      const rows = table.filter((message) => memberIds.has(message.id)).filter(withinModifiedWindow(url));
      return Promise.resolve(respondWith(rows));
    });

    driver.mockEndpointDynamic(`${serviceControlUrl}archive/groups/id/:groupId`, "get", (_url, params) => {
      const groupId = String(params.groupId);
      return Promise.resolve({ body: { id: groupId, title: titles.get(groupId) ?? "Unknown group", type: "Endpoint Name" } });
    });

    driver.mockEndpointDynamic(`${serviceControlUrl}errors/unarchive`, "patch", async (_url, _params, request) => {
      const ids = ((await request.json()) as string[]) ?? [];
      ids.forEach((id) => {
        const index = table.findIndex((message) => message.id === id);
        if (index >= 0) {
          table.splice(index, 1);
        }
        membership.forEach((memberIds) => memberIds.delete(id));
        restoredIds.push(id);
      });
      return { body: {} };
    });

    return { deletedMessages: table, restoredIds };
  };
