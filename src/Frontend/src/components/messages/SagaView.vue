<script setup lang="ts">
import Message from "@/resources/Message";
import { computed, onUnmounted, watch } from "vue";
import { RouterLink } from "vue-router";
import routeLinks from "@/router/routeLinks";
import { typeToName } from "@/composables/typeHumanizer";
import { useSagaHistoryStore } from "@/stores/sagaHistoryStore";

const props = defineProps<{
  message: Message;
}>();

// Use the store instead of saga history prop
const sagaHistoryStore = useSagaHistoryStore();

// Add logic to watch for message and set saga ID when component mounts or message changes
watch(
  () => props.message?.invoked_sagas,
  (newSagas) => {
    if (newSagas?.length > 0) {
      sagaHistoryStore.setSagaId(newSagas[0].saga_id);
    } else {
      sagaHistoryStore.clearSagaHistory();
    }
  },
  { immediate: true }
);

// Clean up when component is unmounted
onUnmounted(() => {
  sagaHistoryStore.clearSagaHistory();
});

interface OutgoingMessage {
  MessageType: string;
  MessageId: string;
  TimeSent: Date;
  FormattedTimeSent: string; // Pre-formatted date string
  DeliveryDelay?: string;
  HasTimeout: boolean;
  TimeoutSeconds: string;
  Intent: string;
}

interface SagaViewModel {
  SagaTitle: string;
  SagaGuid: string;
  MessageIdUrl: string;
  ParticipatedInSaga: boolean;
  HasSagaData: boolean;
  ShowNoPluginActiveLeged: boolean;
  SagaCompleted: boolean;
  CompletionTime: Date | null;
  FormattedCompletionTime: string; // Pre-formatted completion time
  SagaUpdates: Array<{
    StartTime: Date;
    FormattedStartTime: string; // Pre-formatted start time
    FinishTime: Date;
    InitiatingMessageType: string;
    InitiatingMessageTimestamp: Date;
    FormattedInitiatingMessageTimestamp: string; // Pre-formatted initiating message timestamp
    Status: string;
    StatusDisplay: string;
    OutgoingMessages: OutgoingMessage[];
    HasTimeout: boolean;
  }>;
}

const vm = computed<SagaViewModel>(() => {
  const completedUpdate = sagaHistoryStore.sagaHistory?.changes.find((update) => update.status === "completed");
  const completionTime = completedUpdate ? new Date(completedUpdate.finish_time) : null;

  return {
    SagaTitle: (props.message.invoked_sagas.length > 0 && typeToName(props.message.invoked_sagas[0].saga_type)) || "Unknown saga",
    SagaGuid: (props.message.invoked_sagas.length > 0 && props.message.invoked_sagas[0].saga_id) || "Missing guid",
    MessageIdUrl: routeLinks.messages.message.link(props.message.id),
    ParticipatedInSaga: !!props.message.invoked_sagas.length,
    HasSagaData: !!sagaHistoryStore.sagaHistory,
    ShowNoPluginActiveLeged: !sagaHistoryStore.sagaHistory && props.message?.invoked_sagas.length > 0,
    SagaCompleted: !!completedUpdate,
    CompletionTime: completionTime,
    FormattedCompletionTime: completionTime ? `${completionTime.toLocaleDateString()} ${completionTime.toLocaleTimeString()}` : "",
    SagaUpdates:
      sagaHistoryStore.sagaHistory?.changes
        .map((update) => {
          // Convert dates
          const startTime = new Date(update.start_time);
          const finishTime = new Date(update.finish_time);
          const initiatingMessageTimestamp = new Date(update.initiating_message?.time_sent || Date.now());

          // Process all outgoing messages
          const outgoingMessages = update.outgoing_messages.map((msg) => {
            const delivery_delay = msg.delivery_delay || "00:00:00";
            const timeSent = new Date(msg.time_sent);

            return {
              MessageType: typeToName(msg.message_type) || "",
              MessageId: msg.message_id,
              TimeSent: timeSent,
              FormattedTimeSent: `${timeSent.toLocaleDateString()} ${timeSent.toLocaleTimeString()}`,
              DeliveryDelay: delivery_delay,
              HasTimeout: !!delivery_delay && delivery_delay !== "00:00:00",
              TimeoutSeconds: delivery_delay.split(":")[2] || "0",
              Intent: msg.intent,
            };
          });

          // Check if any of the outgoing messages have a timeout
          const hasTimeout = outgoingMessages.some((msg) => msg.HasTimeout);

          return {
            StartTime: startTime,
            FormattedStartTime: `${startTime.toLocaleDateString()} ${startTime.toLocaleTimeString()}`,
            FinishTime: finishTime,
            Status: update.status,
            StatusDisplay: update.status === "new" ? "Saga Initiated" : update.status === "completed" ? "Saga Completed" : "Saga Updated",
            InitiatingMessageType: typeToName(update.initiating_message?.message_type || "Unknown Message") || "",
            InitiatingMessageTimestamp: initiatingMessageTimestamp,
            FormattedInitiatingMessageTimestamp: `${initiatingMessageTimestamp.toLocaleDateString()} ${initiatingMessageTimestamp.toLocaleTimeString()}`,
            OutgoingMessages: outgoingMessages,
            HasTimeout: hasTimeout,
          };
        })
        .sort((a, b) => a.StartTime.getTime() - b.StartTime.getTime())
        .sort((a, b) => a.FinishTime.getTime() - b.FinishTime.getTime()) || [],
  };
});
</script>

