<script setup>
import { ref, watch, computed, onMounted } from "vue";
import EndpointListSortableColumn from "./EndpointListSortableColumn.vue";
import EndpointListRow from "./EndpointListRow.vue";
import { useMonitoringStore } from "../../stores/MonitoringStore";

const monitoringStore = useMonitoringStore();
const endpoints = ref();
const isGrouped = computed(() => monitoringStore.endpointListIsGrouped);
const activeColumn = ref("name");

function updateActiveColumn(name) {
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
        <EndpointListSortableColumn :is-active="activeColumn === 'name'" :sort-by="'name'" @click="updateActiveColumn('name')">Endpoint name</EndpointListSortableColumn>
      </div>
      <div class="table-col">
        <EndpointListSortableColumn
          :is-active="activeColumn === 'queueLength'"
          :sort-by="'queueLength'"
          @click="updateActiveColumn('queueLength')"
          v-tooltip
          title="Queue length: The number of messages waiting to be processed in the input queue(s) of the endpoint."
          >Queue Length<template #unit>(MSGS)</template></EndpointListSortableColumn
        >
      </div>
      <div class="table-col">
        <EndpointListSortableColumn
          :is-active="activeColumn === 'throughput'"
          :sort-by="'throughput'"
          @click="updateActiveColumn('throughput')"
          v-tooltip
          title="Throughput: The number of messages per second successfully processed by a receiving endpoint."
          >Throughput<template #unit>(msgs/s)</template></EndpointListSortableColumn
        >
      </div>
      <div class="table-col">
        <EndpointListSortableColumn
          :is-active="activeColumn === 'retries'"
          :sort-by="'retries'"
          @click="updateActiveColumn('retries')"
          v-tooltip
          title="Scheduled retries: The number of messages per second scheduled for retries (immediate or delayed)."
          >Scheduled retries <template #unit>(msgs/s)</template></EndpointListSortableColumn
        >
      </div>
      <div class="table-col">
        <EndpointListSortableColumn
          :is-active="activeColumn === 'processingTime'"
          :sort-by="'processingTime'"
          @click="updateActiveColumn('processingTime')"
          v-tooltip
          title="Processing time: The time taken for a receiving endpoint to successfully process a message."
        >
          Processing Time <template #unit>(t)</template></EndpointListSortableColumn
        >
      </div>
      <div class="table-col">
        <EndpointListSortableColumn
          :is-active="activeColumn === 'criticalTime'"
          :sort-by="'criticalTime'"
          @click="updateActiveColumn('criticalTime')"
          v-tooltip
          title="Critical time: The elapsed time from when a message was sent, until it was successfully processed by a receiving endpoint."
        >
          Critical Time <template #unit>(t)</template></EndpointListSortableColumn
        >
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
