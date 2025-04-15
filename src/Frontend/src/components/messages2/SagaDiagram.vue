<script setup lang="ts">
import Message from "@/resources/Message";
import { computed, onUnmounted, watch } from "vue";
import { RouterLink } from "vue-router";
import routeLinks from "@/router/routeLinks";
import { typeToName } from "@/composables/typeHumanizer";
import { useSagaDiagramStore } from "@/stores/SagaDiagramStore";
import { SagaHistory } from "@/resources/SagaHistory";

// Import the images directly
import CommandIcon from "@/assets/command.svg";
import EventIcon from "@/assets/event.svg";
import TimeoutIcon from "@/assets/TimeoutIcon.svg";
import SagaIcon from "@/assets/SagaIcon.svg";
import SagaInitiatedIcon from "@/assets/SagaInitiatedIcon.svg";
import SagaUpdatedIcon from "@/assets/SagaUpdatedIcon.svg";
import SagaCompletedIcon from "@/assets/SagaCompletedIcon.svg";
import SagaTimeoutIcon from "@/assets/SagaTimeoutIcon.svg";
import ToolbarEndpointIcon from "@/assets/Shell_ToolbarEndpoint.svg";
import NoSagaIcon from "@/assets/NoSaga.svg";
import CopyClipboardIcon from "@/assets/Shell_CopyClipboard.svg";

const props = withDefaults(
  defineProps<{
    message: Message;
  }>(),
  {
    message: () => ({}) as Message,
  }
);

const sagaDiagramStore = useSagaDiagramStore();

//Watch for message and set saga ID when component mounts or message changes
watch(
  () => props.message?.invoked_sagas,
  (newSagas) => {
    if (newSagas && newSagas?.length > 0) {
      sagaDiagramStore.setSagaId(newSagas[0].saga_id);
    } else {
      sagaDiagramStore.clearSagaHistory();
    }
  },
  { immediate: true }
);

onUnmounted(() => {
  sagaDiagramStore.clearSagaHistory();
});

interface SagaMessageDataItem {
  Key: string;
  Value: string;
}

interface SagaMessage {
  MessageFriendlyTypeName: string;
  FormattedTimeSent: string;
  Data: SagaMessageDataItem[];
  IsEventMessage: boolean;
  IsCommandMessage: boolean;
}

interface SagaTimeoutMessage extends SagaMessage {
  TimeoutFriendly: string;
}
interface SagaUpdateViewModel {
  StartTime: Date;
  FinishTime: Date;
  FormattedStartTime: string;
  InitiatingMessageType: string;
  FormattedInitiatingMessageTimestamp: string;
  Status: string;
  StatusDisplay: string;
  HasTimeout: boolean;
  IsFirstNode: boolean;
  NonTimeoutMessages: SagaMessage[];
  TimeoutMessages: SagaTimeoutMessage[];
  HasNonTimeoutMessages: boolean;
  HasTimeoutMessages: boolean;
}

