<script setup>
// Composables
import { ref, watch, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";
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

function navigateToEndpointUrl($event, isVisible, breakdownPageNo) {
  if ($event.target.localName !== "button") {
    showInstancesBreakdown = isVisible;
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
                <RouterLink :to="{ name: 'message-groups', params: { groupId: endpoint.serviceControlId } }" v-if="endpoint.errorCount" class="warning cursorpointer">
                  <i class="fa fa-envelope"></i>
                  <span class="badge badge-important ng-binding cursorpointer"> {{ endpoint.errorCount }}</span>
                </RouterLink>
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
            <EndpointMessageTypes v-model="endpoint" />
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

.large-graphs {
  width: 100%;
  background-color: white;
  margin-bottom: 34px;
  padding: 30px 0;
}
</style>
