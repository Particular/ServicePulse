<script setup>
// Composables
import { ref, watch, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { monitoringConnectionState, connectionState } from "../../composables/serviceServiceControl";
import { formatGraphDuration } from "./formatGraph";
import { licenseStatus } from "../../composables/serviceLicense";
import { useIsMonitoringDisabled } from "../../composables/serviceServiceControlUrls";
import { storeToRefs } from "pinia";
//stores
import { useMonitoringStore } from "../../stores/MonitoringStore";
import { useFailedMessageStore } from "../../stores/FailedMessageStore";
// Components
import LicenseExpired from "../../components/LicenseExpired.vue";
import ServiceControlNotAvailable from "../../components/ServiceControlNotAvailable.vue";
import MonitoringNotAvailable from "./MonitoringNotAvailable.vue";
import PeriodSelector from "./MonitoringHistoryPeriod.vue";
import EndpointBacklog from "./EndpointBacklog.vue";
import EndpointWorkload from "./EndpointWorkload.vue";
import EndpointTimings from "./EndpointTimings.vue";
import EndpointInstances from "./EndpointInstances.vue";
import EndpointMessageTypes from "./EndpointMessageTypes.vue";

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

const isLoading = ref(true);
const loadedSuccessfully = ref(false);

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
    negativeCriticalTimeIsPresent.value = endpoint.value.instances.some((instance) => parseInt(formatGraphDuration(instance.metrics.criticalTime).value) < 0);
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

onMounted(() => {
  getEndpointDetails();
  changeRefreshInterval(historyPeriod.value.refreshIntervalVal);
  //getDisconnectedCount(); // for refresh interval
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
              <EndpointBacklog v-model="endpoint" />
              <EndpointWorkload v-model="endpoint" />
              <EndpointTimings v-model="endpoint" />
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
            <EndpointInstances v-model="endpoint" />
          </section>

          <!--ShowMessagetypes breakdown-->
          <section v-if="!showInstancesBreakdown" class="endpoint-message-types">
            <EndpointMessageTypes v-model="endpoint" @refresh-message-types="refreshMessageTypes" />
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
