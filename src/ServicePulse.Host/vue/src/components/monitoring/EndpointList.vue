<script setup>
import { ref, watch, onMounted } from "vue";
import EndpointListSortableColumn from "./EndpointListSortableColumn.vue";
import EndpointListRow from "./EndpointListRow.vue";
import { useMonitoringStore } from "../../stores/MonitoringStore";

const monitoringStore = useMonitoringStore();
const endpoints = ref();
const isGrouped = computed(() => monitoringStore.endpointListIsGrouped);

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
        <endpoint-list-sortable-column>Endpoint name</endpoint-list-sortable-column>
      </div>
      <div class="table-col">
        <endpoint-list-sortable-column v-tooltip title="Queue length: The number of messages waiting to be processed in the input queue(s) of the endpoint.">Queue Length<template #unit>(MSGS)</template></endpoint-list-sortable-column>
      </div>
      <div class="table-col">
        <endpoint-list-sortable-column v-tooltip title="Throughput: The number of messages per second successfully processed by a receiving endpoint.">Throughput<template #unit>(msgs/s)</template></endpoint-list-sortable-column>
      </div>
      <div class="table-col">
        <endpoint-list-sortable-column v-tooltip title="Scheduled retries: The number of messages per second scheduled for retries (immediate or delayed).">Scheduled retries <template #unit>(msgs/s)</template></endpoint-list-sortable-column>
      </div>
      <div class="table-col">
        <endpoint-list-sortable-column v-tooltip title="Processing time: The time taken for a receiving endpoint to successfully process a message."> Processing Time <template #unit>(t)</template></endpoint-list-sortable-column>
      </div>
      <div class="table-col">
        <endpoint-list-sortable-column v-tooltip title="Critical time: The elapsed time from when a message was sent, until it was successfully processed by a receiving endpoint."> Critical Time <template #unit>(t)</template></endpoint-list-sortable-column>
      </div>
    </div>
    <div>
      <!-- end ngRepeat: endpoint in endpoints | filter: filter | orderBy: order.expression -->
      <div class="endpoint-row" v-for="(endpoint, index) in endpoints" :key="index" v-show="endpoints.length" v-on:mouseenter="endpoint.hover1 = true" v-on:mouseleave="endpoint.hover1 = false">
        <div class="table-first-col endpoint-name name-overview">
          <div class="box-header">
            <div class="col-lg-max-8 no-side-padding lead righ-side-ellipsis endpoint-details-link">
              <a @click="navigateToEndpointDetails($event, endpoint.name)" class="cursorpointer" v-tooltip :title="endpoint.name">
                {{ endpoint.name }}
              </a>
              <span class="endpoint-count" v-if="endpoint.connectedCount || endpoint.disconnectedCount" v-tooltip :title="`Endpoint instance(s):` + endpoint.connectedCount || 0">({{ endpoint.connectedCount || 0 }})</span>
            </div>
            <div class="col-xs-5 no-side-padding endpoint-status">
              <span class="warning" v-if="endpoint.metrics != null && formatGraphDuration(endpoint.metrics.criticalTime).value < 0">
                <i class="fa pa-warning" v-tooltip title="Warning: endpoint currently has negative critical time, possibly because of a clock drift."></i>
              </span>
              <span class="warning" v-if="endpoint.isScMonitoringDisconnected">
                <i class="fa pa-monitoring-lost endpoints-overview" v-tooltip title="Unable to connect to monitoring server"></i>
              </span>
              <span class="warning" v-if="(endpoint.isStale && !supportsEndpointCount) || !endpoint.connectedCount" v-tooltip title="No data received from any instance">
                <a class="monitoring-lost-link" ng-href="{{getDetailsUrl(endpoint)}}&tab=instancesBreakdown"><i class="fa pa-endpoint-lost endpoints-overview"></i></a>
              </span>
              <span class="warning" v-if="endpoint.errorCount" v-tooltip :title="endpoint.errorCount + ` failed messages associated with this endpoint. Click to see list.`">
                <a v-if="endpoint.errorCount" class="warning cursorpointer" @click="navigateToMessageGroup($event, endpoint.serviceControlId)">
                  <i class="fa fa-envelope"></i>
                  <span class="badge badge-important ng-binding cursorpointer">{{ endpoint.errorCount }}</span>
                </a>
              </span>
            </div>
          </div>
        </div>
        <!--Queue Length-->
        <div class="table-col">
          <div class="box-header">
            <div class="no-side-padding">
              <D3Graph :type="'queue-length'" :isdurationgraph="false" :plotdata="endpoint.metrics.queueLength" :minimumyaxis="smallGraphsMinimumYAxis.queueLength" :avglabelcolor="'#EA7E00'" :metricsuffix="'MSGS'" :key="endpoints"></D3Graph>
            </div>
            <div class="no-side-padding sparkline-value">
              {{ endpoint.isStale == true || endpoint.isScMonitoringDisconnected == true ? "" : formatGraphDecimal(endpoint.metrics.queueLength, 0) }}
              <strong v-if="endpoint.isStale && !endpoint.isScMonitoringDisconnected" v-tooltip title="No metrics received or endpoint is not configured to send metrics">?</strong>
              <strong v-if="endpoint.isScMonitoringDisconnected" v-tooltip title="Unable to connect to monitoring server">?</strong>
            </div>
          </div>
        </div>
        <!--Throughput-->
        <div class="table-col">
          <div class="box-header">
            <div class="no-side-padding">
              <D3Graph :type="'throughput'" :isdurationgraph="false" :plotdata="endpoint.metrics.throughput" :minimumyaxis="smallGraphsMinimumYAxis.throughput" :avglabelcolor="'#176397'" :metricsuffix="'MSGS/S'"></D3Graph>
            </div>
            <div class="no-side-padding sparkline-value">
              {{ endpoint.isStale == true || endpoint.isScMonitoringDisconnected == true ? "" : formatGraphDecimal(endpoint.metrics.throughput, 2) }}
              <strong v-if="endpoint.isStale && !endpoint.isScMonitoringDisconnected" v-tooltip title="No metrics received or endpoint is not configured to send metrics">?</strong>
              <strong v-if="endpoint.isScMonitoringDisconnected" v-tooltip title="Unable to connect to monitoring server">?</strong>
            </div>
          </div>
        </div>
        <!--Scheduled Retries-->
        <div class="table-col">
          <div class="box-header">
            <div class="no-side-padding">
              <D3Graph :type="'retries'" :isdurationgraph="false" :plotdata="endpoint.metrics.retries" :minimumyaxis="smallGraphsMinimumYAxis.retries" :avglabelcolor="'#CC1252'" :metricsuffix="'MSGS/S'"></D3Graph>
            </div>
            <div class="no-side-padding sparkline-value">
              {{ endpoint.isStale == true || endpoint.isScMonitoringDisconnected == true ? "" : formatGraphDecimal(endpoint.metrics.retries, 2) }}
              <strong v-if="endpoint.isStale && !endpoint.isScMonitoringDisconnected" v-tooltip title="No metrics received or endpoint is not configured to send metrics">?</strong>
              <strong v-if="endpoint.isScMonitoringDisconnected" v-tooltip title="Unable to connect to monitoring server">?</strong>
            </div>
          </div>
        </div>
        <!--Processing Time-->
        <div class="table-col">
          <div class="box-header">
            <div class="no-side-padding">
              <D3Graph :type="'processing-time'" :isdurationgraph="true" :plotdata="endpoint.metrics.processingTime" :minimumyaxis="smallGraphsMinimumYAxis.processingTime" :avglabelcolor="'#258135'"></D3Graph>
            </div>
            <div class="no-side-padding sparkline-value">
              {{ endpoint.isStale == true || endpoint.isScMonitoringDisconnected == true ? "" : formatGraphDuration(endpoint.metrics.processingTime).value }}
              <strong v-if="endpoint.isStale && !endpoint.isScMonitoringDisconnected" v-tooltip title="No metrics received or endpoint is not configured to send metrics">?</strong>
              <strong v-if="endpoint.isScMonitoringDisconnected" v-tooltip title="Unable to connect to monitoring server">?</strong>
              <span v-if="endpoint.isStale == false && endpoint.isScMonitoringDisconnected == false"> {{ formatGraphDuration(endpoint.metrics.processingTime).unit }}</span>
            </div>
          </div>
        </div>
        <!--Critical Time-->
        <div class="table-col">
          <div class="box-header">
            <div class="no-side-padding">
              <D3Graph :type="'critical-time'" :isdurationgraph="true" :plotdata="endpoint.metrics.criticalTime" :minimumyaxis="smallGraphsMinimumYAxis.criticalTime" :avglabelcolor="'#2700CB'"></D3Graph>
            </div>
            <div class="no-side-padding sparkline-value" :class="{ negative: formatGraphDuration(endpoint.metrics.criticalTime).value < 0 }">
              {{ endpoint.isStale == true || endpoint.isScMonitoringDisconnected == true ? "" : formatGraphDuration(endpoint.metrics.criticalTime).value }}
              <strong v-if="endpoint.isStale && !endpoint.isScMonitoringDisconnected" title="No metrics received or endpoint is not configured to send metrics">?</strong>
              <strong v-if="endpoint.isScMonitoringDisconnected" title="Unable to connect to monitoring server">?</strong>
              <span v-if="endpoint.isStale == false && endpoint.isScMonitoringDisconnected == false" class="unit"> {{ formatGraphDuration(endpoint.metrics.criticalTime).unit }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
