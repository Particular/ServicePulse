<script setup>
import { ref, computed } from "vue";
import SortableColumn from "../../components/SortableColumn.vue";
import EndpointListRow from "./EndpointListRow.vue";
import { useMonitoringStore } from "../../stores/MonitoringStore";

const monitoringStore = useMonitoringStore();
const endpoints = computed(() => monitoringStore.getEndpointList);
const isGrouped = computed(() => monitoringStore.endpointListIsGrouped);
const groupedEndpoints = computed(() => monitoringStore.grouping.groupedEndpoints);
const activeColumn = ref("name");

const sortByColumn = Object.freeze({
  ENDPOINTNAME: "name",
  QUEUELENGTH: "queueLength",
  THROUGHPUT: "throughput",
  SCHEDULEDRETRIES: "retries",
  PROCESSINGTIME: "processingTime",
  CRITICALTIME: "criticalTime",
});

function updateSorting(isAscending) {
  monitoringStore.updateSort(activeColumn.value, isAscending);
}
</script>

<template>
  <section>
    <!--Table headings-->
    <div class="table-head-row">
      <div class="table-first-col">
        <SortableColumn :sort-by="sortByColumn.ENDPOINTNAME" v-model="activeColumn" @isAscending="updateSorting">Endpoint name</SortableColumn>
      </div>
      <div class="table-col">
        <SortableColumn :sort-by="sortByColumn.QUEUELENGTH" v-model="activeColumn" @isAscending="updateSorting" v-tooltip title="Queue length: The number of messages waiting to be processed in the input queue(s) of the endpoint."
          >Queue Length<template #unit>(MSGS)</template>
        </SortableColumn>
      </div>
      <div class="table-col">
        <SortableColumn :sort-by="sortByColumn.THROUGHPUT" v-model="activeColumn" @isAscending="updateSorting" v-tooltip title="Throughput: The number of messages per second successfully processed by a receiving endpoint."
          >Throughput<template #unit>(msgs/s)</template>
        </SortableColumn>
      </div>
      <div class="table-col">
        <SortableColumn :sort-by="sortByColumn.SCHEDULEDRETRIES" v-model="activeColumn" @isAscending="updateSorting" v-tooltip title="Scheduled retries: The number of messages per second scheduled for retries (immediate or delayed)."
          >Scheduled retries <template #unit>(msgs/s)</template>
        </SortableColumn>
      </div>
      <div class="table-col">
        <SortableColumn :sort-by="sortByColumn.PROCESSINGTIME" v-model="activeColumn" @isAscending="updateSorting" v-tooltip title="Processing time: The time taken for a receiving endpoint to successfully process a message."
          >Processing Time <template #unit>(t)</template>
        </SortableColumn>
      </div>
      <div class="table-col">
        <SortableColumn
          :sort-by="sortByColumn.CRITICALTIME"
          v-model="activeColumn"
          @isAscending="updateSorting"
          v-tooltip
          title="Critical time: The elapsed time from when a message was sent, until it was successfully processed by a receiving endpoint."
          >Critical Time <template #unit>(t)</template>
        </SortableColumn>
      </div>
    </div>
    <div>
      <div v-if="isGrouped">
        <div class="row" v-for="(endpointGroup, index) in groupedEndpoints" :key="index">
          <div class="endpoint-group-title">
            {{ endpointGroup.group }}
          </div>
          <div class="row box endpoint-row" v-for="(groupedEndpoint, index) in endpointGroup.endpoints" :key="index">
            <EndpointListRow :endpoint="groupedEndpoint" />
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

<style scoped>
@import "./endpoint.css";
</style>
