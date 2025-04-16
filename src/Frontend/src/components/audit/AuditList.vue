<script setup lang="ts">
import routeLinks from "@/router/routeLinks";
import { useAuditStore } from "@/stores/AuditStore";
import { storeToRefs } from "pinia";
import Message, { MessageStatus } from "@/resources/Message";
import moment from "moment";
import { useRoute } from "vue-router";
import FilterInput from "@/components/FilterInput.vue";
import ResultsCount from "@/components/ResultsCount.vue";
import DropDown from "@/components/DropDown.vue";
import { computed, ref, watch } from "vue";
import { dotNetTimespanToMilliseconds, formatDotNetTimespan, formatTypeName } from "@/composables/formatUtils.ts";
import ListFilterSelector from "@/components/audit/ListFilterSelector.vue";
import "@vuepic/vue-datepicker/dist/main.css";
import DatePickerRange from "@/components/audit/DatePickerRange.vue";

const store = useAuditStore();
const { messages, sortBy, totalCount, messageFilterString, selectedEndpointName, endpoints, itemsPerPage, dateRange } = storeToRefs(store);
const route = useRoute();

const endpointNames = computed(() => {
  return [...new Set(endpoints.value.map((endpoint) => endpoint.name))];
});

const sortByItems = [
  { text: "Latest sent", value: "time_sent,desc" },
  { text: "Oldest sent", value: "time_sent,asc" },
  { text: "Fastest processing", value: "processing_time,asc" },
  { text: "Slowest processing", value: "processing_time,desc" },
];
const numberOfItemsPerPage = ["50", "100", "250", "500"];
const selectedSortByItem = computed(() => sortByItems.find((item) => item.value === `${sortBy.value.property},${sortBy.value.isAscending ? "asc" : "desc"}`));
const selectedItemsPerPage = ref(itemsPerPage.value.toString());

watch(selectedItemsPerPage, (newValue) => {
  itemsPerPage.value = Number(newValue);
});

function setSortBy(item: { text: string; value: string }) {
  const strings = item.value.split(",");
  sortBy.value = { isAscending: strings[1] === "asc", property: strings[0] };
}

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
</script>

<template>
  <div>
    <div class="row">
      <div class="filters">
        <div class="text-search-container">
          <FilterInput v-model="messageFilterString" placeholder="Search messages..." aria-label="Search messages" />
        </div>
        <div>
          <ListFilterSelector :items="numberOfItemsPerPage" instructions="Select how many result to display" v-model="selectedItemsPerPage" item-name="result" label="Show" default-empty-text="Any" :show-clear="false" :show-filter="false" />
        </div>
        <div>
          <ListFilterSelector :items="endpointNames" instructions="Select an endpoint" v-model="selectedEndpointName" item-name="endpoint" label="Endpoint" default-empty-text="Any" :show-clear="true" :show-filter="true" />
        </div>
        <div>
          <DatePickerRange v-model="dateRange" />
        </div>
        <div>
          <DropDown label="Sort by" :callback="setSortBy" :select-item="selectedSortByItem" :items="sortByItems" />
        </div>
      </div>
    </div>
    <div class="row">
      <ResultsCount :displayed="messages.length" :total="totalCount" />
    </div>
    <div class="row results-table">
      <section role="table" aria-label="endpoint-instances">
        <!--Table rows-->
        <!--NOTE: currently the DataView pages on the client only: we need to make it server data aware (i.e. the total will be the count from the server, not the length of the data we have locally)-->
        <div role="rowgroup" aria-label="messages">
          <div role="row" :aria-label="message.message_id" class="row grid-row" v-for="message in messages" :key="message.id">
            <div role="cell" aria-label="status" class="status" :title="statusToName(message.status)">
              <div class="status-container">
                <div class="status-icon" :class="statusToIcon(message.status)"></div>
                <div v-if="hasWarning(message)" class="warning"></div>
              </div>
            </div>
            <div role="cell" aria-label="message-id" class="col-3 message-id">
              <div class="box-header">
                <RouterLink v-if="message.status === MessageStatus.Successful" aria-label="details-link" :to="{ path: routeLinks.messages.successMessage.link(message.message_id, message.id), query: { back: route.path } }">
                  {{ message.message_id }}
                </RouterLink>
                <RouterLink v-else aria-label="details-link" :to="{ path: routeLinks.messages.failedMessage.link(message.id), query: { back: route.path } }">
                  {{ message.message_id }}
                </RouterLink>
              </div>
            </div>
            <div role="cell" aria-label="message-type" class="col-3 message-type">
              {{ formatTypeName(message.message_type) }}
            </div>
            <div role="cell" aria-label="time-sent" class="col-2 time-sent">
              {{ moment(message.time_sent).local().format("LLLL") }}
            </div>
            <div role="cell" aria-label="processing-time" class="col-2 processing-time">
              {{ formatDotNetTimespan(message.processing_time) }}
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
@import "../list.css";
.results-table {
  margin-top: 1rem;
  margin-bottom: 5rem;
}

.text-search-container {
  width: 25rem;
}

.filters {
  background-color: #f3f3f3;
  margin-top: 0.3125rem;
  border: #8c8c8c 1px solid;
  border-radius: 3px;
  padding: 0.3125rem;
  display: flex;
  gap: 1.1rem;
}

.status {
  width: 5em;
  text-align: center;
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
