import { SagaHistory } from "@/resources/SagaHistory";
import { typeToName } from "@/composables/typeHumanizer";
import { SagaMessageData, SagaMessageDataItem } from "@/stores/SagaDiagramStore";

export interface SagaMessageExt {
  MessageId: string;
  MessageFriendlyTypeName: string;
  FormattedTimeSent: string;
  Data: SagaMessageDataItem[];
  IsEventMessage: boolean;
  IsCommandMessage: boolean;
}

export interface SagaTimeoutMessage extends SagaMessageExt {
  TimeoutFriendly: string;
}

export interface SagaUpdateViewModel {
  MessageId: string;
  StartTime: Date;
  FinishTime: Date;
  FormattedStartTime: string;
  InitiatingMessageType: string;
  IsInitiatingMessageTimeOut: boolean;
  FormattedInitiatingMessageTimestamp: string;
  Status: string;
  StatusDisplay: string;
  HasTimeout: boolean;
  IsFirstNode: boolean;
  NonTimeoutMessages: SagaMessageExt[];
  TimeoutMessages: SagaTimeoutMessage[];
  HasNonTimeoutMessages: boolean;
  HasTimeoutMessages: boolean;
  InitiatingMessageData: SagaMessageDataItem[];
}

export interface SagaViewModel {
  SagaTitle: string;
  SagaGuid: string;
  MessageIdUrl: string;
  ParticipatedInSaga: boolean;
  HasSagaData: boolean;
  ShowNoPluginActiveLegend: boolean;
  SagaCompleted: boolean;
  FormattedCompletionTime: string;
  SagaUpdates: SagaUpdateViewModel[];
  ShowMessageData: boolean;
}

export function parseSagaUpdates(sagaHistory: SagaHistory | null, messagesData: SagaMessageData[]): SagaUpdateViewModel[] {
  if (!sagaHistory || !sagaHistory.changes || !sagaHistory.changes.length) return [];

  return sagaHistory.changes
    .map((update) => {
      const startTime = new Date(update.start_time);
      const finishTime = new Date(update.finish_time);
      const initiatingMessageTimestamp = new Date(update.initiating_message?.time_sent || Date.now());

      // Find message data for initiating message
      const initiatingMessageData = update.initiating_message ? messagesData.find((m) => m.message_id === update.initiating_message.message_id)?.data || [] : [];
      const isInitiatingMessageTimeOut = update.initiating_message?.is_saga_timeout_message || false;

      // Create common base message objects with shared properties
      const outgoingMessages = update.outgoing_messages.map((msg) => {
        const delivery_delay = msg.delivery_delay || "00:00:00";
        const timeSent = new Date(msg.time_sent);
        const hasTimeout = !!delivery_delay && delivery_delay !== "00:00:00";
        const timeoutSeconds = delivery_delay.split(":")[2] || "0";
        const isEventMessage = msg.intent === "Publish";

        // Find corresponding message data
        const messageData = messagesData.find((m) => m.message_id === msg.message_id)?.data || [];
        return {
          MessageType: msg.message_type || "",
          MessageId: msg.message_id,
          FormattedTimeSent: `${timeSent.toLocaleDateString()} ${timeSent.toLocaleTimeString()}`,
          HasTimeout: hasTimeout,
          TimeoutSeconds: timeoutSeconds,
          MessageFriendlyTypeName: typeToName(msg.message_type || ""),
          Data: messageData,
          IsEventMessage: isEventMessage,
          IsCommandMessage: !isEventMessage,
        };
      });

      const timeoutMessages = outgoingMessages
        .filter((msg) => msg.HasTimeout)
        .map(
          (msg) =>
            ({
              ...msg,
              TimeoutFriendly: `${msg.TimeoutSeconds}s`,
            }) as SagaTimeoutMessage
        );

      const nonTimeoutMessages = outgoingMessages.filter((msg) => !msg.HasTimeout) as SagaMessageExt[];

      const hasTimeout = timeoutMessages.length > 0;

      return {
        MessageId: update.initiating_message?.message_id || "",
        StartTime: startTime,
        FinishTime: finishTime,
        FormattedStartTime: `${startTime.toLocaleDateString()} ${startTime.toLocaleTimeString()}`,
        Status: update.status,
        StatusDisplay: update.status === "new" ? "Saga Initiated" : "Saga Updated",
        InitiatingMessageType: typeToName(update.initiating_message?.message_type || "Unknown Message") || "",
        FormattedInitiatingMessageTimestamp: `${initiatingMessageTimestamp.toLocaleDateString()} ${initiatingMessageTimestamp.toLocaleTimeString()}`,
        InitiatingMessageData: initiatingMessageData,
        IsInitiatingMessageTimeOut: isInitiatingMessageTimeOut,
        HasTimeout: hasTimeout,
        IsFirstNode: update.status === "new",
        TimeoutMessages: timeoutMessages,
        NonTimeoutMessages: nonTimeoutMessages,
        HasNonTimeoutMessages: nonTimeoutMessages.length > 0,
        HasTimeoutMessages: timeoutMessages.length > 0,
      };
    })
    .sort((a, b) => a.StartTime.getTime() - b.StartTime.getTime())
    .sort((a, b) => a.FinishTime.getTime() - b.FinishTime.getTime());
}
