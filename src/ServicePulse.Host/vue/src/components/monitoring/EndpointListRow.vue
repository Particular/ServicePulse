<script setup>
import { ref, computed } from "vue";
import { useRouter, RouterLink } from "vue-router";
import { useFormatTime, useFormatLargeNumber } from "../../composables/formatter";
import { smallGraphsMinimumYAxis } from "./formatGraph";
import SmallGraph from "./SmallGraph.vue";
import { useMonitoringHistoryPeriodStore } from "@/stores/MonitoringHistoryPeriodStore";
import { useMonitoringStore } from "../../stores/MonitoringStore";
import { storeToRefs } from "pinia";

const settings = defineProps({
  endpoint: Object,
});

const monitoringHistoryPeriodStore = useMonitoringHistoryPeriodStore();
const monitoringStore = useMonitoringStore();
const isGrouped = computed(() => monitoringStore.endpointListIsGrouped);
const endpoint = computed(() => {
  return isGrouped.value ? settings.endpoint.endpoint : settings.endpoint;
});
const shortName = computed(() => {
  return isGrouped.value ? settings.endpoint.shortName : "";
});
const router = useRouter();
const supportsEndpointCount = ref();
const { historyPeriod: selectedPeriod } = storeToRefs(monitoringHistoryPeriodStore);

function navigateToEndpointDetails($event, endpointName) {
  if ($event.target.localName !== "button") {
    router.push({ name: "endpoint-details", params: { endpointName: endpointName }, query: { historyPeriod: selectedPeriod.value.pVal } });
  }
}

function formatGraphDuration(input) {
  if (input) {
    const lastValue = input.points.length > 0 ? input.points[input.points.length - 1] : 0;
    return useFormatTime(lastValue);
  }
  return input;
}
function formatGraphDecimal(input, deci) {
  if (input) {
    const lastValue = input.points.length > 0 ? input.points[input.points.length - 1] : 0;
    let decimals = 0;
    if (lastValue < 10 || input > 1000000) {
      decimals = 2;
    }
    return useFormatLargeNumber(lastValue, deci || decimals);
  } else {
    input = {
      points: [],
      average: 0,
      displayValue: 0,
    };
    return input;
  }
}
</script>

<template>
  <div class="table-first-col endpoint-name name-overview">
    <div class="box-header">
      <div class="no-side-padding lead righ-side-ellipsis endpoint-details-link">
        <a @click="navigateToEndpointDetails($event, endpoint.name)" class="cursorpointer" v-tooltip :title="endpoint.name">
          {{ isGrouped ? shortName : endpoint.name }}
        </a>
        <span class="endpoint-count" v-if="endpoint.connectedCount || endpoint.disconnectedCount" v-tooltip :title="`Endpoint instance(s):` + endpoint.connectedCount || 0">({{ endpoint.connectedCount || 0 }})</span>
      </div>
      <div class="no-side-padding endpoint-status">
        <span class="warning" v-if="endpoint.metrics != null && parseInt(formatGraphDuration(endpoint.metrics.criticalTime).value) < 0">
          <i class="fa pa-warning" v-tooltip title="Warning: endpoint currently has negative critical time, possibly because of a clock drift."></i>
        </span>
        <span class="warning" v-if="endpoint.isScMonitoringDisconnected">
          <i class="fa pa-monitoring-lost endpoints-overview" v-tooltip title="Unable to connect to monitoring server"></i>
        </span>
        <span class="warning" v-if="(endpoint.isStale && !supportsEndpointCount) || !endpoint.connectedCount" v-tooltip title="No data received from any instance">
          <a class="monitoring-lost-link" ng-href="{{getDetailsUrl(endpoint)}}&tab=instancesBreakdown"><i class="fa pa-endpoint-lost endpoints-overview"></i></a>
        </span>
        <span class="warning" v-if="endpoint.errorCount" v-tooltip :title="endpoint.errorCount + ` failed messages associated with this endpoint. Click to see list.`">
          <RouterLink :to="{ name: 'message-groups', params: { groupId: endpoint.serviceControlId } }" v-if="endpoint.errorCount" class="warning cursorpointer">
            <i class="fa fa-envelope"></i>
            <span class="badge badge-important ng-binding cursorpointer">{{ endpoint.errorCount }}</span>
          </RouterLink>
        </span>
      </div>
    </div>
  </div>
  <!--Queue Length-->
  <div class="table-col">
    <div class="box-header">
      <div class="no-side-padding">
        <SmallGraph :type="'queue-length'" :isdurationgraph="false" :plotdata="endpoint.metrics.queueLength" :minimumyaxis="smallGraphsMinimumYAxis.queueLength" :avglabelcolor="'#EA7E00'" :metricsuffix="'MSGS'" />
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
        <SmallGraph :type="'throughput'" :isdurationgraph="false" :plotdata="endpoint.metrics.throughput" :minimumyaxis="smallGraphsMinimumYAxis.throughput" :avglabelcolor="'#176397'" :metricsuffix="'MSGS/S'" />
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
        <SmallGraph :type="'retries'" :isdurationgraph="false" :plotdata="endpoint.metrics.retries" :minimumyaxis="smallGraphsMinimumYAxis.retries" :avglabelcolor="'#CC1252'" :metricsuffix="'MSGS/S'" />
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
        <SmallGraph :type="'processing-time'" :isdurationgraph="true" :plotdata="endpoint.metrics.processingTime" :minimumyaxis="smallGraphsMinimumYAxis.processingTime" :avglabelcolor="'#258135'" />
      </div>
      <div class="no-side-padding sparkline-value">
        {{ endpoint.isStale == true || endpoint.isScMonitoringDisconnected == true ? "" : formatGraphDuration(endpoint.metrics.processingTime).value }}
        <strong v-if="endpoint.isStale && !endpoint.isScMonitoringDisconnected" v-tooltip title="No metrics received or endpoint is not configured to send metrics">?</strong>
        <strong v-if="endpoint.isScMonitoringDisconnected" v-tooltip title="Unable to connect to monitoring server">?</strong>
        <span v-if="!endpoint.isStale && !endpoint.isScMonitoringDisconnected"> {{ formatGraphDuration(endpoint.metrics.processingTime).unit }}</span>
      </div>
    </div>
  </div>
  <!--Critical Time-->
  <div class="table-col">
    <div class="box-header">
      <div class="no-side-padding">
        <SmallGraph :type="'critical-time'" :isdurationgraph="true" :plotdata="endpoint.metrics.criticalTime" :minimumyaxis="smallGraphsMinimumYAxis.criticalTime" :avglabelcolor="'#2700CB'" />
      </div>
      <div class="no-side-padding sparkline-value" :class="{ negative: formatGraphDuration(endpoint.metrics.criticalTime).value < 0 }">
        {{ endpoint.isStale == true || endpoint.isScMonitoringDisconnected == true ? "" : formatGraphDuration(endpoint.metrics.criticalTime).value }}
        <strong v-if="endpoint.isStale && !endpoint.isScMonitoringDisconnected" title="No metrics received or endpoint is not configured to send metrics">?</strong>
        <strong v-if="endpoint.isScMonitoringDisconnected" title="Unable to connect to monitoring server">?</strong>
        <span v-if="!endpoint.isStale && !endpoint.isScMonitoringDisconnected" class="unit"> {{ formatGraphDuration(endpoint.metrics.criticalTime).unit }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import "../list.css";
@import "./monitoring.css";
@import "./endpoint.css";

.lead.endpoint-details-link.righ-side-ellipsis {
  color: #00729c;
}

.monitoring-lost-link i {
  top: 7px;
}
</style>
