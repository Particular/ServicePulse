<script setup lang="ts">
import routeLinks from "@/router/routeLinks";
import { useAuditStore } from "@/stores/AuditStore";
import { storeToRefs } from "pinia";
import Message, { MessageStatus } from "@/resources/Message";
import moment from "moment";
import { useRoute, useRouter } from "vue-router";
import ResultsCount from "@/components/ResultsCount.vue";
import { dotNetTimespanToMilliseconds, formatDotNetTimespan } from "@/composables/formatUtils.ts";
import "@vuepic/vue-datepicker/dist/main.css";
import FiltersPanel from "@/components/audit/FiltersPanel.vue";
import { onBeforeMount, watch } from "vue";
import RefreshConfig from "../RefreshConfig.vue";

const store = useAuditStore();
const { messages, totalCount, sortBy, messageFilterString, selectedEndpointName, itemsPerPage, dateRange } = storeToRefs(store);
const route = useRoute();
const router = useRouter();

function statusToName(messageStatus: MessageStatus) {
  switch (messageStatus) {
    case MessageStatus.Successful:
      return "Successful";
    case MessageStatus.ResolvedSuccessfully:
      return "Successful after retries";
    case MessageStatus.Failed:
      return "Failed";
    case MessageStatus.ArchivedFailure:
      return "Failed message deleted";
    case MessageStatus.RepeatedFailure:
      return "Repeated Failures";
    case MessageStatus.RetryIssued:
      return "Retry requested";
  }
}

function statusToIcon(messageStatus: MessageStatus) {
  switch (messageStatus) {
    case MessageStatus.Successful:
      return "fa successful";
    case MessageStatus.ResolvedSuccessfully:
      return "fa resolved-successfully";
    case MessageStatus.Failed:
      return "fa failed";
    case MessageStatus.ArchivedFailure:
      return "fa archived";
    case MessageStatus.RepeatedFailure:
      return "fa repeated-failure";
    case MessageStatus.RetryIssued:
      return "fa retry-issued";
  }
}

function hasWarning(message: Message) {
  if (message.status === MessageStatus.ResolvedSuccessfully) {
    return true;
  }

  if (dotNetTimespanToMilliseconds(message.critical_time) < 0) {
    return true;
  }

  if (dotNetTimespanToMilliseconds(message.processing_time) < 0) {
    return true;
  }

  if (dotNetTimespanToMilliseconds(message.delivery_time) < 0) {
    return true;
  }

  return false;
}

function navigateToMessage(message: Message) {
  const query = router.currentRoute.value.query;

  if (message.status === MessageStatus.Successful) {
    router.push({
      path: routeLinks.messages.successMessage.link(message.message_id, message.id),
      query: { ...query, ...{ back: route.path } },
    });
  } else {
    router.push({ path: routeLinks.messages.failedMessage.link(message.id), query: { ...query, ...{ back: route.path } } });
  }
}

function setQuery() {
  const query = router.currentRoute.value.query;

  watchHandle.pause();

  if (query.filter) {
    messageFilterString.value = query.filter as string;
  } else {
    messageFilterString.value = "";
  }
  if (query.sortBy && query.sortDir) {
    sortBy.value = { isAscending: query.sortDir === "asc", property: query.sortBy as string };
  } else {
    sortBy.value = { isAscending: false, property: "time_sent" };
  }
  if (query.pageSize) {
    itemsPerPage.value = parseInt(query.pageSize as string, 10);
  } else {
    itemsPerPage.value = 100;
  }
  if (query.from && query.to) {
    dateRange.value = [new Date(query.from as string), new Date(query.to as string)];
  } else {
    dateRange.value = [];
  }
  if (query.endpoint) {
    selectedEndpointName.value = query.endpoint as string;
  } else {
    selectedEndpointName.value = "";
  }

  watchHandle.resume();
}

let firstLoad = true;

onBeforeMount(async () => {
  setQuery();

  await Promise.all([store.refresh(), store.loadEndpoints()]);

  firstLoad = false;
});

watch(
  () => router.currentRoute.value.query,
  async () => {
    setQuery();
    await store.refresh();
  },
  { deep: true }
);

