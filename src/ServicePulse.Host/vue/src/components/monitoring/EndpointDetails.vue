<script setup>
// Composables
import { computed, ref, watch, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { monitoringConnectionState, connectionState } from "../../composables/serviceServiceControl";
import { formatGraphDuration, formatGraphDecimal } from "./formatGraph";
import { licenseStatus } from "../../composables/serviceLicense";
import { useIsMonitoringDisabled, useDeleteFromMonitoring, useOptionsFromMonitoring } from "../../composables/serviceServiceControlUrls";
import { storeToRefs } from "pinia";
//stores
import { useMonitoringStore } from "../../stores/MonitoringStore";
import { useFailedMessageStore } from "../../stores/FailedMessageStore";
// Components
import LicenseExpired from "../../components/LicenseExpired.vue";
import ServiceControlNotAvailable from "../../components/ServiceControlNotAvailable.vue";
import MonitoringNotAvailable from "./MonitoringNotAvailable.vue";
import PeriodSelector from "./MonitoringHistoryPeriod.vue";
import NoData from "../NoData.vue";
import SmallGraph from "./SmallGraph.vue";
import PaginationStrip from "@/components/PaginationStrip.vue";
import LargeGraph from "./LargeGraph.vue";
import EndpointBacklog from "./EndpointBacklog.vue";

const route = useRoute();
const router = useRouter();
const endpointName = route.params.endpointName;
let showInstancesBreakdown = false;
let refreshInterval = undefined;
//let disconnectedCount = 0;

const monitoringStore = useMonitoringStore();
const failedMessageStore = useFailedMessageStore();

if (route.query.tab !== "" && route.query.tab != null) {
  showInstancesBreakdown = route.query.tab === "instancesBreakdown";
}

const isRemovingEndpointEnabled = ref(false);
const isLoading = ref(true);
const loadedSuccessfully = ref(false);
const smallGraphsMinimumYAxis = {
  queueLength: 10,
  throughputRetries: 10,
  processingCritical: 10,
};
const largeGraphsMinimumYAxis = {
  queueLength: 10,
  throughput: 10,
  retries: 10,
  processingTime: 10,
  criticalTime: 10,
};
const endpoint = ref({});
const negativeCriticalTimeIsPresent = ref(false);
endpoint.value.messageTypesPage = !showInstancesBreakdown ? Number(route.query.pageNo ?? "1") : 1;
endpoint.value.messageTypesTotalItems = 0;
endpoint.value.messageTypesItemsPerPage = 10;
endpoint.value.messageTypesAvailable = ref(false);
endpoint.value.messageTypesUpdatedSet = [];
endpoint.value.instances = [];

const { historyPeriod } = storeToRefs(monitoringStore);

watch(historyPeriod, (newValue) => {
  changeRefreshInterval(newValue.refreshIntervalVal);
});

const paginatedMessageTypes = computed(() => {
  return endpoint.value.messageTypes.slice((endpoint.value.messageTypesPage - 1) * endpoint.value.messageTypesItemsPerPage, endpoint.value.messageTypesPage * endpoint.value.messageTypesItemsPerPage);
});

watch(
  () => endpoint.value.messageTypesPage,
  () => {
    const breakdownTabName = showInstancesBreakdown ? "instancesBreakdown" : "messageTypeBreakdown";
    router.replace({ name: "endpoint-details", params: { endpointName: endpointName }, query: { historyPeriod: historyPeriod.value.pVal, tab: breakdownTabName, pageNo: endpoint.value.messageTypesPage } });
  }
);

async function getEndpointDetails() {
  //get historyPeriod
  const selectedHistoryPeriod = historyPeriod.value.pVal;
  if (!useIsMonitoringDisabled() && !monitoringConnectionState.unableToConnect) {
    await monitoringStore.getEndpointDetails(endpointName, selectedHistoryPeriod);
    const responseData = monitoringStore.endpointDetails;
    if (responseData != null) {
      filterOutSystemMessage(responseData);
      const endpointDetails = responseData;
      endpointDetails.isScMonitoringDisconnected = false;
      Object.assign(endpoint.value, endpointDetails);
      await updateUI();
    }
  }
}

async function updateUI() {
  isLoading.value = false;

  if (endpoint.value.error) {
    if (endpoint.value && endpoint.value.instances) {
      endpoint.value.instances.forEach((item) => (item.isScMonitoringDisconnected = true));
    }
    endpoint.value.isScMonitoringDisconnected = true;
  } else {
    if (endpoint.value.messageTypesTotalItems > 0 && endpoint.value.messageTypesTotalItems !== endpoint.value.messageTypes.length) {
      mergeIn(endpoint.value, endpoint.value, ["messageTypes"]);

      endpoint.value.messageTypesAvailable.value = true;
      endpoint.value.messageTypesUpdatedSet = endpoint.value.messageTypes;
    } else {
      mergeIn(endpoint.value, endpoint.value);
    }

    //sorting
    endpoint.value.instances.sort(function (first, second) {
      if (first.id < second.id) {
        return -1;
      }

      if (first.id > second.id) {
        return 1;
      }

      return 0;
    });

    processMessageTypes();

    endpoint.value.isScMonitoringDisconnected = false;

    await Promise.all(
      endpoint.value.instances.map(async (instance) => {
        //get error count by instance id
        await failedMessageStore.getFailedMessagesList("Endpoint Instance", instance.id);
        if (!failedMessageStore.isFailedMessagesEmpty) {
          instance.serviceControlId = failedMessageStore.serviceControlId;
          instance.errorCount = failedMessageStore.errorCount;
          instance.isScMonitoringDisconnected = false;
        }
      })
    );
    negativeCriticalTimeIsPresent.value = endpoint.value.instances.some((instance) => formatGraphDuration(instance.metrics.criticalTime).value < 0);
    endpoint.value.isStale = endpoint.value.instances.every((instance) => instance.isStale);

    loadedSuccessfully.value = true;
  }
  //get error count by endpoint name
  await failedMessageStore.getFailedMessagesList("Endpoint Name", endpointName);
  if (!failedMessageStore.isFailedMessagesEmpty) {
    endpoint.value.serviceControlId = failedMessageStore.serviceControlId;
    endpoint.value.errorCount = failedMessageStore.errorCount;
  }
}

function filterOutSystemMessage(data) {
  data.messageTypes = data.messageTypes.filter((mt) => {
    return mt.id;
  });
}

function mergeIn(destination, source, propertiesToSkip) {
  for (const propName in source) {
    if (Object.prototype.hasOwnProperty.call(source, propName)) {
      if (!propertiesToSkip || !propertiesToSkip.includes(propName)) {
        destination[propName] = source[propName];
      }
    }
  }
}

async function removeEndpoint(endpointName, instance) {
  try {
    await useDeleteFromMonitoring("monitored-instance/" + endpointName + "/" + instance.id);
    endpoint.value.instances.splice(endpoint.value.instances.indexOf(instance), 1);
    if (endpoint.value.instances.length === 0) {
      router.push({ name: "monitoring", query: { historyPeriod: historyPeriod.value.pVal } });
    }
  } catch (err) {
    console.log(err);
    return false;
  }
}

async function getIsRemovingEndpointEnabled() {
  try {
    const response = await useOptionsFromMonitoring();
    if (response) {
      const headers = response.headers;
      const allow = headers.get("Allow");
      const deleteAllowed = allow.indexOf("DELETE") >= 0;
      return deleteAllowed;
    }
  } catch (err) {
    console.log(err);
  }
  return false;
}

// async function getDisconnectedCount() {
//   let checkInterval;
//   try {
//     const response = await useFetchFromMonitoring(`${`monitored-endpoints`}/disconnected`);
//     disconnectedCount = response.data;
//   } catch (err) {
//     console.log("Error while getting disconnected endpoints count from monitoring:" + err);
//     clearInterval(checkInterval); //Stop checking, probably an old version of Monitoring
//   }
//   //return useFetchFromMonitoring(`${`monitored-endpoints`}/disconnected`);
//   //let checkDisconnectedCount = function () {
//   //    monitoringService.getDisconnectedCount().then(result => {
//   //        notifier.notify(disconnectedEndpointsUpdatedEvent, result.data);
//   //    }, e => {
//   //        $log.debug('Error while getting disconnected endpoints count from monitoring:' + e);
//   //        clearInterval(checkInterval); //Stop checking, probably an old version of Monitoring
//   //    });
//   //};
// }
function refreshMessageTypes() {
  if (endpoint.value.messageTypesAvailable) {
    endpoint.value.messageTypesAvailable.value = false;
    endpoint.value.messageTypes = endpoint.value.messageTypesUpdatedSet;
    endpoint.value.messageTypesUpdatedSet = null;

    processMessageTypes();
  }
}

function processMessageTypes() {
  endpoint.value.messageTypesTotalItems = endpoint.value.messageTypes.length;
  endpoint.value.messageTypes.forEach((messageType) => {
    messageType = parseTheMessageTypeData(messageType);
    return messageType;
  });
}

function parseTheMessageTypeData(messageType) {
  if (!messageType.typeName) return;

  if (messageType.typeName.indexOf(";") > 0) {
    let messageTypeHierarchy = messageType.typeName.split(";");
    messageTypeHierarchy = messageTypeHierarchy.map((item) => {
      const obj = {};
      const segments = item.split(",");
      obj.typeName = segments[0];
      obj.assemblyName = segments[1];
      obj.assemblyVersion = segments[2].substring(segments[2].indexOf("=") + 1);

      if (!segments[4].endsWith("=null")) {
        //SC monitoring fills culture only if PublicKeyToken is filled
        obj.culture = segments[3];
        obj.publicKeyToken = segments[4];
      }
      return obj;
    });
    messageType.messageTypeHierarchy = messageTypeHierarchy;
    messageType.typeName = messageTypeHierarchy.map((item) => item.typeName).join(", ");
    messageType.shortName = messageTypeHierarchy.map((item) => shortenTypeName(item.typeName)).join(", ");
    messageType.containsTypeHierarchy = true;
    messageType.tooltipText = messageTypeHierarchy.reduce(
      (sum, item) => (sum ? `${sum}<br> ` : "") + `${item.typeName} |${item.assemblyName}-${item.assemblyVersion}` + (item.culture ? ` |${item.culture}` : "") + (item.publicKeyToken ? ` |${item.publicKeyToken}` : ""),
      ""
    );
  } else {
    //Get the name without the namespace
    messageType.shortName = shortenTypeName(messageType.typeName);

    let tooltip = `${messageType.typeName} | ${messageType.assemblyName}-${messageType.assemblyVersion}`;
    if (messageType.culture && messageType.culture !== "null") {
      tooltip += ` | Culture=${messageType.culture}`;
    }

    if (messageType.publicKeyToken && messageType.publicKeyToken !== "null") {
      tooltip += ` | PublicKeyToken=${messageType.publicKeyToken}`;
    }

    messageType.tooltipText = tooltip;
  }
  return messageType;
}

function shortenTypeName(typeName) {
  return typeName.split(".").pop();
}

function navigateToMessageGroup($event, groupId) {
  if ($event.target.localName !== "button") {
    router.push({ name: "message-groups", params: { groupId: groupId } });
  }
}
function navigateToEndpointUrl($event, isVisible, breakdownPageNo) {
  if ($event.target.localName !== "button") {
    showInstancesBreakdown = isVisible;
    refreshMessageTypes();
    const breakdownTabName = showInstancesBreakdown ? "instancesBreakdown" : "messageTypeBreakdown";
    router.push({ name: "endpoint-details", params: { endpointName: endpointName }, query: { historyPeriod: historyPeriod.value.pVal, tab: breakdownTabName, pageNo: breakdownPageNo } });
  }
}

//let startService = function () {
//    notifier.subscribe($rootScope, (event, data) => {
//        if (data.isMonitoringConnected && isConnected == false) {
//            checkDisconnectedCount();
//            checkInterval = setInterval(checkDisconnectedCount, 20000);
//            isConnected = true;
//        } else if (!data.isMonitoringConnected && isConnected) {
//            isConnected = false;
//            clearInterval(checkInterval);
//        }
//    }, "MonitoringConnectionStatusChanged");
//};
function changeRefreshInterval(milliseconds) {
  if (typeof refreshInterval !== "undefined") {
    clearInterval(refreshInterval);
  }
  getEndpointDetails();
  refreshInterval = setInterval(() => {
    getEndpointDetails();
  }, milliseconds);
}
onUnmounted(() => {
  if (typeof refreshInterval !== "undefined") {
    clearInterval(refreshInterval);
  }
});

onMounted(async () => {
  getEndpointDetails();
  changeRefreshInterval(historyPeriod.value.refreshIntervalVal);
  //getDisconnectedCount(); // for refresh interval
  isRemovingEndpointEnabled.value = await getIsRemovingEndpointEnabled();
});
</script>

<template>
  <LicenseExpired />
  <template v-if="!licenseStatus.isExpired">
    <div class="container monitoring-view">
      <ServiceControlNotAvailable />
      <template v-if="connectionState.connected">
        <!--MonitoringNotAvailable-->
        <div class="row">
          <div class="col-sm-12">
            <MonitoringNotAvailable v-if="monitoringConnectionState.unableToConnect || useIsMonitoringDisabled()"></MonitoringNotAvailable>
          </div>
        </div>
        <!--Header-->
        <div class="monitoring-head" v-if="loadedSuccessfully">
          <div class="endpoint-title no-side-padding list-section">
            <h1 class="righ-side-ellipsis" v-tooltip :title="endpointName">
              {{ endpointName }}
            </h1>
            <div class="endpoint-status">
              <span class="warning" v-if="negativeCriticalTimeIsPresent">
                <i class="fa pa-warning" v-tooltip :title="`Warning: endpoint currently has negative critical time, possibly because of a clock drift.`"></i>
              </span>
              <span v-if="endpoint.isStale" class="warning">
                <i class="fa pa-endpoint-lost endpoint-details" v-tooltip :title="`Unable to connect to endpoint`"></i>
              </span>
              <span class="warning" v-if="endpoint.isScMonitoringDisconnected">
                <i class="fa pa-monitoring-lost endpoint-details" v-tooltip :title="`Unable to connect to monitoring server`"></i>
              </span>
              <span class="warning" v-if="endpoint.errorCount" v-tooltip :title="endpoint.errorCount + ` failed messages associated with this endpoint. Click to see list.`">
                <a v-if="endpoint.errorCount" class="warning cursorpointer" @click="navigateToMessageGroup($event, endpoint.serviceControlId)">
                  <i class="fa fa-envelope"></i>
                  <span class="badge badge-important ng-binding cursorpointer"> {{ endpoint.errorCount }}</span>
                </a>
              </span>
            </div>
          </div>
          <!--filters-->
          <div class="no-side-padding toolbar-menus">
            <div class="filter-monitoring">
              <PeriodSelector />
            </div>
          </div>
        </div>
        <!--large graphs-->
        <div class="large-graphs" v-if="loadedSuccessfully">
          <div class="container">
            <div class="row">
              <EndpointBacklog v-model="endpoint" :minimum-y-axis="largeGraphsMinimumYAxis.queueLength" />
              <!--Throughput and retries-->
              <div class="col-xs-4 no-side-padding list-section graph-area graph-message-retries-throughputs">
                <!-- large graph -->
                <LargeGraph
                  v-if="endpoint.metricDetails.metrics.throughput"
                  :isdurationgraph="false"
                  :firstdataseries="endpoint.metricDetails.metrics.throughput"
                  :seconddataseries="endpoint.metricDetails.metrics.retries"
                  :minimumyaxis="largeGraphsMinimumYAxis.throughputRetries"
                  :firstseriestype="'throughput'"
                  :secondseriestype="'retries'"
                  :avgdecimals="0"
                  :metricsuffix="'MSGS/S'"
                />
                <div class="no-side-padding graph-values">
                  <div class="no-side-padding throughput-values">
                    <div>
                      <span class="metric-digest-header" v-tooltip :title="`Throughput: The number of messages per second successfully processed by a receiving endpoint.`"> Throughput </span>
                    </div>
                    <div class="metric-digest-value current">
                      <div v-if="!endpoint.isStale && !endpoint.isScMonitoringDisconnected">{{ formatGraphDecimal(endpoint.digest.metrics.throughput.latest, 2) }} <span class="metric-digest-value-suffix">MSGS/S</span></div>
                      <strong v-if="endpoint.isStale || endpoint.isScMonitoringDisconnected">?</strong>
                    </div>
                    <div class="metric-digest-value average">
                      <div v-if="!endpoint.isStale && !endpoint.isScMonitoringDisconnected">{{ formatGraphDecimal(endpoint.digest.metrics.throughput.average, 2) }} <span class="metric-digest-value-suffix">MSGS/S AVG</span></div>
                      <strong v-if="endpoint.isStale || endpoint.isScMonitoringDisconnected">?</strong>
                    </div>
                  </div>
                  <div class="no-side-padding scheduled-retries-rate-values">
                    <div>
                      <span class="metric-digest-header" v-tooltip :title="`Scheduled retries: The number of messages per second scheduled for retries (immediate or delayed).`"> Scheduled retries </span>
                    </div>

                    <div class="metric-digest-value current">
                      <div v-if="!endpoint.isStale && !endpoint.isScMonitoringDisconnected">{{ formatGraphDecimal(endpoint.digest.metrics.retries.latest, 2) }} <span class="metric-digest-value-suffix">MSGS/S</span></div>
                      <strong v-if="endpoint.isStale || endpoint.isScMonitoringDisconnected">?</strong>
                    </div>
                    <div class="metric-digest-value average">
                      <div v-if="!endpoint.isStale && !endpoint.isScMonitoringDisconnected">{{ formatGraphDecimal(endpoint.digest.metrics.retries.average, 2) }} <span class="metric-digest-value-suffix">MSGS/S AVG</span></div>
                      <strong v-if="endpoint.isStale || endpoint.isScMonitoringDisconnected">?</strong>
                    </div>
                  </div>
                </div>
              </div>
              <!--ProcessingTime and Critical Time-->
              <div class="col-xs-4 no-side-padding list-section graph-area graph-critical-processing-times">
                <!-- large graph -->
                <LargeGraph
                  v-if="endpoint.metricDetails.metrics.criticalTime"
                  :isdurationgraph="true"
                  :firstdataseries="endpoint.metricDetails.metrics.criticalTime"
                  :seconddataseries="endpoint.metricDetails.metrics.processingTime"
                  :minimumyaxis="largeGraphsMinimumYAxis.processingCritical"
                  :firstseriestype="'critical-time'"
                  :secondseriestype="'processing-time'"
                  :avgdecimals="0"
                />
                <div class="no-side-padding graph-values">
                  <div class="no-side-padding processing-time-values">
                    <div class="">
                      <span class="metric-digest-header" v-tooltip :title="`Processing time: The time taken for a receiving endpoint to successfully process a message.`"> Processing Time </span>
                    </div>
                    <div class="metric-digest-value current">
                      <div v-if="!endpoint.isStale && !endpoint.isScMonitoringDisconnected">
                        {{ formatGraphDuration(endpoint.digest.metrics.processingTime.latest).value }}
                        <span class="metric-digest-value-suffix"> {{ formatGraphDuration(endpoint.digest.metrics.processingTime.latest).unit }}</span>
                      </div>
                      <strong v-if="endpoint.isStale || endpoint.isScMonitoringDisconnected">?</strong>
                    </div>
                    <div class="metric-digest-value average">
                      <div v-if="!endpoint.isStale && !endpoint.isScMonitoringDisconnected">
                        {{ formatGraphDuration(endpoint.digest.metrics.processingTime.average).value }}
                        <span class="metric-digest-value-suffix"> {{ formatGraphDuration(endpoint.digest.metrics.processingTime.average).unit }} AVG</span>
                      </div>
                      <strong v-if="endpoint.isStale || endpoint.isScMonitoringDisconnected">?</strong>
                    </div>
                  </div>

                  <div class="no-side-padding critical-time-values">
                    <div class="">
                      <span class="metric-digest-header" v-tooltip :title="`Critical time: The elapsed time from when a message was sent, until it was successfully processed by a receiving endpoint.`"> Critical Time </span>
                    </div>
                    <div class="metric-digest-value current">
                      <div v-if="!endpoint.isStale && !endpoint.isScMonitoringDisconnected">
                        <span :class="{ negative: formatGraphDuration(endpoint.digest.metrics.criticalTime.latest).value < 0 }"> {{ formatGraphDuration(endpoint.digest.metrics.criticalTime.latest).value }}</span>
                        <span class="metric-digest-value-suffix"> &nbsp;{{ formatGraphDuration(endpoint.digest.metrics.criticalTime.latest).unit }}</span>
                      </div>
                      <strong v-if="endpoint.isStale || endpoint.isScMonitoringDisconnected">?</strong>
                    </div>
                    <div class="metric-digest-value average">
                      <div v-if="!endpoint.isStale && !endpoint.isScMonitoringDisconnected">
                        <span :class="{ negative: formatGraphDuration(endpoint.digest.metrics.criticalTime.average).value < 0 }"> {{ formatGraphDuration(endpoint.digest.metrics.criticalTime.average).value }}</span>
                        <span class="metric-digest-value-suffix"> &nbsp;{{ formatGraphDuration(endpoint.digest.metrics.criticalTime.average).unit }} AVG </span>
                      </div>
                      <strong v-if="endpoint.isStale || endpoint.isScMonitoringDisconnected">?</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!--Messagetypes and instances-->
        <div v-if="loadedSuccessfully">
          <!--tabs-->
          <div class="tabs">
            <h5 :class="{ active: !showInstancesBreakdown }">
              <a @click="navigateToEndpointUrl($event, false, endpoint.messageTypesPage)" class="cursorpointer ng-binding">Message Types ({{ endpoint.messageTypes.length }})</a>
            </h5>
            <h5 :class="{ active: showInstancesBreakdown }">
              <a @click="navigateToEndpointUrl($event, true, 1)" class="cursorpointer ng-binding">Instances ({{ endpoint.instances.length }})</a>
            </h5>
          </div>

          <!--showInstancesBreakdown-->
          <section v-if="showInstancesBreakdown" class="endpoint-instances">
            <div class="row">
              <div class="col-xs-12 no-side-padding">
                <!-- Breakdown by instance-->
                <!--headers-->
                <div v-if="loadedSuccessfully" class="row box box-no-click table-head-row">
                  <div class="col-xs-4 col-xl-8">
                    <div class="row box-header">
                      <div class="col-xs-12">Instance Name</div>
                    </div>
                  </div>
                  <div class="col-xs-2 col-xl-1 no-side-padding">
                    <div class="row box-header">
                      <div class="col-xs-12 no-side-padding" v-tooltip :title="`Throughput: The number of messages per second successfully processed by a receiving endpoint.`">Throughput <span class="table-header-unit">(msgs/s)</span></div>
                    </div>
                  </div>
                  <div class="col-xs-2 col-xl-1 no-side-padding">
                    <div class="row box-header">
                      <div class="col-xs-12 no-side-padding" v-tooltip :title="`Scheduled retries: The number of messages per second scheduled for retries (immediate or delayed).`">
                        Scheduled retries <span class="table-header-unit">(msgs/s)</span>
                      </div>
                    </div>
                  </div>
                  <div class="col-xs-2 col-xl-1 no-side-padding">
                    <div class="row box-header">
                      <div class="col-xs-12 no-side-padding" v-tooltip :title="`Processing time: The time taken for a receiving endpoint to successfully process a message.`">Processing Time <span class="table-header-unit">(t)</span></div>
                    </div>
                  </div>
                  <div class="col-xs-2 col-xl-1 no-side-padding">
                    <div class="row box-header">
                      <div class="col-xs-12 no-side-padding" v-tooltip :title="`Critical time: The elapsed time from when a message was sent, until it was successfully processed by a receiving endpoint.`">
                        Critical Time <span class="table-header-unit">(t)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <NoData v-if="endpoint.instances.length == 0" title="No messages" message="No messages processed in this period of time"></NoData>

                <div class="row endpoint-instances">
                  <div class="col-xs-12 no-side-padding">
                    <div class="row box endpoint-row" v-for="(instance, id) in endpoint.instances" :key="id">
                      <div class="col-xs-12 no-side-padding">
                        <div class="row">
                          <div class="col-xs-4 col-xl-8 endpoint-name">
                            <div class="row box-header">
                              <div class="no-side-padding lead righ-side-ellipsis" v-tooltip :title="instance.name">
                                {{ instance.name }}
                              </div>
                              <div class="col-lg-4 no-side-padding endpoint-status">
                                <span class="warning" v-if="formatGraphDuration(instance.metrics.criticalTime).value < 0">
                                  <i class="fa pa-warning" v-tooltip :title="`Warning: instance currently has negative critical time, possibly because of a clock drift.`"></i>
                                </span>
                                <span class="warning" v-if="instance.isScMonitoringDisconnected">
                                  <i class="fa pa-monitoring-lost endpoint-details" v-tooltip :title="`Unable to connect to monitoring server`"></i>
                                </span>
                                <span class="warning" v-if="instance.isStale">
                                  <i class="fa pa-endpoint-lost endpoint-details" v-tooltip :title="`Unable to connect to instance`"></i>
                                </span>
                                <span class="warning" v-if="instance.errorCount" v-tooltip :title="instance.errorCount + ` failed messages associated with this endpoint. Click to see list.`">
                                  <a v-if="instance.errorCount" class="warning cursorpointer" @click="navigateToMessageGroup($event, instance.serviceControlId)">
                                    <i class="fa fa-envelope"></i>
                                    <span class="badge badge-important cursorpointer"> {{ instance.errorCount }}</span>
                                  </a>
                                </span>
                              </div>
                            </div>
                          </div>
                          <div class="col-xs-2 col-xl-1 no-side-padding">
                            <div class="row box-header">
                              <div class="no-side-padding">
                                <SmallGraph :type="'throughput'" :isdurationgraph="false" :plotdata="instance.metrics.throughput" :minimumyaxis="smallGraphsMinimumYAxis.throughput" :metricsuffix="'MSGS/S'" />
                                <span class="no-side-padding sparkline-value">
                                  {{ instance.isStale == true || instance.isScMonitoringDisconnected == true ? "" : formatGraphDecimal(instance.metrics.throughput) }}
                                  <strong v-if="instance.isStale && !instance.isScMonitoringDisconnected" v-tooltip :title="`No metrics received or instance is not configured to send metrics`">?</strong>
                                  <strong v-if="instance.isScMonitoringDisconnected" v-tooltip :title="`Unable to connect to monitoring server`">?</strong>
                                </span>
                              </div>
                            </div>
                          </div>
                          <div class="col-xs-2 col-xl-1 no-side-padding">
                            <div class="row box-header">
                              <div class="no-side-padding">
                                <SmallGraph :type="'retries'" :isdurationgraph="false" :plotdata="instance.metrics.retries" :minimumyaxis="smallGraphsMinimumYAxis.retries" :metricsuffix="'MSGS/S'" />
                                <span class="no-side-padding sparkline-value">
                                  {{ instance.isStale == true || instance.isScMonitoringDisconnected == true ? "" : formatGraphDecimal(instance.metrics.retries) }}
                                  <strong v-if="instance.isStale && !instance.isScMonitoringDisconnected" v-tooltip :title="`No metrics received or instance is not configured to send metrics`">?</strong>
                                  <strong v-if="instance.isScMonitoringDisconnected" v-tooltip :title="`Unable to connect to monitoring server`">?</strong>
                                </span>
                              </div>
                            </div>
                          </div>
                          <div class="col-xs-2 col-xl-1 no-side-padding">
                            <div class="row box-header">
                              <div class="no-side-padding">
                                <SmallGraph :type="'processing-time'" :isdurationgraph="true" :plotdata="instance.metrics.processingTime" :minimumyaxis="smallGraphsMinimumYAxis.processingTime" />
                                <span class="no-side-padding sparkline-value">
                                  {{ instance.isStale == true || instance.isScMonitoringDisconnected == true ? "" : formatGraphDuration(instance.metrics.processingTime).value }}
                                  <strong v-if="instance.isStale && !instance.isScMonitoringDisconnected" v-tooltip :title="`No metrics received or instance is not configured to send metrics`">?</strong>
                                  <strong v-if="instance.isScMonitoringDisconnected" v-tooltip :title="`Unable to connect to monitoring server`">?</strong>
                                  <span v-if="!instance.isStale && !instance.isScMonitoringDisconnected" class="unit">
                                    {{ formatGraphDuration(instance.metrics.processingTime).unit }}
                                  </span>
                                </span>
                              </div>
                            </div>
                          </div>
                          <div class="col-xs-2 col-xl-1 no-side-padding">
                            <div class="row box-header">
                              <div class="no-side-padding">
                                <SmallGraph :type="'critical-time'" :isdurationgraph="true" :plotdata="instance.metrics.criticalTime" :minimumyaxis="smallGraphsMinimumYAxis.criticalTime" />
                                <span class="no-side-padding sparkline-value" :class="{ negative: formatGraphDuration(instance.metrics.criticalTime).value < 0 }">
                                  {{ instance.isStale == true || instance.isScMonitoringDisconnected == true ? "" : formatGraphDuration(instance.metrics.criticalTime).value }}
                                  <strong v-if="instance.isStale && !instance.isScMonitoringDisconnected" v-tooltip :title="`No metrics received or instance is not configured to send metrics`">?</strong>
                                  <strong v-if="instance.isScMonitoringDisconnected" v-tooltip :title="`Unable to connect to monitoring server`">?</strong>
                                  <span v-if="!instance.isStale && !instance.isScMonitoringDisconnected" class="unit">
                                    {{ formatGraphDuration(instance.metrics.criticalTime).unit }}
                                  </span>
                                </span>
                              </div>
                            </div>
                          </div>

                          <!--remove endpoint-->
                          <div class="col-xs-2 col-xl-1 no-side-padding">
                            <a v-if="isRemovingEndpointEnabled && instance.isStale" class="remove-endpoint" @click="removeEndpoint(endpointName, instance)">
                              <i class="fa fa-trash" v-tooltip :title="`Remove endpoint`"></i>
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!--ShowMessagetypes breakdown-->
          <section v-if="!showInstancesBreakdown" class="endpoint-message-types">
            <div class="row">
              <div class="col-xs-12 no-side-padding">
                <div v-if="endpoint.messageTypesAvailable" class="alert alert-warning endpoint-data-changed">
                  <i class="fa fa-warning"></i> <strong>Warning:</strong> The number of available message types has changed.
                  <a @click="refreshMessageTypes()" class="alink">Click here to reload the view</a>
                </div>

                <!-- Breakdown by message type-->
                <!--headers-->
                <div v-if="loadedSuccessfully" class="row box box-no-click table-head-row">
                  <div class="col-xs-4 col-xl-8">
                    <div class="row box-header">
                      <div class="col-xs-12">Message type name</div>
                    </div>
                  </div>
                  <div class="col-xs-2 col-xl-1 no-side-padding">
                    <div class="row box-header">
                      <div class="col-xs-12 no-side-padding" v-tooltip :title="`Throughput: The number of messages per second successfully processed by a receiving endpoint.`">Throughput <span class="table-header-unit">(msgs/s)</span></div>
                    </div>
                  </div>
                  <div class="col-xs-2 col-xl-1 no-side-padding">
                    <div class="row box-header">
                      <div class="col-xs-12 no-side-padding" v-tooltip :title="`Scheduled retries: The number of messages per second scheduled for retries (immediate or delayed).`">
                        Scheduled retries <span class="table-header-unit">(msgs/s)</span>
                      </div>
                    </div>
                  </div>
                  <div class="col-xs-2 col-xl-1 no-side-padding">
                    <div class="row box-header">
                      <div class="col-xs-12 no-side-padding" v-tooltip :title="`Processing time: The time taken for a receiving endpoint to successfully process a message.`">Processing Time <span class="table-header-unit">(t)</span></div>
                    </div>
                  </div>
                  <div class="col-xs-2 col-xl-1 no-side-padding">
                    <div class="row box-header">
                      <div class="col-xs-12 no-side-padding" v-tooltip :title="`Critical time: The elapsed time from when a message was sent, until it was successfully processed by a receiving endpoint.`">
                        Critical Time <span class="table-header-unit">(t)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <no-data v-if="endpoint.messageTypes.length == 0" message="No messages processed in this period of time."></no-data>

                <div class="row">
                  <div class="col-xs-12 no-side-padding">
                    <div
                      class="row box endpoint-row"
                      v-for="(messageType, id) in paginatedMessageTypes"
                      :key="id"
                      ng-repeat="messageType in endpoint.messageTypes | orderBy: 'typeName' | limitTo: endpoint.messageTypesItemsPerPage : (endpoint.messageTypesPage-1) * endpoint.messageTypesItemsPerPage"
                    >
                      <div class="col-xs-12 no-side-padding">
                        <div class="row">
                          <div class="col-xs-4 col-xl-8 endpoint-name" uib-tooltip-html="messageType.tooltipText">
                            <div class="row box-header">
                              <div class="col-lg-max-9 no-side-padding lead message-type-label righ-side-ellipsis">
                                <div class="lead">
                                  {{ messageType.shortName ? messageType.shortName : "Unknown" }}
                                </div>
                              </div>
                              <div class="col-lg-4 no-side-padding endpoint-status message-type-status">
                                <span class="warning" v-if="messageType.metrics != null && formatGraphDuration(messageType.metrics.criticalTime).value < 0">
                                  <i class="fa pa-warning" v-tooltip :title="`Warning: message type currently has negative critical time, possibly because of a clock drift.`"></i>
                                </span>
                                <span class="warning" v-if="endpoint.isScMonitoringDisconnected">
                                  <i class="fa pa-monitoring-lost endpoint-details" v-tooltip :title="`Unable to connect to monitoring server`"></i>
                                </span>
                              </div>
                            </div>
                            <div class="row message-type-properties">
                              <div v-if="messageType.typeName && messageType.typeName != 'null' && !messageType.containsTypeHierarchy" class="message-type-part">
                                {{ messageType.assemblyName + "-" + messageType.assemblyVersion }}
                              </div>
                              <div class="message-type-part" v-for="(type, id) in messageType.messageTypeHierarchy" :key="id">
                                <span v-if="messageType.typeName && messageType.typeName != 'null' && messageType.containsTypeHierarchy"> {{ type.assemblyName + "-" + type.assemblyVersion }}</span>
                              </div>
                              <div v-if="messageType.culture && messageType.culture != 'null'" class="message-type-part">{{ "Culture=" + messageType.culture }}</div>
                              <div v-if="messageType.publicKeyToken && messageType.publicKeyToken != 'null'" class="message-type-part">{{ "PublicKeyToken=" + messageType.publicKeyToken }}</div>
                            </div>
                          </div>
                          <div class="col-xs-2 col-xl-1 no-side-padding">
                            <div class="row box-header">
                              <div class="no-side-padding">
                                <SmallGraph :type="'throughput'" :isdurationgraph="false" :plotdata="messageType.metrics.throughput" :minimumyaxis="smallGraphsMinimumYAxis.throughput" :metricsuffix="'MSGS/S'" />
                                <span class="no-side-padding sparkline-value">
                                  {{ endpoint.isStale == true || endpoint.isScMonitoringDisconnected == true ? "" : formatGraphDecimal(messageType.metrics.throughput, 2) }}
                                  <strong v-if="endpoint.isStale && !endpoint.isScMonitoringDisconnected" v-tooltip :title="`No metrics received or endpoint is not configured to send metrics`">?</strong>
                                  <strong v-if="endpoint.isScMonitoringDisconnected" v-tooltip :title="`Unable to connect to monitoring server`">?</strong>
                                </span>
                              </div>
                            </div>
                          </div>
                          <div class="col-xs-2 col-xl-1 no-side-padding">
                            <div class="row box-header">
                              <div class="no-side-padding">
                                <SmallGraph :type="'retries'" :isdurationgraph="false" :plotdata="messageType.metrics.retries" :minimumyaxis="smallGraphsMinimumYAxis.retries" :metricsuffix="'MSGS/S'" />
                                <span class="no-side-padding sparkline-value">
                                  {{ endpoint.isStale == true || endpoint.isScMonitoringDisconnected == true ? "" : formatGraphDecimal(messageType.metrics.retries, 2) }}
                                  <strong v-if="endpoint.isStale && !endpoint.isScMonitoringDisconnected" v-tooltip :title="`No metrics received or endpoint is not configured to send metrics`">?</strong>
                                  <strong v-if="endpoint.isScMonitoringDisconnected" v-tooltip :title="`Unable to connect to monitoring server`">?</strong>
                                </span>
                              </div>
                            </div>
                          </div>
                          <div class="col-xs-2 col-xl-1 no-side-padding">
                            <div class="row box-header">
                              <div class="no-side-padding">
                                <SmallGraph :type="'processing-time'" :isdurationgraph="true" :plotdata="messageType.metrics.processingTime" :minimumyaxis="smallGraphsMinimumYAxis.processingTime" />
                                <span class="no-side-padding sparkline-value">
                                  {{ endpoint.isStale == true || endpoint.isScMonitoringDisconnected == true ? "" : formatGraphDuration(messageType.metrics.processingTime).value }}
                                  <strong v-if="endpoint.isStale && !endpoint.isScMonitoringDisconnected" v-tooltip :title="`No metrics received or endpoint is not configured to send metrics`">?</strong>
                                  <strong v-if="endpoint.isScMonitoringDisconnected" v-tooltip :title="`Unable to connect to monitoring server`">?</strong>
                                  <span v-if="!endpoint.isStale && !endpoint.isScMonitoringDisconnected" class="unit">
                                    {{ formatGraphDuration(messageType.metrics.processingTime).unit }}
                                  </span>
                                </span>
                              </div>
                            </div>
                          </div>
                          <div class="col-xs-2 col-xl-1 no-side-padding">
                            <div class="row box-header">
                              <div class="no-side-padding">
                                <SmallGraph :type="'critical-time'" :isdurationgraph="true" :plotdata="messageType.metrics.criticalTime" :minimumyaxis="smallGraphsMinimumYAxis.criticalTime" />
                                <span class="no-side-padding sparkline-value" :class="{ negative: formatGraphDuration(messageType.metrics.criticalTime).value < 0 }">
                                  {{ endpoint.isStale == true || endpoint.isScMonitoringDisconnected == true ? "" : formatGraphDuration(messageType.metrics.criticalTime).value }}
                                  <strong v-if="endpoint.isStale && !endpoint.isScMonitoringDisconnected" v-tooltip :title="`No metrics received or endpoint is not configured to send metrics`">?</strong>
                                  <strong v-if="endpoint.isScMonitoringDisconnected" v-tooltip :title="`Unable to connect to monitoring server`">?</strong>
                                  <span v-if="!endpoint.isStale && !endpoint.isScMonitoringDisconnected" class="unit">
                                    {{ formatGraphDuration(messageType.metrics.criticalTime).unit }}
                                  </span>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <PaginationStrip v-model="endpoint.messageTypesPage" :itemsPerPage="endpoint.messageTypesItemsPerPage" :totalCount="endpoint.messageTypesTotalItems" />
              </div>
            </div>
          </section>
        </div>
      </template>
    </div>
  </template>
</template>

<style scoped>
@import "../list.css";
@import "./monitoring.css";
@import "./endpoint.css";

.monitoring-head {
  display: flex;
  justify-content: space-between;
}

.monitoring-head h1 {
  margin-bottom: 10px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.monitoring-head .msg-group-menu {
  margin: 6px 0px 0 6px;
  padding-right: 0;
}

.monitoring-head .endpoint-status {
  top: 4px;
}

.monitoring-head .endpoint-status a {
  top: 0;
}

.monitoring-head .endpoint-status a[ng-if="endpoint.errorCount"] {
  top: -5px;
}

.monitoring-head i.fa.fa-envelope {
  font-size: 26px;
  position: relative;
  top: -4px;
  left: 1px;
}

.monitoring-head .endpoint-status .badge {
  position: relative;
  top: 4px;
  left: -12px;
  font-size: 10px;
}

.monitoring-head .endpoint-status .pa-endpoint-lost.endpoint-details,
.monitoring-head .endpoint-status .pa-monitoring-lost.endpoint-details {
  width: 32px;
  height: 30px;
}

.endpoint-title {
  flex: 0;
  display: flex;
  align-items: center;
}

.graph-values {
  margin-left: 60px;
  padding-top: 10px;
  border-top: 3px solid #fff;
  margin-top: -8.5px;
  width: calc(100% - 60px);
  display: flex;
  justify-content: space-between;
}

.throughput-values span.metric-digest-header {
  color: var(--monitoring-throughput);
}

.throughput-values .current,
.throughput-values .average {
  border-color: var(--monitoring-throughput);
}

.scheduled-retries-rate-values span.metric-digest-header {
  color: var(--monitoring-retries);
}

.scheduled-retries-rate-values .current,
.scheduled-retries-rate-values .average {
  border-color: var(--monitoring-retries);
}

.critical-time-values span.metric-digest-header {
  color: var(--monitoring-critical-time);
}

.critical-time-values .current,
.critical-time-values .average {
  border-color: var(--monitoring-critical-time);
}

.processing-time-values span.metric-digest-header {
  color: var(--monitoring-processing-time);
}

.processing-time-values .current,
.processing-time-values .average {
  border-color: var(--monitoring-processing-time);
}

.metric-digest-value {
  font-weight: bold;
  font-size: 22px;
}

.metric-digest-value div {
  display: inline-block;
}

.metric-digest-value-suffix {
  font-weight: normal;
  font-size: 14px;
  display: inline-block;
  text-transform: uppercase;
  text-wrap: nowrap;
}

.large-graphs {
  width: 100%;
  background-color: white;
  margin-bottom: 34px;
  padding: 30px 0;
}

.endpoint-row {
  padding: 0.5em 1.5em;
  margin: 0;
}

.box {
  box-shadow: none;
  margin: 0;
}

.metric-digest {
  padding: 1em;
}

.metric-digest-header {
  text-transform: uppercase;
  display: inline-block;
  font-size: 14px;
  font-weight: bold;
}

.current,
.average {
  margin-top: 4px;
  margin-bottom: 8px;
  padding-left: 4px;
  line-height: 20px;
  height: 19px;
}

.current {
  border-left: 2.5px solid;
}

.average {
  border-left: 1px dashed;
  padding-left: 6px;
}

.graph-area {
  width: 33%;
  box-sizing: border-box;
}
</style>
