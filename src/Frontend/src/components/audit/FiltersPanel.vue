<script setup lang="ts">
import FilterInput from "@/components/FilterInput.vue";
import { storeToRefs } from "pinia";
import { useAuditStore } from "@/stores/AuditStore";
import ListFilterSelector from "@/components/audit/ListFilterSelector.vue";
import { computed } from "vue";
import SuperDatePicker from "@/components/audit/SuperDatePicker.vue";

const store = useAuditStore();
const { messageFilterString, selectedEndpointName, endpoints } = storeToRefs(store);
const endpointNames = computed(() => {
  return [...new Set(endpoints.value.map((endpoint) => endpoint.name))].sort();
});
</script>

<template>
  <div class="filters">
    <div class="filter">
      <div class="filter-label"></div>
      <div class="filter-component text-search-container">
        <FilterInput v-model="messageFilterString" placeholder="Search messages..." aria-label="Search messages" />
        <div class="note">Check the <a href="https://docs.particular.net/servicepulse/all-messages#filtering-options">documentation</a> to see the available filtering options</div>
      </div>
    </div>
    <div class="filter">
      <div class="filter-label">Endpoint:</div>
      <div class="filter-component">
        <ListFilterSelector :items="endpointNames" instructions="Select an endpoint" v-model="selectedEndpointName" item-name="endpoint" label="Endpoint" default-empty-text="Any" :show-clear="true" :show-filter="true" />
      </div>
    </div>
    <div class="filter">
      <div class="filter-label">Sent:</div>
      <div class="filter-component">
        <SuperDatePicker />
      </div>
    </div>
  </div>
</template>

<style scoped>
.filters {
  background-color: #f3f3f3;
  border: #8c8c8c 1px solid;
  border-radius: 3px;
  padding: 0.3125rem;
  display: flex;
  gap: 1.1rem;
  flex-wrap: wrap;
}

.filter {
  display: flex;
  align-items: start;
  min-width: 0;
  max-width: 100%;
}

.filter-component {
  min-width: 0;
}

.filter-label {
  font-weight: bold;
  padding-block: 0.375rem;
}

.text-search-container {
  width: min(25rem, 100%);
}
.note {
  font-size: 0.875em;
  color: var(--bs-secondary-color);
}
</style>
