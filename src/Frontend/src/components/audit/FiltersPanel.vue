<script setup lang="ts">
import FilterInput from "@/components/FilterInput.vue";
import { storeToRefs } from "pinia";
import { useAuditStore } from "@/stores/AuditStore.ts";
import ListFilterSelector from "@/components/audit/ListFilterSelector.vue";
import { computed, onBeforeMount, ref, watch } from "vue";
import DatePickerRange from "@/components/audit/DatePickerRange.vue";
import { useRouter } from "vue-router";

const store = useAuditStore();
const { sortBy, messageFilterString, selectedEndpointName, endpoints, itemsPerPage, dateRange } = storeToRefs(store);
const endpointNames = computed(() => {
  return [...new Set(endpoints.value.map((endpoint) => endpoint.name))];
});
const sortByItemsMap = new Map([
  ["Latest sent", "time_sent,desc"],
  ["Oldest sent", "time_sent,asc"],
  ["Fastest processing", "processing_time,asc"],
  ["Slowest processing", "processing_time,desc"],
]);
const numberOfItemsPerPage = ["50", "100", "250", "500"];
const sortByItems = computed(() => [...sortByItemsMap.keys()]);
const selectedSortByItem = ref(findKeyByValue(`${sortBy.value.property},${sortBy.value.isAscending ? "asc" : "desc"}`));
const selectedItemsPerPage = ref(itemsPerPage.value.toString());
const router = useRouter();

function findKeyByValue(searchValue: string) {
  for (const [key, value] of sortByItemsMap.entries()) {
    if (value === searchValue) {
      return key;
    }
  }
  return "";
}

onBeforeMount(() => {
  const query = router.currentRoute.value.query;

  watchHandle.pause();

  if (query.filter) {
    messageFilterString.value = query.filter as string;
  }
  if (query.sortBy && query.sortDir) {
    sortBy.value = { isAscending: query.sortDir === "asc", property: query.sortBy as string };
  }
  if (query.pageSize) {
    itemsPerPage.value = Number(query.pageSize as string);
  }
  if (query.from && query.to) {
    dateRange.value = [new Date(query.from as string), new Date(query.to as string)];
  }
  if (query.endpoint) {
    selectedEndpointName.value = query.endpoint as string;
  }

  watchHandle.resume();
});

const watchHandle = watch([sortBy, messageFilterString, selectedEndpointName, dateRange, itemsPerPage], () => {
  let from = "",
    to = "";
  if (dateRange.value.length === 2) {
    from = dateRange.value[0].toISOString();
    to = dateRange.value[1].toISOString();
  }
  router.push({ query: { sortBy: sortBy.value.property, sortDir: sortBy.value.isAscending ? "asc" : "desc", filter: messageFilterString.value, endpoint: selectedEndpointName.value, from, to, pageSize: itemsPerPage.value } });
});

watch(selectedItemsPerPage, (newValue) => {
  itemsPerPage.value = Number(newValue);
});

watch(selectedSortByItem, (newValue) => {
  const item = sortByItemsMap.get(newValue);
  if (item) {
    const strings = item.split(",");
    sortBy.value = { isAscending: strings[1] === "asc", property: strings[0] };
  } else {
    sortBy.value = { isAscending: true, property: "time_sent" };
  }
});
</script>

<template>
  <div class="filters">
    <div class="filter">
      <div class="filter-label"></div>
      <div class="filter-component text-search-container"><FilterInput v-model="messageFilterString" placeholder="Search messages..." aria-label="Search messages" /></div>
    </div>
    <div class="filter">
      <div class="filter-label">Endpoints:</div>
      <div class="filter-component">
        <ListFilterSelector :items="endpointNames" instructions="Select an endpoint" v-model="selectedEndpointName" item-name="endpoint" label="Endpoint" default-empty-text="Any" :show-clear="true" :show-filter="true" />
      </div>
    </div>
    <div class="filter">
      <div class="filter-label">Dates:</div>
      <div class="filter-component">
        <DatePickerRange v-model="dateRange" />
      </div>
    </div>
    <div class="filter">
      <div class="filter-label">Show:</div>
      <div class="filter-component">
        <ListFilterSelector :items="numberOfItemsPerPage" instructions="Select how many result to display" v-model="selectedItemsPerPage" item-name="result" default-empty-text="Any" :show-clear="false" :show-filter="false" />
      </div>
    </div>
    <div class="filter last-filter">
      <div class="filter-label">Sort:</div>
      <div class="filter-component">
        <ListFilterSelector :items="sortByItems" instructions="" v-model="selectedSortByItem" item-name="result" default-empty-text="Any" :show-clear="false" :show-filter="false" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.last-filter {
  flex-grow: 1;
  place-content: flex-end;
}
.filters {
  background-color: #f3f3f3;
  border: #8c8c8c 1px solid;
  border-radius: 3px;
  padding: 0.3125rem;
  display: flex;
  gap: 1.1rem;
}
.filter {
  display: flex;
  align-items: center;
}
.filter-label {
  font-weight: bold;
}

.filter-component {
}
.text-search-container {
  width: 25rem;
}
</style>