const watchHandle = watch([() => route.query, itemsPerPage, sortBy, messageFilterString, selectedEndpointName, dateRange], async () => {
  if (firstLoad) {
    return;
  }

  let from = "",
    to = "";
  if (dateRange.value.length === 2) {
    from = dateRange.value[0].toISOString();
    to = dateRange.value[1].toISOString();
  }

  await router.push({
    query: {
      sortBy: sortBy.value.property,
      sortDir: sortBy.value.isAscending ? "asc" : "desc",
      filter: messageFilterString.value,
      endpoint: selectedEndpointName.value,
      from,
      to,
      pageSize: itemsPerPage.value,
    },
  });

  await store.refresh();
});
</script>

<template>
  <div>
      <RefreshConfig id="auditListRefresh" @change="store.updateRefreshTimer" @manual-refresh="store.refresh" />
    <div class="row">
      <FiltersPanel />
    </div>
    <div class="row">
      <ResultsCount :displayed="messages.length" :total="totalCount" />
    </div>
    <div class="row results-table">
      <template v-for="message in messages" :key="message.id">
        <div class="item" @click="navigateToMessage(message)">
          <div class="status">
            <div class="status-container" v-tippy="{ content: statusToName(message.status) }">
              <div class="status-icon" :class="statusToIcon(message.status)"></div>
              <div v-if="hasWarning(message)" class="warning"></div>
            </div>
          </div>
          <div class="message-id">{{ message.message_id }}</div>
          <div class="message-type">{{ message.message_type }}</div>
          <div class="time-sent"><span class="label-name">Time Sent:</span>{{ moment(message.time_sent).local().format("LLLL") }}</div>
          <div class="critical-time"><span class="label-name">Critical Time:</span>{{ formatDotNetTimespan(message.critical_time) }}</div>
          <div class="processing-time"><span class="label-name">Processing Time:</span>{{ formatDotNetTimespan(message.processing_time) }}</div>
          <div class="delivery-time"><span class="label-name">Delivery Time:</span>{{ formatDotNetTimespan(message.delivery_time) }}</div>
        </div>
        <div class="spacer"></div>
      </template>
    </div>
  </div>
</template>

<style scoped>
@import "../list.css";
.results-table {
  margin-top: 1rem;
  margin-bottom: 5rem;
  padding: 10px 0;
  background-color: #ffffff;
}
.spacer {
  border-bottom: 1px solid #b1afaf;
  margin-top: 0.1rem;
  margin-bottom: 0.1rem;
}
.item {
  padding: 3px;
  border: 1px solid #ffffff;
  display: grid;
  grid-template-columns: 25px 1fr 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 6px;
  grid-template-areas:
    "status message-type message-type message-type time-sent"
    "status message-id processing-time critical-time delivery-time";
}
.item:hover {
  border: 1px solid #00a3c4;
  background-color: #edf6f7;
  cursor: pointer;
}
.label-name {
  margin-right: 4px;
  color: #777f7f;
}
.status {
  grid-area: status;
}
.message-id {
  grid-area: message-id;
}
.time-sent {
  grid-area: time-sent;
}
.message-type {
  grid-area: message-type;
  font-weight: bold;
}
.processing-time {
  grid-area: processing-time;
}
.critical-time {
  grid-area: critical-time;
}
.delivery-time {
  grid-area: delivery-time;
}
.status-container {
  color: white;
  width: 20px;
  height: 20px;
  position: relative;
}

.status-icon {
  background-position: center;
  background-repeat: no-repeat;
  height: 20px;
  width: 20px;
}

.warning {
  background-image: url("@/assets/warning.svg");
  background-position: bottom;
  background-repeat: no-repeat;
  height: 13px;
  width: 13px;
  position: absolute;
  right: 0;
  bottom: 0;
}

.successful {
  background-image: url("@/assets/status_successful.svg");
}

.resolved-successfully {
  background-image: url("@/assets/status_resolved.svg");
}

.failed {
  background-image: url("@/assets/status_failed.svg");
}

.archived {
  background-image: url("@/assets/status_archived.svg");
}

.repeated-failure {
  background-image: url("@/assets/status_repeated_failed.svg");
}

.retry-issued {
  background-image: url("@/assets/status_retry_issued.svg");
}

.grid-row {
  display: flex;
  position: relative;
  border-top: 1px solid #eee;
  border-right: 1px solid #fff;
  border-bottom: 1px solid #eee;
  border-left: 1px solid #fff;
  background-color: #fff;
  margin: 0;
}

.grid-row:nth-child(even) {
  background-color: #eee;
}
</style>
