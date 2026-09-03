<script setup lang="ts">
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { FieldNames, useAuditStore } from "@/stores/AuditStore";
import ListFilterSelector from "@/components/audit/ListFilterSelector.vue";

const store = useAuditStore();
const { sortBy, itemsPerPage } = storeToRefs(store);

const sortByItemsMap = new Map([
  ["Latest sent", `${FieldNames.TimeSent},desc`],
  ["Oldest sent", `${FieldNames.TimeSent},asc`],
  ["Slowest processing time", `${FieldNames.ProcessingTime},desc`],
  ["Highest critical time", `${FieldNames.CriticalTime},desc`],
  ["Longest delivery time", `${FieldNames.DeliveryTime},desc`],
]);
const numberOfItemsPerPage = ["50", "100", "250", "500"];
const sortByItems = computed(() => [...sortByItemsMap.keys()]);

const selectedSortByItem = computed({
  get() {
    return findKeyByValue(`${sortBy.value.property},${sortBy.value.isAscending ? "asc" : "desc"}`);
  },
  set(newValue) {
    const item = sortByItemsMap.get(newValue);
    if (item) {
      const strings = item.split(",");
      sortBy.value = { isAscending: strings[1] === "asc", property: strings[0] };
    } else {
      sortBy.value = { isAscending: true, property: FieldNames.TimeSent };
    }
  },
});

const selectedItemsPerPage = computed({
  get() {
    return itemsPerPage.value.toString();
  },
  set(newValue) {
    itemsPerPage.value = parseInt(newValue);
  },
});

function findKeyByValue(searchValue: string) {
  for (const [key, value] of sortByItemsMap.entries()) {
    if (value === searchValue) {
      return key;
    }
  }
  return "";
}
</script>

<template>
  <div class="results-options">
    <div class="option">
      <span class="option-label">Show:</span>
      <ListFilterSelector :items="numberOfItemsPerPage" instructions="Max results to display" v-model="selectedItemsPerPage" item-name="result" :can-clear="false" :show-clear="false" :show-filter="false" />
    </div>
    <div class="option">
      <span class="option-label">Sort:</span>
      <ListFilterSelector :items="sortByItems" v-model="selectedSortByItem" item-name="result" :can-clear="false" :show-clear="false" :show-filter="false" />
    </div>
  </div>
</template>

<style scoped>
.results-options {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  flex-wrap: wrap;
}

.option {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.option-label {
  font-weight: bold;
}
</style>
