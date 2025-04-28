import { SagaHistory } from "@/resources/SagaHistory";
import { typeToName } from "@/composables/typeHumanizer";
import { SagaMessageData, SagaMessageDataItem } from "@/stores/SagaDiagramStore";
import { getTimeoutFriendly } from "@/composables/deliveryDelayParser";
import { processArray } from "@/composables/jsonPropertiesHelper";

export interface SagaMessageViewModel {
  MessageId: string;
  MessageFriendlyTypeName: string;
  FormattedTimeSent: string;
  Data: SagaMessageDataItem[];
  IsEventMessage: boolean;
  IsCommandMessage: boolean;
}
export interface InitiatingMessageViewModel {
  MessageType: string;
  IsSagaTimeoutMessage: boolean;
  FormattedMessageTimestamp: string;
  IsEventMessage: boolean;
  MessageData: SagaMessageDataItem[];
}
export interface SagaTimeoutMessageViewModel extends SagaMessageViewModel {
  TimeoutFriendly: string;
}
export interface SagaPropertyDataItem {
  SagaName: string;
  Key: string;
  Value: string;
}
export interface SagaUpdateViewModel {
  MessageId: string;
  StartTime: Date;
  FinishTime: Date;
  AllProperties: SagaPropertyDataItem[];
  UpdatedProperties: SagaPropertyDataItem[];
  FormattedStartTime: string;
  InitiatingMessage: InitiatingMessageViewModel;
  Status: string;
  StatusDisplay: string;
  HasTimeout: boolean;
  IsFirstNode: boolean;
  OutgoingMessages: SagaMessageViewModel[];
  OutgoingTimeoutMessages: SagaTimeoutMessageViewModel[];
  HasOutgoingMessages: boolean;
  HasOutgoingTimeoutMessages: boolean;
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
function processStateValues(stateAfterChange: string, messageType: string): SagaPropertyDataItem[] {
  if (!stateAfterChange || !messageType) {
    return [];
  }

  return processArray(stateAfterChange).map((v) => ({
    SagaName: messageType,
    Key: v.key,
    Value: v.value,
  }));
}

export function parseSagaUpdates(sagaHistory: SagaHistory | null, messagesData: SagaMessageData[]): SagaUpdateViewModel[] {
  if (!sagaHistory || !sagaHistory.changes || !sagaHistory.changes.length) return [];

  return sagaHistory.changes
    .map((update) => {
      const startTime = new Date(update.start_time);
      const finishTime = new Date(update.finish_time);
      // Process state values
      const stateValues = processStateValues(update.state_after_change, update.initiating_message?.message_type || "");
      console.log("State Values", stateValues);
      const initiatingMessageTimestamp = new Date(update.initiating_message?.time_sent || Date.now());
      const isInitiatingMessageEventMessage = update.initiating_message.intent === "Publish";
      // Find message data for initiating message
      const initiatingMessageData = update.initiating_message ? messagesData.find((m) => m.message_id === update.initiating_message.message_id)?.data || [] : [];

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
          TimeoutFriendly: getTimeoutFriendly(delivery_delay),
          MessageFriendlyTypeName: typeToName(msg.message_type || ""),
          Data: messageData,
          IsEventMessage: isEventMessage,
          IsCommandMessage: !isEventMessage,
        };
      });

      const outgoingTimeoutMessages = outgoingMessages
        .filter((msg) => msg.HasTimeout)
        .map(
          (msg) =>
            ({
              ...msg,
              TimeoutFriendly: `${msg.TimeoutFriendly}`,
            }) as SagaTimeoutMessageViewModel
        );

      const regularMessages = outgoingMessages.filter((msg) => !msg.HasTimeout) as SagaMessageViewModel[];

      const hasTimeout = outgoingTimeoutMessages.length > 0;

      return {
        MessageId: update.initiating_message?.message_id || "",
        StartTime: startTime,
        FinishTime: finishTime,
        AllProperties: stateValues,
        UpdatedProperties: stateValues,
        FormattedStartTime: `${startTime.toLocaleDateString()} ${startTime.toLocaleTimeString()}`,
        Status: update.status,
        StatusDisplay: update.status === "new" ? "Saga Initiated" : "Saga Updated",
        InitiatingMessage: <InitiatingMessageViewModel>{
          MessageType: typeToName(update.initiating_message?.message_type || "Unknown Message") || "",
          FormattedMessageTimestamp: `${initiatingMessageTimestamp.toLocaleDateString()} ${initiatingMessageTimestamp.toLocaleTimeString()}`,
          MessageData: initiatingMessageData,
          IsSagaTimeoutMessage: update.initiating_message?.is_saga_timeout_message || false,
          IsEventMessage: isInitiatingMessageEventMessage,
        },
        HasTimeout: hasTimeout,
        IsFirstNode: update.status === "new",
        OutgoingTimeoutMessages: outgoingTimeoutMessages,
        OutgoingMessages: regularMessages,
        HasOutgoingMessages: regularMessages.length > 0,
        HasOutgoingTimeoutMessages: outgoingTimeoutMessages.length > 0,
      };
    })
    .sort((a, b) => a.StartTime.getTime() - b.StartTime.getTime())
    .sort((a, b) => a.FinishTime.getTime() - b.FinishTime.getTime());
}
