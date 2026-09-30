import dayjs from "@/utils/dayjs";
import { FailedMessageStatus, type FailedMessage } from "@/resources/FailedMessage";
import type QueueAddress from "@/resources/QueueAddress";
import type { SetupFactoryOptions } from "../driver";

export interface PendingRetryMessageOptions {
  messageType?: string;
  endpoint?: string;
  machine?: string;
  retriedMinutesAgo?: number;
  exceptionMessage?: string;
}

export const createPendingRetryMessage = (
  id: string,
  { messageType = `Sales.OrderFailed.${id}`, endpoint = "Sales.Service", machine = "MACHINE-B", retriedMinutesAgo = 10, exceptionMessage = `Order ${id} could not be processed` }: PendingRetryMessageOptions = {}
): FailedMessage => {
  const timeOfRetry = dayjs().subtract(retriedMinutesAgo, "minute");

  return {
    id,
    message_type: messageType,
    time_sent: timeOfRetry.subtract(1, "hour").toISOString(),
    is_system_message: false,
    exception: {
      exception_type: "System.InvalidOperationException",
      message: exceptionMessage,
      source: "Sales.Service",
      stack_trace: "   at Sales.OrderHandler.Handle(OrderFailed message, IMessageHandlerContext context)",
    },
    message_id: `message-${id}`,
    number_of_processing_attempts: 1,
    status: FailedMessageStatus.RetryIssued,
    sending_endpoint: { name: "Sales.Client", host_id: "host-sender", host: "MACHINE-A" },
    receiving_endpoint: { name: endpoint, host_id: "host-receiver", host: machine },
    queue_address: endpoint,
    time_of_failure: timeOfRetry.subtract(30, "minute").toISOString(),
    last_modified: timeOfRetry.toISOString(),
    edited: false,
    edit_of: "",
  };
};

export interface RetryAllRequest {
  from: string;
  to: string;
  queueaddress?: string;
}

export interface ResolveAllRequest {
  from: string;
  to: string;
  queueaddress?: string;
}

export interface PendingRetriesTestBed {
  pendingRetryMessages: FailedMessage[];
  retryAllRequests: RetryAllRequest[];
  resolveAllRequests: ResolveAllRequest[];
}

export const hasPendingRetryMessages =
  ({ messages = [] }: { messages?: FailedMessage[] } = {}) =>
  ({ driver }: SetupFactoryOptions): PendingRetriesTestBed => {
    const serviceControlUrl = window.defaultConfig.service_control_url;
    const table = [...messages];
    const retryAllRequests: RetryAllRequest[] = [];
    const resolveAllRequests: ResolveAllRequest[] = [];

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

    const matchingQueue = (url: URL) => {
      const queue = url.searchParams.get("queueaddress");
      if (!queue) {
        return () => true;
      }
      return (message: FailedMessage) => message.queue_address === queue;
    };

    const respondWith = (rows: FailedMessage[]) => ({ body: rows, headers: { "Total-Count": String(rows.length) } });

    driver.mockEndpointDynamic(`${serviceControlUrl}errors`, "get", (url) => {
      if (url.searchParams.get("status") !== FailedMessageStatus.RetryIssued) {
        return Promise.resolve(respondWith([]));
      }
      return Promise.resolve(respondWith(table.filter(matchingQueue(url)).filter(withinModifiedWindow(url))));
    });

    driver.mockEndpointDynamic(`${serviceControlUrl}errors/queues/addresses`, "get", () => {
      const addresses = [...new Set(table.map((message) => message.queue_address))];
      return Promise.resolve({
        body: addresses.map((address) => <QueueAddress>{ physical_address: address, failed_message_count: table.filter((message) => message.queue_address === address).length }),
      });
    });

    driver.mockEndpointDynamic(`${serviceControlUrl}pendingretries/queues/retry`, "post", async (_url, _params, request) => {
      retryAllRequests.push((await request.json()) as RetryAllRequest);
      return { body: {} };
    });

    driver.mockEndpointDynamic(`${serviceControlUrl}pendingretries/retry`, "post", async (_url, _params, request) => {
      const body = await request.json();
      if (!Array.isArray(body)) {
        retryAllRequests.push(body as RetryAllRequest);
      }
      return { body: {} };
    });

    driver.mockEndpointDynamic(`${serviceControlUrl}pendingretries/queues/resolve`, "patch", async (_url, _params, request) => {
      resolveAllRequests.push((await request.json()) as ResolveAllRequest);
      return { body: {} };
    });

    driver.mockEndpointDynamic(`${serviceControlUrl}pendingretries/resolve`, "patch", async (_url, _params, request) => {
      const body = (await request.json()) as Record<string, unknown>;
      if (!("uniquemessageids" in body)) {
        resolveAllRequests.push(body as unknown as ResolveAllRequest);
      }
      return { body: {} };
    });

    return { pendingRetryMessages: table, retryAllRequests, resolveAllRequests };
  };
