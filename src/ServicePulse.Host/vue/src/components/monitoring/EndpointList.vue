<script setup>
import { ref } from "vue";
import EndpointListSortableColumn from "./EndpointListSortableColumn.vue";
/*import EndpointGraph from "./EndpointGraph.vue";*/
import D3Graph from "./D3Graph.vue";
import { useRouter } from "vue-router";
import { useFormatTime, useFormatLargeNumber } from "../../composables/formatter.js";
import MonitoringNoData from "./MonitoringNoData.vue";
import MonitoringNotAvailable from "./MonitoringNotAvailable.vue";

const settings = defineProps({
  endpoints: Object,
});


const endpoints = ref(settings.endpoints);
const historyPeriod = 1;
const router = useRouter();
const hasData = ref(false);
const supportsEndpointCount = ref();
const smallGraphsMinimumYAxis = {
    queueLength: 10,
    throughput: 10,
    retries: 10,
    processingTime: 10,
    criticalTime: 10
};


/* function updateUI() {
  if (endpoints.value.length > 0) {
    endpoints.value.forEach((endpoint) => {
      hasData.value = !endpoint.empty;
      supportsEndpointCount.value = Object.prototype.hasOwnProperty.call(endpoint, "connectedCount");
      if (endpoint.empty) {
        return;
      }

      if (endpoint.error) {
        // connectivityNotifier.reportFailedConnection();
        if (endpoints.value) {
          endpoints.value.forEach((item) => (item.isScMonitoringDisconnected = true));
        }
      } else {
        // connectivityNotifier.reportSuccessfulConnection();
        var index = endpoints.value.findIndex(function (item) {
          return item.name === endpoint.name;
        });
        endpoint.isScMonitoringDisconnected = false;
        if (index >= 0) {
          mergeIn(endpoints.value[index], endpoint);
        } else {
          endpoints.value.push(endpoint);
        }
      }
    });

    //sort the monitored endpoints by name - case sensitive
    endpoints.value.sort((a, b) => (a.name < b.name ? 1 : a.name > b.name ? -1 : 0));
  }
} */

/* function mergeIn(destination, source) {
  for (var propName in source) {
    if (Object.prototype.hasOwnProperty.call(source, propName)) {
      destination[propName] = source[propName];
    }
  }
} */

function navigateToMessageGroup($event, groupId) {
  if ($event.target.localName !== "button") {
    router.push({ name: "message-groups", params: { groupId: groupId } });
  }
}
function navigateToEndpointDetails($event, endpointName) {
  if ($event.target.localName !== "button") {
    //to do historyPeriod
    router.push({ name: "endpoint-details", params: { endpointName: endpointName }, query: { historyPeriod: historyPeriod } });
  }
}

