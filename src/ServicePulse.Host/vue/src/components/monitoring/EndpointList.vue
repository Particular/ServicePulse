<script setup>
import { ref, watch, computed, onMounted } from "vue";
import EndpointListSortableColumn from "./EndpointListSortableColumn.vue";
import EndpointListRow from "./EndpointListRow.vue";
import { useMonitoringStore } from "../../stores/MonitoringStore";

const monitoringStore = useMonitoringStore();
const endpoints = ref();
const isGrouped = computed(() => monitoringStore.endpointListIsGrouped);
const activeColumn = ref("");

function toggleSort(name) {
  activeColumn.value = name;
}

watch([() => monitoringStore.endpointList, () => monitoringStore.filterString], async () => {
  if (monitoringStore.endpointListIsFiltered) {
    endpoints.value = await monitoringStore.getFilteredEndpointList;
    return;
  }
  endpoints.value = monitoringStore.endpointList;
});

onMounted(async () => {
  if (monitoringStore.endpointListIsFiltered) {
    endpoints.value = await monitoringStore.getFilteredEndpointList;
  } else {
    endpoints.value = monitoringStore.endpointList;
  }
});
</script>

<template>
  <section>
    <!--Table headings-->
    <div class="table-head-row">
      <div class="table-first-col">
        <endpoint-list-sortable-column :is-active="activeColumn === 'endpoints'" @click="toggleSort('endpoints')">Endpoint name</endpoint-list-sortable-column>
      </div>
      <div class="table-col">
        <endpoint-list-sortable-column :is-active="activeColumn === 'queue'" @click="toggleSort('queue')" v-tooltip title="Queue length: The number of messages waiting to be processed in the input queue(s) of the endpoint.">Queue Length<template #unit>(MSGS)</template></endpoint-list-sortable-column>
      </div>
      <div class="table-col">
        <endpoint-list-sortable-column :is-active="activeColumn === 'throughput'" @click="toggleSort('throughput')" v-tooltip title="Throughput: The number of messages per second successfully processed by a receiving endpoint.">Throughput<template #unit>(msgs/s)</template></endpoint-list-sortable-column>
      </div>
      <div class="table-col">
        <endpoint-list-sortable-column :is-active="activeColumn === 'scheduled'" @click="toggleSort('scheduled')" v-tooltip title="Scheduled retries: The number of messages per second scheduled for retries (immediate or delayed).">Scheduled retries <template #unit>(msgs/s)</template></endpoint-list-sortable-column>
      </div>
      <div class="table-col">
        <endpoint-list-sortable-column :is-active="activeColumn === 'processing'" @click="toggleSort('processing')" v-tooltip title="Processing time: The time taken for a receiving endpoint to successfully process a message."> Processing Time <template #unit>(t)</template></endpoint-list-sortable-column>
      </div>
      <div class="table-col">
        <endpoint-list-sortable-column :is-active="activeColumn === 'critical'" @click="toggleSort('critical')" v-tooltip title="Critical time: The elapsed time from when a message was sent, until it was successfully processed by a receiving endpoint."> Critical Time <template #unit>(t)</template></endpoint-list-sortable-column>
      </div>
    </div>
    <div>
      <div v-if="isGrouped">
        <div class="row" v-for="(endpointGroup, index) in monitoringStore.grouping.groupedEndpoints" :key="index">
          <div class="endpoint-group-title">
            {{ endpointGroup.group }}
          </div>
          <div class="row box endpoint-row" v-for="(groupedEndpoint, index) in endpointGroup.endpoints" :key="index">
            <EndpointListRow :endpoint="groupedEndpoint.endpoint" />
          </div>
        </div>
      </div>
      <div v-else>
        <div class="endpoint-row" v-for="(endpoint, index) in endpoints" :key="index">
          <EndpointListRow :endpoint="endpoint" />
        </div>
      </div>
    </div>
  </section>
</template>
