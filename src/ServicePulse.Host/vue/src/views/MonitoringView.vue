<script setup>
// Composables
import { ref, onMounted } from "vue";
import { licenseStatus } from "./../composables/serviceLicense.js";
import { connectionState } from "../composables/serviceServiceControl";
import { useRedirects } from "../composables/serviceRedirects.js";
import { useFetchFromMonitoring, useIsMonitoringDisabled } from "../composables/serviceServiceControlUrls";
import { monitoringConnectionState } from "../composables/serviceServiceControl";
import { useGetExceptionGroups } from "../composables/serviceMessageGroup.js";
// Components
import LicenseExpired from "../components/LicenseExpired.vue";
import GroupBy from "../components/monitoring/MonitoringGroupBy.vue";
import EndpointListGrouped from "../components/monitoring/EndpointListGrouped.vue";
import ServiceControlNotAvailable from "../components/ServiceControlNotAvailable.vue";
import EndpointList from "../components/monitoring/EndpointList.vue";
import PeriodSelector from "../components/monitoring/MonitoringHistroyPeriod.vue";

const redirectCount = ref(0);
const endpoints = ref([]);
const grouping = ref([]);
const exceptionGroups = ref([]);
const historyPeriod = 1;
var hasData = ref(false);
var supportsEndpointCount = ref();

function getAllMonitoredEndpoints() {
  if (!useIsMonitoringDisabled() && !monitoringConnectionState.unableToConnect) {
    return useFetchFromMonitoring(`${`monitored-endpoints`}?history=${historyPeriod}`)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        endpoints.value = [];
        endpoints.value = data;
        updateUI();
        getEndpointsFromScSubscription();
      });
  } else {
    getEndpointsFromScSubscription();
  }
}

function getEndpointsFromScSubscription() {
  return useGetExceptionGroups("Endpoint Name").then((result) => {
    exceptionGroups.value = [];
    exceptionGroups.value = result;
    //Squash and add to existing monitored endpoints

    if (exceptionGroups.value.length > 0) {
      //sort the exceptiongroup list by name - case sensitive
      exceptionGroups.value.sort((a, b) => (a.title > b.title ? 1 : a.title < b.title ? -1 : 0)); //desc
      exceptionGroups.value.forEach((failedMessageEndpoint) => {
        if (failedMessageEndpoint.operation_status === "ArchiveCompleted") {
          return;
        }
        var index = endpoints.value.findIndex(function (item) {
          return item.name === failedMessageEndpoint.title;
        });
        if (index >= 0) {
          endpoints.value[index].serviceControlId = failedMessageEndpoint.id;
          endpoints.value[index].errorCount = failedMessageEndpoint.count;
        } else {
          endpoints.value.push({ name: failedMessageEndpoint.title, errorCount: failedMessageEndpoint.count, serviceControlId: failedMessageEndpoint.id, isScMonitoringDisconnected: true });
        }
      });
    }
  });
}

function updateUI() {
  if (endpoints.value.length > 0) {
    endpoints.value.forEach((endpoint) => {
      hasData.value = !endpoint.empty;
      supportsEndpointCount.value = Object.prototype.hasOwnProperty.call(endpoint, "connectedCount"); ////$scope.supportsEndpointCount = Object.prototype.hasOwnProperty.call(endpoint, 'connectedCount');
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
}

function mergeIn(destination, source) {
  for (var propName in source) {
    if (Object.prototype.hasOwnProperty.call(source, propName)) {
      destination[propName] = source[propName];
    }
  }
}

function updateGroupedEndpointList(endpointGrouping) {
  grouping.value = endpointGrouping;
}

onMounted(() => {
  useRedirects().then((result) => {
    redirectCount.value = result.total;
  });
  getAllMonitoredEndpoints();
});
</script>

<template>
  <LicenseExpired />
  <template v-if="!licenseStatus.isExpired">
    <div class="container monitoring-view">
      <ServiceControlNotAvailable />
      <template v-if="connectionState.connected">
        <div class="row monitoring-head">
          <div class="col-sm-4 no-side-padding list-section">
            <h1>Endpoints overview</h1>
          </div>
          <!--filters-->
          <div class="col-sm-8 no-side-padding toolbar-menus">
            <div class="filter-group filter-monitoring">
              <PeriodSelector @period-selected="updateUI()"></PeriodSelector>
              <GroupBy v-if="endpoints.length" :endpoints="endpoints" @group-selector="updateGroupedEndpointList" />
              <input type="text" placeholder="Filter by name..." class="form-control-static filter-input" />
            </div>
          </div>
        </div>
        <!--List of endpoints-->
        <EndpointList v-if="grouping.length === 0"></EndpointList>
        <!--Grouped list of endpoints-->
        <EndpointListGrouped v-if="grouping.selectedGrouping !== undefined && grouping.selectedGrouping > 0" :grouping="grouping"></EndpointListGrouped>
      </template>
    </div>
  </template>
</template>
<style>
.form-control-static {
  min-height: 34px;
  padding-top: 7px;
  padding-bottom: 7px;
  margin-bottom: 0;
}

.filter-group.filter-monitoring {
  width: 100%;
}

.filter-group.filter-monitoring input {
  margin-top: 33px;
  float: none;
  font-size: 14px;
}

.filter-group {
  display: flex;
  justify-content: flex-end;
  width: 50%;
  position: relative;
  top: -3px;
  margin-top: -26px;
  float: right;
}

.filter-group:before {
  width: 16px;
  font-family: "FontAwesome";
  width: 20px;
  content: "\f0b0";
  color: #919e9e;
  position: absolute;
  top: 29px;
  right: 250px;
}

.filter-group input {
  display: inline-block;
  width: 280px;
  margin: 21px 0 0 15px;
  padding-right: 10px;
  padding-left: 30px;
  border: 1px solid #aaa;
  border-radius: 4px;
  float: right;
}

.nav {
  padding-left: 0;
  margin-bottom: 0;
  list-style: none;
}

.nav.nav-pills.period-selector {
  display: inline-block;
  position: relative;
  top: 30px;
}

.nav > li {
  position: relative;
  display: block;
}

.nav-pills > li {
  float: left;
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

.monitoring-view .filter-group.filter-monitoring:before {
  top: 41px;
}

.monitoring-view .dropdown {
  top: 33px;
  margin-left: 25px;
  width: 250px;
}

.monitoring-view .dropdown .dropdown-menu {
  top: 36px;
  margin-left: 72px;
}
</style>
