import dayjs from "@/utils/dayjs";
import type HistoricRetryOperation from "@/resources/HistoricRetryOperation";
import type RecoverabilityHistoryResponse from "@/resources/RecoverabilityHistoryResponse";
import { RetryType } from "@/resources/RetryType";
import type { SetupFactoryOptions } from "../driver";

export interface HistoricRetryOperationOptions {
  originator?: string;
  retryType?: RetryType;
  messagesSent?: number;
  startedMinutesAgo?: number;
  completedMinutesAgo?: number;
}

export const createHistoricRetryOperation = (
  id: string,
  { originator = `Retried group ${id}`, retryType = RetryType.FailureGroup, messagesSent = 1, startedMinutesAgo = 30, completedMinutesAgo = 20 }: HistoricRetryOperationOptions = {}
): HistoricRetryOperation => ({
  request_id: id,
  retry_type: retryType,
  start_time: dayjs().subtract(startedMinutesAgo, "minute").toISOString(),
  completion_time: dayjs().subtract(completedMinutesAgo, "minute").toISOString(),
  originator,
  failed: false,
  number_of_messages_processed: messagesSent,
});

export const hasCompletedRetryRequests =
  ({ operations = [] }: { operations?: HistoricRetryOperation[] } = {}) =>
  ({ driver }: SetupFactoryOptions) => {
    const serviceControlUrl = window.defaultConfig.service_control_url;
    driver.mockEndpoint(`${serviceControlUrl}recoverability/history`, {
      body: <RecoverabilityHistoryResponse>{
        historic_operations: operations,
        unacknowledged_operations: [],
      },
    });
  };