<template>
  <div class="saga-container">
    <div class="header">
      <div>Saga</div>
      <button aria-label="message-not-involved-in-saga">Show Message Data</button>
    </div>
    <!-- No saga Data Available container -->

    <div v-if="!vm.ParticipatedInSaga" class="body">
      <div class="saga-message">
        <div class="saga-message-container">
          <img class="saga-message-image" src="@/assets/NoSaga.svg" alt="" />
          <h1 role="status" aria-label="message-not-involved-in-saga" class="saga-message-title">No Saga Data Available</h1>
        </div>
      </div>
    </div>
    <!-- Saga Audit Plugin Needed container -->

    <div v-if="vm.ShowNoPluginActiveLeged" class="body" role="status" aria-label="saga-plugin-needed">
      <div class="saga-message">
        <div class="saga-message-container">
          <img class="saga-message-image" src="@/assets/NoSaga.svg" alt="" />
          <h1 class="saga-message-title">Saga audit plugin needed to visualize saga</h1>
          <div class="saga-message-box">
            <p class="saga-message-text">To visualize your saga, please install the appropriate nuget package in your endpoint</p>
            <a href="https://www.nuget.org/packages/NServiceBus.SagaAudit" class="saga-message-link">install-package NServiceBus.SagaAudit</a>
            <img class="saga-message-icon" src="@/assets/Shell_CopyClipboard.svg" alt="" />
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
              <div class="cell-inner">
                <!-- //TODO: this link needs to be configured so it navigates back but to the corresponding message in the flow diagram -->
                <RouterLink :to="vm.MessageIdUrl">← Back to Messages</RouterLink>
                <h1 aria-label="saga name" class="main-title">{{ vm.SagaTitle }}</h1>
                <div>
                  <b>guid</b> <span role="note" aria-label="saga guid">{{ vm.SagaGuid }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-for="(update, index) in vm.SagaUpdates" :key="index" class="block" role="row">
          <div class="row">
            <div class="cell cell--side cell--left">
              <div class="cell-inner cell-inner-side">
                <img class="saga-icon saga-icon--side-cell" src="@/assets/CommandIcon.svg" alt="" />
                <h2 class="message-title" aria-label="initiating message type">{{ update.InitiatingMessageType }}</h2>
                <div class="timestamp" aria-label="initiating message timestamp">{{ update.FormattedInitiatingMessageTimestamp }}</div>
              </div>
            </div>
            <div class="cell cell--center cell--center--border">
              <div class="cell-inner">
                <img class="saga-icon saga-icon--center-cell" src="@/assets/SagaInitiatedIcon.svg" alt="" />
                <h2 class="saga-status saga-status--inline">{{ update.StatusDisplay }}</h2>
                <div class="timestamp timestamp--inline" aria-label="time stamp">{{ update.FormattedStartTime }}</div>
              </div>
            </div>
          </div>
          <div class="row row--center">
            <div class="cell cell--center">
              <div class="cell-inner cell-inner-center">
                <div class="properties">
                  <a class="properties-link" href="">All Properties</a> /
                  <a class="properties-link properties-link--active" href="">Updated Properties</a>
                </div>
                <template v-if="update.HasTimeout">
                  <div v-for="(msg, msgIndex) in update.OutgoingMessages.filter((m) => m.HasTimeout)" :key="msgIndex">
                    <img class="saga-icon saga-icon--center-cell saga-icon--overlap" src="@/assets/SagaTimeoutIcon.svg" alt="" />
                    <a class="timeout-status" href="" aria-label="timeout requested"> Timeout Requested = {{ msg.TimeoutSeconds }}s </a>
                  </div>
                </template>
              </div>
            </div>
          </div>

          <!-- Display each outgoing timeout message -->
          <div v-for="(msg, msgIndex) in update.OutgoingMessages.filter((m) => m.HasTimeout)" :key="'timeout-' + msgIndex" class="row row--right">
            <div class="cell cell--center cell--top-border">
              <div class="cell-inner cell-inner-top"></div>
            </div>
            <div class="cell cell--side">
              <div class="cell-inner cell-inner-right"></div>
              <div class="cell-inner cell-inner-side cell-inner-side--active">
                <img class="saga-icon saga-icon--side-cell" src="@/assets/TimeoutIcon.svg" alt="" />
                <h2 class="message-title" aria-label="timeout message type">{{ msg.MessageType }}</h2>
                <div class="timestamp" aria-label="timeout message timestamp">{{ msg.FormattedTimeSent }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Saga Completed section -->
        <div v-if="vm.SagaCompleted" class="block">
          <div class="row row--center">
            <div class="cell cell--center cell--inverted">
              <div class="cell-inner">
                <img class="saga-icon saga-icon--center-cell" src="@/assets/SagaCompletedIcon.svg" alt="" />
                <h2 class="saga-status saga-status--inline">Saga Completed</h2>
                <div class="timestamp" aria-label="saga completion time">{{ vm.FormattedCompletionTime }}</div>
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
  padding: 0.25rem;
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
  /* width: 66.6667%; */
}
.block {
}
.row {
  display: flex;
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
.cell--side {
  align-self: flex-end;
  width: 25%;
  padding: 0;
}
.cell--left {
  border-bottom: solid 2px #000000;
}
.cell--center {
  width: 50%;
  background-color: #f2f2f2;
  border: 0;
}
.cell--center--border {
  display: flex;
  border-bottom: solid 2px #000000;
}
.cell--inverted {
  background-color: #333333;
  color: #ffffff;
  margin-bottom: 2rem;
}

.cell--top-border {
  /* align-self: flex-start; */
}
.cell-inner {
  align-self: flex-end;
  padding: 0.5rem;
}
.cell-inner-top {
  border-top: solid 2px #000000;
  margin-left: 1rem;
}
.cell-inner-center {
  padding: 0.5rem;
  border-left: solid 2px #000000;
  margin-left: 1rem;
}
.cell-inner-side {
  padding: 0.25rem 0.25rem 0;
  border: solid 2px #cccccc;
  background-color: #cccccc;
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

/* Content styles */

/* * {
  font-family: Verdana, Geneva, Tahoma, sans-serif;
} */

.main-title {
  margin: 0.3rem 0;
  padding-bottom: 0.5rem;
  border-bottom: solid 2px #00a3c4;
  font-size: 1.5rem;
}
.back-link {
  font-size: 0.75rem;
}
.saga-status {
  margin: 0;
  font-size: 1rem;
  font-weight: 900;
}
.cell--inverted .saga-status {
  font-size: 0.9rem;
}
.saga-status--inline {
  display: inline-block;
}
.message-title {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 900;
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
.properties {
  font-size: 0.5rem;
  text-transform: uppercase;
}
.properties-link {
  padding: 0.2rem;
  text-decoration: underline;
}
.properties-link--active {
  font-weight: 900;
  color: #000000;
}
.timeout-status {
  display: inline-block;
  margin-top: 0.7rem;
  font-size: 1rem;
  font-weight: 900;
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
