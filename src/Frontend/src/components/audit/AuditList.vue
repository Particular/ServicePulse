<script setup lang="ts">
import routeLinks from "@/router/routeLinks";
import { useAuditStore } from "@/stores/AuditStore";
import { storeToRefs } from "pinia";
import { MessageStatus } from "@/resources/Message";
import moment from "moment";
import { useRoute } from "vue-router";
import FilterInput from "@/components/FilterInput.vue";
import ResultsCount from "@/components/ResultsCount.vue";
import DropDown from "@/components/DropDown.vue";
import { computed } from "vue";
import { formatDotNetTimespan, formatTypeName } from "@/composables/formatUtils.ts";

const store = useAuditStore();
const { messages, sortBy, totalCount, messageFilterString, selectedEndpointName, endpoints, itemsPerPage } = storeToRefs(store);
const route = useRoute();

const endpointNames = computed(() => {
  return endpoints.value.map((endpoint) => ({
    text: endpoint.name,
    value: endpoint.name,
  }));
});
const selectedEndpointItem = computed(() => ({ text: selectedEndpointName.value, value: selectedEndpointName.value }));
const sortByItems = [
  { text: "Latest sent", value: "time_sent,desc" },
  { text: "Oldest sent", value: "time_sent,asc" },
  { text: "Fastest processing", value: "processing_time,asc" },
  { text: "Slowest processing", value: "processing_time,desc" },
];
const selectedSortByItem = computed(() => sortByItems.find((item) => item.value === `${sortBy.value.property},${sortBy.value.isAscending ? "asc" : "desc"}`));

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
</script>

<template>
  <div>
    <div class="row">
      <div class="filters">
        <div class="text-search-container">
          <FilterInput v-model="messageFilterString" placeholder="Search messages..." aria-label="Search messages" />
        </div>
        <div>
          <DropDown
            label="Filter by endpoint"
            :callback="
              (item) => {
                selectedEndpointName = item.value;
              }
            "
            :select-item="selectedEndpointItem"
            :items="endpointNames"
          />
        </div>
        <div>
          <DropDown
            label="Show"
            :callback="
              (item) => {
                itemsPerPage = parseInt(item.value, 10);
              }
            "
            :select-item="{ text: itemsPerPage.toString(), value: itemsPerPage.toString() }"
            :items="[
              { text: '50', value: '50' },
              { text: '100', value: '100' },
              { text: '250', value: '250' },
              { text: '500', value: '500' },
            ]"
          />
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
      <section class="section-table" role="table" aria-label="endpoint-instances">
        <!--Table rows-->
        <!--NOTE: currently the DataView pages on the client only: we need to make it server data aware (i.e. the total will be the count from the server, not the length of the data we have locally)-->
        <div class="messages" role="rowgroup" aria-label="messages">
          <div role="row" :aria-label="message.message_id" class="row grid-row" v-for="message in messages" :key="message.id">
            <div role="cell" aria-label="status" class="status" :title="statusToName(message.status)">
              <div class="status-icon" :class="statusToIcon(message.status)"></div>
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

.section-table {
  overflow: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.messages {
  flex: 1;
  overflow: auto;
}

.status {
  width: 5em;
  text-align: center;
}

.status-icon {
  color: white;
  border-radius: 0.75em;
  width: 1.2em;
  height: 1.2em;
}

.status-icon::before {
  vertical-align: middle;
  font-size: 0.85em;
}

.successful {
  background: #6cc63f;
}
.successful::before {
  content: "\f00c";
}

.resolved-successfully {
  background: #3f881b;
}
.resolved-successfully::before {
  content: "\f01e";
}

.failed {
  background: #c63f3f;
}
.failed::before {
  content: "\f00d";
}

.archived {
  background: #000000;
}
.archived::before {
  content: "\f187";
  font-size: 0.85em;
}

.repeated-failure {
  background: #c63f3f;
}
.repeated-failure::before {
  content: "\f00d\f00d";
  font-size: 0.6em;
}

.retry-issued {
  background: #cccccc;
  color: #000000;
}
.retry-issued::before {
  content: "\f01e";
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