function parseSagaUpdates(sagaHistory: SagaHistory | null): SagaUpdateViewModel[] {
  if (!sagaHistory || !sagaHistory.changes || !sagaHistory.changes.length) return [];

  return sagaHistory.changes
    .map((update) => {
      const startTime = new Date(update.start_time);
      const finishTime = new Date(update.finish_time);
      const initiatingMessageTimestamp = new Date(update.initiating_message?.time_sent || Date.now());

      // Create common base message objects with shared properties
      const outgoingMessages = update.outgoing_messages.map((msg) => {
        const delivery_delay = msg.delivery_delay || "00:00:00";
        const timeSent = new Date(msg.time_sent);
        const hasTimeout = !!delivery_delay && delivery_delay !== "00:00:00";
        const timeoutSeconds = delivery_delay.split(":")[2] || "0";
        const isEventMessage = msg.intent === "Publish";

        return {
          MessageType: msg.message_type || "",
          MessageId: msg.message_id,
          FormattedTimeSent: `${timeSent.toLocaleDateString()} ${timeSent.toLocaleTimeString()}`,
          HasTimeout: hasTimeout,
          TimeoutSeconds: timeoutSeconds,
          MessageFriendlyTypeName: typeToName(msg.message_type || ""),
          Data: [] as SagaMessageDataItem[],
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
              TimeoutFriendly: `${msg.TimeoutSeconds}s`, //TODO: Update with logic from ServiceInsight
            }) as SagaTimeoutMessage
        );

      const nonTimeoutMessages = outgoingMessages.filter((msg) => !msg.HasTimeout) as SagaMessage[];

      const hasTimeout = timeoutMessages.length > 0;

      return {
        StartTime: startTime,
        FinishTime: finishTime,
        FormattedStartTime: `${startTime.toLocaleDateString()} ${startTime.toLocaleTimeString()}`,
        Status: update.status,
        StatusDisplay: update.status === "new" ? "Saga Initiated" : update.status === "completed" ? "Saga Completed" : "Saga Updated",
        InitiatingMessageType: typeToName(update.initiating_message?.message_type || "Unknown Message") || "",
        FormattedInitiatingMessageTimestamp: `${initiatingMessageTimestamp.toLocaleDateString()} ${initiatingMessageTimestamp.toLocaleTimeString()}`,
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

interface SagaViewModel {
  SagaTitle: string;
  SagaGuid: string;
  MessageIdUrl: string;
  ParticipatedInSaga: boolean;
  HasSagaData: boolean;
  ShowNoPluginActiveLeged: boolean;
  SagaCompleted: boolean;
  FormattedCompletionTime: string;
  SagaUpdates: SagaUpdateViewModel[];
}

const vm = computed<SagaViewModel>(() => {
  const completedUpdate = sagaDiagramStore.sagaHistory?.changes.find((update) => update.status === "completed");
  const completionTime = completedUpdate ? new Date(completedUpdate.finish_time) : null;

  const invokedSaga = props.message?.invoked_sagas?.[0];

  return {
    SagaTitle: typeToName(invokedSaga?.saga_type) || "Unknown saga",
    SagaGuid: invokedSaga?.saga_id || "Missing guid",
    MessageIdUrl: routeLinks.messages.successMessage.link(props.message.message_id, props.message.id),
    ParticipatedInSaga: invokedSaga !== undefined,
    HasSagaData: !!sagaDiagramStore.sagaHistory,
    ShowNoPluginActiveLeged: !sagaDiagramStore.sagaHistory && invokedSaga !== undefined,
    SagaCompleted: !!completedUpdate,
    FormattedCompletionTime: completionTime ? `${completionTime.toLocaleDateString()} ${completionTime.toLocaleTimeString()}` : "",
    SagaUpdates: parseSagaUpdates(sagaDiagramStore.sagaHistory),
  };
});
</script>

<template>
  <div class="saga-container">
    <div class="header">
      <div class="saga-top-logo"><img class="saga-top-logo-image" :src="SagaIcon" alt="" />Saga</div>
      <button class="saga-button" aria-label="message-not-involved-in-saga"><img class="saga-button-icon" :src="ToolbarEndpointIcon" alt="" />Show Message Data</button>
    </div>

    <!-- No saga Data Available container -->
    <div v-if="!vm.ParticipatedInSaga" class="body">
      <div class="saga-message">
        <div class="saga-message-container">
          <img class="saga-message-image" :src="NoSagaIcon" alt="" />
          <h1 role="status" aria-label="message-not-involved-in-saga" class="saga-message-title">No Saga Data Available</h1>
        </div>
      </div>
    </div>

    <!-- Saga Audit Plugin Needed container -->
    <div v-if="vm.ShowNoPluginActiveLeged" class="body" role="status" aria-label="saga-plugin-needed">
      <div class="saga-message">
        <div class="saga-message-container">
          <img class="saga-message-image" :src="NoSagaIcon" alt="" />
          <h1 class="saga-message-title">Saga audit plugin needed to visualize saga</h1>
          <div class="saga-message-box">
            <p class="saga-message-text">To visualize your saga, please install the appropriate nuget package in your endpoint</p>
            <a href="https://www.nuget.org/packages/NServiceBus.SagaAudit" class="saga-message-link">install-package NServiceBus.SagaAudit</a>
            <img class="saga-message-icon" :src="CopyClipboardIcon" alt="" />
          </div>
        </div>
      </div>
    </div>

    <!-- Main Saga Data container -->
    <div v-if="vm.HasSagaData" role="table" aria-label="saga-sequence-list" class="body" style="display: flex">
      <div class="container">
        <div class="block">
          <div class="row row--center">
            <div class="cell cell--center">
              <div class="cell-inner cell-inner-center">
                <RouterLink :to="vm.MessageIdUrl">← Back to Messages</RouterLink>
                <h1 aria-label="saga name" class="main-title">{{ vm.SagaTitle }}</h1>
                <div>
                  <b>guid</b> <span role="note" aria-label="saga guid">{{ vm.SagaGuid }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Iterate through each saga update -->
        <div v-for="(update, index) in vm.SagaUpdates" :key="index" class="block" role="row">
          <!-- Initiating message and saga status header -->
          <div class="row">
            <div class="cell cell--side">
              <div class="cell-inner cell-inner-side">
                <img class="saga-icon saga-icon--side-cell" :src="CommandIcon" alt="" />
                <h2 class="message-title" aria-label="initiating message type">{{ update.InitiatingMessageType }}</h2>
                <div class="timestamp" aria-label="initiating message timestamp">{{ update.FormattedInitiatingMessageTimestamp }}</div>
              </div>
            </div>
            <div class="cell cell--center cell-flex">
              <div class="cell-inner cell-inner-center cell-inner--align-bottom">
                <img class="saga-icon saga-icon--center-cell" :src="update.IsFirstNode ? SagaInitiatedIcon : SagaUpdatedIcon" alt="" />
                <h2 class="saga-status-title saga-status-title--inline">{{ update.StatusDisplay }}</h2>
                <div class="timestamp timestamp--inline" aria-label="time stamp">{{ update.FormattedStartTime }}</div>
              </div>
            </div>
          </div>

          <!-- Saga properties and outgoing messages -->
          <div class="row">
            <!-- Left side - Message Data box -->
            <div class="cell cell--side cell--left-border cell--aling-top">
              <div class="message-data message-data--active">
                <!-- Generic message data boxes since we don't have specific data -->
                <div class="message-data-box" v-if="update.InitiatingMessageType">
                  <b class="message-data-box-text">OrderId</b>
                  <span class="message-data-box-text">=</span>
                  <span class="message-data-box-text--ellipsis" title="Sample ID">Sample ID</span>
                </div>
              </div>
            </div>

            <!-- Center - Saga properties -->
            <div class="cell cell--center cell--center--border">
              <div class="cell-inner cell-inner-line">
                <div class="saga-properties">
                  <a class="saga-properties-link" href="">All Properties</a> /
                  <a class="saga-properties-link saga-properties-link--active" href="">Updated Properties</a>
                </div>

                <!-- Display saga properties if available -->
                <ul v-if="update.Status !== 'completed'" class="saga-properties-list">
                  <li class="saga-properties-list-item">
                    <span class="saga-properties-list-text" title="Property (new)">Property (new)</span>
                    <span class="saga-properties-list-text">=</span>
                    <span class="saga-properties-list-text" title="Sample Value"> Sample Value</span>
                  </li>
                </ul>
              </div>
            </div>

            <!-- Right side - outgoing messages (non-timeout) -->
            <div class="cell cell--side cell--aling-top" v-if="update.HasNonTimeoutMessages">
              <div class="cell-inner cell-inner-right"></div>
              <template v-for="(msg, msgIndex) in update.NonTimeoutMessages" :key="msgIndex">
                <div class="cell-inner cell-inner-side">
                  <img class="saga-icon saga-icon--side-cell" :src="msg.IsEventMessage ? EventIcon : CommandIcon" :alt="msg.IsEventMessage ? 'Event' : 'Command'" />
                  <h2 class="message-title">{{ msg.MessageFriendlyTypeName }}</h2>
                  <div class="timestamp">{{ msg.FormattedTimeSent }}</div>
                </div>
                <div class="message-data message-data--active">
                  <div class="message-data-box">
                    <b class="message-data-box-text">OrderId</b>
                    <span class="message-data-box-text">=</span>
                    <span class="message-data-box-text--ellipsis" title="Sample ID">Sample ID</span>
                  </div>
                </div>
              </template>
            </div>
          </div>

          <!-- Display each outgoing timeout message in separate rows -->
          <template v-for="(msg, msgIndex) in update.TimeoutMessages" :key="'timeout-' + msgIndex">
            <div class="row row--right">
              <div class="cell cell--center">
                <div class="cell-inner cell-inner-line">
                  <img class="saga-icon saga-icon--center-cell saga-icon--overlap" :src="SagaTimeoutIcon" alt="" />
                  <a class="timeout-status" href="" aria-label="timeout requested">Timeout Requested = {{ msg.TimeoutFriendly }}</a>
                </div>
              </div>
              <div class="cell cell--side"></div>
              <div class="cell cell--center cell--top-border">
                <div class="cell-inner cell-inner-top"></div>
                <div class="cell-inner cell-inner-line"></div>
              </div>
              <div class="cell cell--side">
                <div class="cell-inner cell-inner-right"></div>
                <div class="cell-inner cell-inner-side cell-inner-side--active">
                  <img class="saga-icon saga-icon--side-cell" :src="TimeoutIcon" alt="" />
                  <h2 class="message-title" aria-label="timeout message type">{{ msg.MessageFriendlyTypeName }}</h2>
                  <div class="timestamp" aria-label="timeout message timestamp">{{ msg.FormattedTimeSent }}</div>
                </div>
                <div class="message-data message-data--active">
                  <div class="message-data-box">
                    <b class="message-data-box-text">OrderId</b>
                    <span class="message-data-box-text">=</span>
                    <span class="message-data-box-text--ellipsis" title="Sample ID">Sample ID</span>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- Saga Completed section -->
        <div v-if="vm.SagaCompleted" class="block">
          <div class="row row--center">
            <div class="cell cell--center cell--inverted">
              <div class="cell-inner cell-inner-center">
                <img class="saga-icon saga-icon--center-cell" :src="SagaCompletedIcon" alt="" />
                <h2 class="saga-status-title saga-status-title--inline">Saga Completed</h2>
                <div class="timestamp">{{ vm.FormattedCompletionTime }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Layout styles */

.saga-container {
  display: flex;
  flex-direction: column;
  /* Must validate parent height in order to set this element min-height value */
  min-height: 500px;
  background-color: #ffffff;
}

/* Main containers */

.header {
  padding: 0.5rem;
  border-bottom: solid 2px #ddd;
}
.body {
  display: flex;
  flex: 1;
  justify-content: center;
}

/* Saga messages */

.saga-message {
  display: flex;
  align-items: center;
}
.saga-message-container {
}
.saga-message-image {
  display: block;
  margin: auto;
}
.saga-message-title {
  text-align: center;
  margin: 0.2rem 0 0;
  font-size: 1.5rem;
  color: #cccccc;
}
.saga-message-box {
  margin-top: 1rem;
  padding: 1.5rem 2rem;
  color: #535353;
  font-size: 1rem;
  font-weight: 900;
  text-align: center;
  background-color: #e4e4e4;
}
.saga-message-text {
  margin: 0;
}
.saga-message-link {
  font-family: "Courier New", Courier, monospace;
  color: #aaaaaa;
}
.saga-message-icon {
  display: inline-block;
  margin-left: 0.5rem;
  width: 1.5rem;
}
.container {
  width: 66.6667%;
  min-width: 50rem;
}
.block {
  /* border: solid 1px lightgreen; */
}
.row {
  display: flex;
  /* border: solid 1px red; */
}
.row--center {
  justify-content: center;
}
.row--right {
  justify-content: right;
}
.cell {
  padding: 0;
}
.cell-flex {
  display: flex;
}
.cell--side {
  align-self: flex-end;
  width: 25%;
  padding: 0;
}
.cell--aling-top {
  align-self: flex-start;
}
.cell--left-border {
  border-top: solid 2px #000000;
}
.cell--center {
  width: 50%;
  background-color: #f2f2f2;
  border: 0;
}
.cell--center--border {
  display: flex;
  flex-direction: column;
  border-top: solid 2px #000000;
}
.cell--inverted {
  background-color: #333333;
  color: #ffffff;
  margin-bottom: 2rem;
}

.cell--top-border {
  display: flex;
  flex-direction: column;
}
.cell-inner {
  /* padding: 0.5rem; */
}
.cell-inner-top {
  border-top: solid 2px #000000;
  margin-left: 1rem;
}
.cell-inner-center {
  padding: 0.5rem;
}
.cell-inner-line {
  flex-grow: 1;
  padding: 0.25rem 0.5rem;
  border-left: solid 2px #000000;
  margin-left: 1rem;
}
.cell-inner-line:first-child {
  flex-grow: 1;
}
.cell-inner-center:first-child {
  flex-grow: 1;
}
.cell-inner-side {
  margin-top: 1rem;
  padding: 0.25rem 0.25rem 0;
  border: solid 2px #cccccc;
  background-color: #cccccc;
}
.cell-inner-side:nth-child(-n + 2) {
  margin-top: 0;
}
.cell-inner-side--active {
  border: solid 2px #000000;
}
.cell-inner-right {
  position: relative;
  min-height: 2.5rem;
  border: solid 2px #000000;
  border-left: 0;
  border-bottom: 0;
  margin-right: 50%;
}
.cell-inner-right:after {
  position: absolute;
  display: block;
  content: "";
  border: solid 6px #000000;
  border-top-width: 10px;
  border-left-color: transparent;
  border-right-color: transparent;
  border-bottom: 0;
  bottom: 0;
  margin-left: 100%;
  left: -5px;
}
.cell-inner--align-bottom {
  align-self: flex-end;
}

/* Content styles */

* {
  /* font-family: Verdana, Geneva, Tahoma, sans-serif; */
}

.saga-top-logo {
  margin-bottom: 0.5rem;
  color: #00a3c4;
  font-size: 1.1rem;
}
.saga-top-logo-image {
  width: 1.1rem;
  height: 1.1rem;
  margin-top: -0.4rem;
  margin-right: 0.25rem;
}
.saga-button {
  display: block;
  padding: 0.2rem 0.7rem 0.1rem;
  color: #555555;
  font-size: 0.75rem;
  border: solid 2px #00a3c4;
  background-color: #e3e4e5;
}
.saga-button:focus,
.saga-button:hover {
  background-color: #daebfc;
}

.saga-button:active,
.saga-button--active {
  background-color: #c3dffc;
}
.saga-button-icon {
  width: 0.75rem;
  height: 0.75rem;
  margin-top: -0.2rem;
  margin-right: 0.25rem;
}

.main-title {
  margin: 0.3rem 0;
  padding-bottom: 0.5rem;
  border-bottom: solid 2px #00a3c4;
  font-size: 1.5rem;
}
.back-link {
  font-size: 0.75rem;
}
.saga-status-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 900;
}
.cell--inverted .saga-status-title {
  font-size: 0.9rem;
}
.saga-status-title--inline {
  display: inline-block;
}
.message-title {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 900;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.timestamp {
  font-size: 0.9rem;
}
.timestamp--inline {
  display: inline-block;
  margin-left: 0.5rem;
  font-size: 0.8rem;
}
.cell--inverted .timestamp {
  margin-left: 1.2rem;
}
.saga-properties {
  margin: 0 -0.25rem;
  padding: 0.25rem;
  font-size: 0.6rem;
  text-transform: uppercase;
}
.saga-properties-link {
  padding: 0 0.25rem;
  text-decoration: underline;
}
.saga-properties-link--active {
  font-weight: 900;
  color: #000000;
}
.saga-properties-list {
  margin: 0;
  padding-left: 0.25rem;
  list-style: none;
}
.saga-properties-list-item {
  display: flex;
}
.saga-properties-list-text {
  display: inline-block;
  padding-top: 0.25rem;
  padding-right: 0.75rem;
  overflow: hidden;
  font-size: 0.75rem;
  white-space: nowrap;
}
.saga-properties-list-text:first-child {
  min-width: 8rem;
  max-width: 8rem;
  display: inline-block;
  text-overflow: ellipsis;
}
.saga-properties-list-text:last-child {
  padding-right: 0;
  text-overflow: ellipsis;
}

.timeout-status {
  display: inline-block;
  font-size: 1rem;
  font-weight: 900;
}

.message-data {
  display: none;
  padding: 0.2rem;
  background-color: #ffffff;
  border: solid 1px #cccccc;
  font-size: 0.75rem;
}
.message-data--active {
  display: block;
}
.message-data-box {
  display: flex;
}
.message-data-box-text {
  display: inline-block;
  margin-right: 0.25rem;
}
.message-data-box-text--ellipsis {
  display: inline-block;
  overflow: hidden;
  max-width: 100%;
  padding: 0%;
  white-space: nowrap;
  text-overflow: ellipsis;
}

/* Icon styles */

.saga-icon {
  display: block;
  float: left;
  margin-right: 0.35rem;
}
.saga-icon--side-cell {
  width: 2rem;
  height: 2rem;
  padding: 0.23rem;
}
.saga-icon--center-cell {
  float: none;
  display: inline;
  width: 1rem;
  height: 1rem;
  margin-top: -0.3rem;
}
.saga-icon--overlap {
  margin-left: -1rem;
}
</style>