function formatGraphDuration(input) {
  if (input) {
    var lastValue = input.points.length > 0 ? input.points[input.points.length - 1] : 0;
    var formatLastValue = useFormatTime(lastValue);
    return formatLastValue;
  }
  return input;
}
function formatGraphDecimal(input, deci) {
  if (input) {
    var lastValue = input.points.length > 0 ? input.points[input.points.length - 1] : 0;
    var decimals = 0;
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
  <section ng-if="grouping.selectedGrouping == 0">
    <div class="row">
      <div class="col-sm-12">
        <MonitoringNoData v-if="!endpoints && endpoints.length === 0 && !hasData"></MonitoringNoData>
      </div>
    </div>

    <div class="row">
      <div class="col-sm-12">
        <MonitoringNotAvailable v-if="!endpoints && endpoints.length === 0 && hasData"></MonitoringNotAvailable>
      </div>
    </div>

    <!--Table headings-->
    <div v-if="endpoints && endpoints.length > 0" class="row box box-no-click table-head-row">
      <div class="col-xl-7">
        <endpoint-list-sortable-column>Endpoint name</endpoint-list-sortable-column>
      </div>
      <div class="col-xl-1 no-side-padding">
        <endpoint-list-sortable-column v-tooltip title="Queue length: The number of messages waiting to be processed in the input queue(s) of the endpoint.">Queue Length<template #unit>(MSGS)</template></endpoint-list-sortable-column>
      </div>
      <div class="col-xl-1 no-side-padding">
        <endpoint-list-sortable-column v-tooltip title="Throughput: The number of messages per second successfully processed by a receiving endpoint.">Throughput<template #unit>(msgs/s)</template></endpoint-list-sortable-column>
      </div>
      <div class="col-xl-1 no-side-padding">
        <endpoint-list-sortable-column v-tooltip title="Scheduled retries: The number of messages per second scheduled for retries (immediate or delayed).">Scheduled retries <template #unit>(msgs/s)</template></endpoint-list-sortable-column>
      </div>
      <div class="col-xl-1 no-side-padding">
        <endpoint-list-sortable-column v-tooltip title="Processing time: The time taken for a receiving endpoint to successfully process a message."> Processing Time <template #unit>(t)</template></endpoint-list-sortable-column>
      </div>
      <div class="col-xl-1 no-side-padding">
        <endpoint-list-sortable-column v-tooltip title="Critical time: The elapsed time from when a message was sent, until it was successfully processed by a receiving endpoint."> Critical Time <template #unit>(t)</template></endpoint-list-sortable-column>
      </div>
    </div>

    <!--endpointlist-->
    <div>
        <!-- end ngRepeat: endpoint in endpoints | filter: filter | orderBy: order.expression -->
        <div class="box endpoint-row" v-for="(endpoint, index) in endpoints" :key="index" v-show="endpoints.length" v-on:mouseenter="endpoint.hover1 = true" v-on:mouseleave="endpoint.hover1 = false">
            <div class="row">
              <div class="col-xl-7 endpoint-name name-overview">
                <div class="box-header">
                  <div class="col-lg-max-8 no-side-padding lead righ-side-ellipsis endpoint-details-link">
                    <a @click="navigateToEndpointDetails($event, endpoint.name)" class="cursorpointer" v-tooltip :title="endpoint.name">
                      {{ endpoint.name }}
                    </a>
                  </div>
                  <span class="endpoint-count ng-binding ng-scope" v-if="endpoint.connectedCount || endpoint.disconnectedCount" v-tooltip :title="`Endpoint instance(s):` + endpoint.connectedCount || 0">({{ endpoint.connectedCount || 0 }})</span>
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
              <div class="col-xl-1 no-side-padding">
                <div class="box-header">
                    <div class="no-side-padding">
                        <!--<EndpointGraph :type="'queue-length'"></EndpointGraph>-->
                        <D3Graph :type="'queue-length'" :isdurationgraph="false" :plotdata="endpoint.metrics.queueLength" :minimumyaxis="smallGraphsMinimumYAxis.queueLength" :avglabelcolor="'#EA7E00'" :metricsuffix="'MSGS'" ></D3Graph>
                    </div>
                  <div class="no-side-padding sparkline-value">
                    {{ endpoint.isStale == true || endpoint.isScMonitoringDisconnected == true ? "" : formatGraphDecimal(endpoint.metrics.queueLength, 0) }}
                    <strong v-if="endpoint.isStale && !endpoint.isScMonitoringDisconnected" v-tooltip title="No metrics received or endpoint is not configured to send metrics">?</strong>
                    <strong v-if="endpoint.isScMonitoringDisconnected" v-tooltip title="Unable to connect to monitoring server">?</strong>
                  </div>
                </div>
              </div>
              <!--Throughput-->
              <div class="col-xl-1 no-side-padding">
                <div class="box-header">
                    <div class="no-side-padding">
                        <!--<EndpointGraph :type="'throughput'"></EndpointGraph>-->
                        <D3Graph  :type="'throughput'" :isdurationgraph="false" :plotdata="endpoint.metrics.throughput" :minimumyaxis="smallGraphsMinimumYAxis.throughput" :avglabelcolor="'#176397'" :metricsuffix="'MSGS/S'" ></D3Graph>
                    </div>
                  <div class="no-side-padding sparkline-value">
                    {{ endpoint.isStale == true || endpoint.isScMonitoringDisconnected == true ? "" : formatGraphDecimal(endpoint.metrics.throughput, 2) }}
                    <strong v-if="endpoint.isStale && !endpoint.isScMonitoringDisconnected" v-tooltip title="No metrics received or endpoint is not configured to send metrics">?</strong>
                    <strong v-if="endpoint.isScMonitoringDisconnected" v-tooltip title="Unable to connect to monitoring server">?</strong>
                  </div>
                </div>
              </div>
              <!--Scheduled Retries-->
              <div class="col-xl-1 no-side-padding">
                <div class="box-header">
                    <div class="no-side-padding">
                        <!--<EndpointGraph :type="'retries'"></EndpointGraph>-->
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
              <div class="col-xl-1 no-side-padding">
                <div class="box-header">
                    <div class="no-side-padding">
                        <!--<EndpointGraph :type="'processing-time'"></EndpointGraph>-->
                        <D3Graph  :type="'processing-time'" :isdurationgraph="true" :plotdata="endpoint.metrics.processingTime" :minimumyaxis="smallGraphsMinimumYAxis.processingTime" :avglabelcolor="'#258135'" ></D3Graph>
                    </div>
                  <div class="no-side-padding sparkline-value" ng-class="endpoint.metrics.processingTime.displayValue.unit">
                    {{ endpoint.isStale == true || endpoint.isScMonitoringDisconnected == true ? "" : formatGraphDuration(endpoint.metrics.processingTime).value }}
                    <strong v-if="endpoint.isStale && !endpoint.isScMonitoringDisconnected" v-tooltip title="No metrics received or endpoint is not configured to send metrics">?</strong>
                    <strong v-if="endpoint.isScMonitoringDisconnected" v-tooltip title="Unable to connect to monitoring server">?</strong>
                    <span v-if="endpoint.isStale == false && endpoint.isScMonitoringDisconnected == false"> {{ formatGraphDuration(endpoint.metrics.processingTime).unit }}</span>
                  </div>
                </div>
              </div>
              <!--Critical Time-->
              <div class="col-xl-1 no-side-padding">
                <div class="box-header">
                    <div class="no-side-padding">
                        <!--<EndpointGraph :type="'critical-time'"></EndpointGraph>-->
                        <D3Graph  :type="'critical-time'" :isdurationgraph="true" :plotdata="endpoint.metrics.criticalTime" :minimumyaxis="smallGraphsMinimumYAxis.criticalTime" :avglabelcolor="'#2700CB'" ></D3Graph>
                    </div>
                  <div class="no-side-padding sparkline-value" ng-class="[endpoint.metrics.criticalTime.displayValue.unit, {'negative':endpoint.metrics.criticalTime.displayValue.value < 0}]">
                    {{ endpoint.isStale == true || endpoint.isScMonitoringDisconnected == true ? "" : formatGraphDuration(endpoint.metrics.criticalTime).value }}
                    <strong v-if="endpoint.isStale && !endpoint.isScMonitoringDisconnected" title="No metrics received or endpoint is not configured to send metrics">?</strong>
                    <strong v-if="endpoint.isScMonitoringDisconnected" title="Unable to connect to monitoring server">?</strong>
                    <span v-if="endpoint.isStale == false && endpoint.isScMonitoringDisconnected == false" class="unit"> {{ formatGraphDuration(endpoint.metrics.criticalTime).unit }}</span>
                  </div>
                </div>
              </div>
            </div>

        </div>

    </div>
  </section>
</template>
