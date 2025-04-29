import { SagaHistory } from "@/resources/SagaHistory";
import { typeToName } from "@/composables/typeHumanizer";
import { SagaMessageData, SagaMessageDataItem } from "@/stores/SagaDiagramStore";
import { getTimeoutFriendly } from "@/composables/deliveryDelayParser";
import { processArray } from "@/composables/jsonPropertiesHelper";

function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

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

function formatStateValue(currentValue: SagaPropertyDataItem, oldValue: SagaPropertyDataItem | undefined): string {
  if (!oldValue?.Value || oldValue.Value === currentValue.Value) {
    return toTitleCase(currentValue.Value);
  }
  return `${toTitleCase(oldValue.Value)} → ${toTitleCase(currentValue.Value)}`;
}

let oldStateValues: SagaPropertyDataItem[] = [];
let allStateValues: SagaPropertyDataItem[] = [];
let updatedStateValues: SagaPropertyDataItem[] = [];
export function parseSagaUpdates(sagaHistory: SagaHistory | null, messagesData: SagaMessageData[]): SagaUpdateViewModel[] {
  if (!sagaHistory || !sagaHistory.changes || !sagaHistory.changes.length) return [];

  // Sort the changes first
  const sortedChanges = [...sagaHistory.changes].sort((a, b) => {
    const aStart = new Date(a.start_time).getTime();
    const bStart = new Date(b.start_time).getTime();
    if (aStart !== bStart) return aStart - bStart;

    const aFinish = new Date(a.finish_time).getTime();
    const bFinish = new Date(b.finish_time).getTime();
    return aFinish - bFinish;
  });
  return sortedChanges.map((update) => {
    const startTime = new Date(update.start_time);
    const finishTime = new Date(update.finish_time);

    // Process state values
    const stateValues = processStateValues(update.state_after_change, update.initiating_message?.message_type || "");

    //get all state values
    allStateValues = stateValues.map((currentValue) => {
      const isNewKey = !oldStateValues.some((old) => old.Key === currentValue.Key);
      const oldValue = oldStateValues.find((old) => old.Key === currentValue.Key);

      return {
        ...currentValue,
        Key: isNewKey ? `${currentValue.Key} (new)` : currentValue.Key,
        Value: formatStateValue(currentValue, oldValue),
      };
    });

    //get updated state values
    if (!oldStateValues.length) {
      oldStateValues = stateValues;
      updatedStateValues = allStateValues;
    } else {
      updatedStateValues = stateValues
        .filter((currentValue) => {
          const oldValue = oldStateValues.find((old) => old.Key === currentValue.Key);
          return !oldValue || oldValue.Value !== currentValue.Value;
        })
        .map((currentValue) => {
          const oldValue = oldStateValues.find((old) => old.Key === currentValue.Key);
          return {
            ...currentValue,
            Value: formatStateValue(currentValue, oldValue),
          };
        });
    }
    // Store current state values for next iteration
    oldStateValues = stateValues;

    //InitiatingMessage
    const initiatingMessageTimestamp = new Date(update.initiating_message?.time_sent || Date.now());
    const isInitiatingMessageEventMessage = update.initiating_message.intent === "Publish";
    const initiatingMessageData = update.initiating_message ? messagesData.find((m) => m.message_id === update.initiating_message.message_id)?.data || [] : [];

    // OutgoingMessages
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

    return <SagaUpdateViewModel>{
      MessageId: update.initiating_message?.message_id || "",
      StartTime: startTime,
      FinishTime: finishTime,
      AllProperties: allStateValues,
      UpdatedProperties: updatedStateValues,
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
  });
}
