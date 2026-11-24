<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { useDebounceFn } from "@vueuse/core";
import FilterInput from "@/components/FilterInput.vue";
import PaginationStrip from "@/components/PaginationStrip.vue";
import NoData from "@/components/NoData.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import TimeSince from "@/components/TimeSince.vue";
import TimeoutStatusBadge from "@/components/timeouts/TimeoutStatusBadge.vue";
import routeLinks from "@/router/routeLinks";
import useTimeoutsStoreAutoRefresh from "@/composables/useTimeoutsStoreAutoRefresh";
import type { SagaTimeoutListStatus } from "@/resources/SagaTimeout";
import type { TimeoutSortField } from "@/stores/TimeoutsStore";
import { formatUtc, fullTypeName, shortTypeName, sourceText } from "./timeoutFormatting";

const route = useRoute();
const { store } = useTimeoutsStoreAutoRefresh();
const { timeouts, totalCount, loading, pageNumber, itemsPerPage, searchText, endpointFilter, sagaTypeFilter, sortBy, sortDirection, knownEndpoints, knownSagaTypes } = storeToRefs(store);

const status = computed(() => (route.path.split("/").pop() ?? "pending") as SagaTimeoutListStatus);
watch(status, (value) => store.setStatus(value), { immediate: true });

const endpointInput = ref(endpointFilter.value);
const sagaTypeInput = ref(sagaTypeFilter.value);
const applyEndpoint = useDebounceFn((value: string) => (endpointFilter.value = value.trim()), 600);
const applySagaType = useDebounceFn((value: string) => (sagaTypeFilter.value = value.trim()), 600);
watch(endpointInput, applyEndpoint);
watch(sagaTypeInput, applySagaType);

const emptyMessage = computed(() => {
  switch (status.value) {
    case "overdue":
      return "No overdue timeouts";
    case "all":
      return "No timeouts";
    default:
      return "No pending timeouts";
  }
});

const sortColumns: { field: TimeoutSortField; label: string }[] = [
  { field: "due_time", label: "Due" },
  { field: "timeout_type", label: "Timeout" },
  { field: "saga_type", label: "Saga" },
  { field: "last_changed_at", label: "Last change" },
];

function sortIndicator(field: TimeoutSortField) {
  if (sortBy.value !== field) return "";
  return sortDirection.value === "asc" ? "▲" : "▼";
}

const firstItem = computed(() => (totalCount.value === 0 ? 0 : (pageNumber.value - 1) * itemsPerPage.value + 1));
const lastItem = computed(() => Math.min(pageNumber.value * itemsPerPage.value, totalCount.value));
</script>

<template>
  <section class="timeouts-list">
    <div class="filters" role="search" aria-label="timeout-filters">
      <div class="filter filter-wide">
        <FilterInput v-model="searchText" placeholder="Search by saga, correlation value, or payload content" aria-label="Search timeouts" />
      </div>
      <div class="filter">
        <input v-model="endpointInput" type="search" class="form-control" placeholder="Endpoint: All" aria-label="Filter by endpoint" list="timeout-endpoints" />
        <datalist id="timeout-endpoints">
          <option v-for="endpoint in knownEndpoints" :key="endpoint" :value="endpoint" />
        </datalist>
      </div>
      <div class="filter">
        <input v-model="sagaTypeInput" type="search" class="form-control" placeholder="Saga type: All" aria-label="Filter by saga type" list="timeout-saga-types" />
        <datalist id="timeout-saga-types">
          <option v-for="sagaType in knownSagaTypes" :key="sagaType" :value="sagaType" />
        </datalist>
      </div>
    </div>

    <LoadingSpinner v-if="loading" />
    <NoData v-else-if="timeouts.length === 0" :message="emptyMessage" />
    <template v-else>
      <table class="table timeouts-table" aria-label="timeouts-table">
        <thead>
          <tr>
            <th v-for="column in sortColumns" :key="column.field" scope="col">
              <button type="button" class="sort-button" :aria-label="`Sort by ${column.label}`" @click="store.setSort(column.field)">{{ column.label }} {{ sortIndicator(column.field) }}</button>
            </th>
            <th scope="col">Status</th>
            <th scope="col"><span class="visually-hidden">Details</span></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="timeout in timeouts" :key="timeout.timeout_id" aria-label="timeout-row">
            <td>
              <div class="primary"><TimeSince :date-utc="timeout.due_time" /></div>
              <div class="secondary">{{ formatUtc(timeout.due_time) }}</div>
            </td>
            <td>
              <div class="primary" :title="timeout.timeout_type">{{ shortTypeName(timeout.timeout_type) }}</div>
              <div class="secondary">{{ timeout.endpoint_name }}</div>
            </td>
            <td>
              <div>{{ shortTypeName(timeout.saga_type) }}</div>
              <div class="secondary mono">{{ fullTypeName(timeout.saga_type) }}</div>
              <div v-if="timeout.correlation_value" class="mono correlation" title="Correlation value">{{ timeout.correlation_value }}</div>
            </td>
            <td>
              <div>{{ timeout.last_change_kind }} {{ sourceText(timeout.last_change_source) }}</div>
              <div class="secondary">
                {{ formatUtc(timeout.last_changed_at) }}<template v-if="timeout.host"> ({{ timeout.host }})</template>
              </div>
            </td>
            <td><TimeoutStatusBadge :timeout="timeout" /></td>
            <td class="text-end">
              <RouterLink :to="routeLinks.timeouts.details.link(timeout.timeout_id)" aria-label="timeout-details-link">Details</RouterLink>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="list-footer">
        <span aria-label="timeouts-results-count">Showing {{ firstItem }} to {{ lastItem }} of {{ totalCount }} timeouts</span>
        <PaginationStrip v-model="pageNumber" :items-per-page="itemsPerPage" :total-count="totalCount" />
      </div>
    </template>
  </section>
</template>

<style scoped>
.timeouts-list {
  margin-top: 1rem;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.filter {
  flex: 0 1 14rem;
}

.filter-wide {
  flex: 1 1 22rem;
}

.filter input.form-control {
  height: 2.6em;
}

.timeouts-table {
  background-color: #fff;
}

.timeouts-table th {
  font-size: 12px;
  text-transform: uppercase;
  color: #929e9e;
}

.sort-button {
  border: none;
  background: none;
  padding: 0;
  font: inherit;
  color: inherit;
  text-transform: inherit;
}

.primary {
  font-weight: bold;
}

.secondary {
  font-size: 13px;
  color: #6c757d;
}

.mono {
  font-family: monospace;
  font-size: 13px;
}

.correlation {
  margin-top: 0.25rem;
}

.list-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}
</style>
