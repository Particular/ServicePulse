<script setup>
// Composables
import { ref, onMounted, watch,onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { licenseStatus } from "./../composables/serviceLicense.js";
import { connectionState } from "../composables/serviceServiceControl";
import { useRedirects } from "../composables/serviceRedirects.js";
import { useGetDefaultPeriod } from "../composables/serviceHistoryPeriods.js";
import { useMonitoringStore } from "../stores/MonitoringStore";
import * as MonitoringEndpoints from "../composables/serviceMonitoringEndpoints";
// Components
import LicenseExpired from "../components/LicenseExpired.vue";
import GroupBy from "../components/monitoring/MonitoringGroupBy.vue";
import EndpointListGrouped from "../components/monitoring/EndpointListGrouped.vue";
import ServiceControlNotAvailable from "../components/ServiceControlNotAvailable.vue";
import EndpointList from "../components/monitoring/EndpointList.vue";
import PeriodSelector from "../components/monitoring/MonitoringHistoryPeriod.vue";
import MonitoringNoData from "../components/monitoring/MonitoringNoData.vue";

const redirectCount = ref(0);
const monitoringStore = useMonitoringStore();
const allEndpoints = ref([]);
const filteredEndpoints = ref([]);
const grouping = ref([]);
const route = useRoute();
const router = useRouter();
const historyPeriod = ref(useGetDefaultPeriod(route));
const filterString = ref("");
const isFiltered = ref(false);
const isGrouped = ref(false);

let refreshInterval = undefined;

function updateGroupedEndpointList(endpointGrouping) {
  if (endpointGrouping.value.selectedGrouping === 0) {
    grouping.value = ref([]);
    isGrouped.value = false;
  } else {
    grouping.value = endpointGrouping.value;
    isGrouped.value = true;
  }
}

function periodSelected(period) {
  historyPeriod.value = period;
  changeRefreshInterval(historyPeriod.value.refreshIntervalVal);
}

watch(filterString, async (newValue) => {
  allEndpoints.value = await MonitoringEndpoints.useGetAllMonitoredEndpoints(historyPeriod.value.pVal);
  let queryParameters = { ...route.query };
  if (newValue === "") {
    isFiltered.value = false;
    delete queryParameters.filter;
    await router.push({ query: { ...queryParameters } }); // Remove filter query parameter from url
  } else {
    isFiltered.value = true;
    await router.push({ query: { ...queryParameters, filter: newValue } }); // Update or add filter query parameter to url
    filteredEndpoints.value = await MonitoringEndpoints.useFilterAllMonitoredEndpointsByName(allEndpoints, newValue);
  }
});

function getUrlQueryStrings() {
  const queryParameters = { ...route.query };
  historyPeriod.value = useGetDefaultPeriod(route);

  if (queryParameters.filter !== undefined) {
    filterString.value = queryParameters.filter;
  }
}

function changeRefreshInterval(milliseconds) {
  if (typeof refreshInterval !== "undefined") {
    clearInterval(refreshInterval);
  }
  refreshInterval = setInterval(async () => {
    allEndpoints.value = await MonitoringEndpoints.useGetAllMonitoredEndpoints(historyPeriod.value.pVal);
  }, milliseconds);
}

onUnmounted(() => {
  if (typeof refreshInterval !== "undefined") {
    clearInterval(refreshInterval);
  }
});
onMounted(async () => {
  getUrlQueryStrings();
  await monitoringStore.updateEndpointList(historyPeriod.value.pVal);
  allEndpoints.value = monitoringStore.endpointList;
  const result = await useRedirects();
  redirectCount.value = result.total;
  changeRefreshInterval(historyPeriod.value.refreshIntervalVal);
});
</script>

<template>
  <LicenseExpired />
  <template v-if="!licenseStatus.isExpired">
    <div class="container monitoring-view">
      <ServiceControlNotAvailable />
      <template v-if="connectionState.connected">
        <MonitoringNoData v-if="monitoringStore.isEndpointListEmpty"></MonitoringNoData>
        <div v-if="!monitoringStore.isEndpointListEmpty" class="row monitoring-head">
          <div class="col-sm-4 no-side-padding list-section">
            <h1>Endpoints overview</h1>
          </div>
          <!--filters-->
          <div class="col-sm-8 no-side-padding toolbar-menus">
            <div class="filter-group filter-monitoring">
              <PeriodSelector @period-selected="periodSelected"></PeriodSelector>
              <GroupBy :endpoints="isFiltered ? filteredEndpoints : allEndpoints" @group-selector="updateGroupedEndpointList" :key="isFiltered ? filteredEndpoints : allEndpoints" />
              <input type="text" placeholder="Filter by name..." class="form-control-static filter-input" v-model="filterString" />
            </div>
          </div>
        </div>
        <!--List of endpoints-->
        <EndpointList v-if="!isGrouped" :endpoints="isFiltered ? filteredEndpoints : allEndpoints" :key="isFiltered ? filteredEndpoints : allEndpoints"></EndpointList>
        <!--Grouped list of endpoints-->
        <EndpointListGrouped v-if="isGrouped" :grouping="grouping" :key="grouping"></EndpointListGrouped>
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
