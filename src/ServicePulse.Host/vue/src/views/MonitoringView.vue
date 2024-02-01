<script setup>
// Composables
import { ref, onMounted, watch, onUnmounted, computed } from "vue";
import { storeToRefs } from "pinia";
import { licenseStatus } from "./../composables/serviceLicense.js";
import { connectionState } from "../composables/serviceServiceControl";
import { useMonitoringStore } from "../stores/MonitoringStore";
// Components
import LicenseExpired from "../components/LicenseExpired.vue";
import GroupBy from "../components/monitoring/MonitoringGroupBy.vue";
import ServiceControlNotAvailable from "../components/ServiceControlNotAvailable.vue";
import EndpointList from "../components/monitoring/EndpointList.vue";
import PeriodSelector from "../components/monitoring/MonitoringHistoryPeriod.vue";
import MonitoringNoData from "../components/monitoring/MonitoringNoData.vue";

const monitoringStore = useMonitoringStore();
const { historyPeriod } = storeToRefs(monitoringStore);
const noData = computed(() => monitoringStore.endpointListIsEmpty);
const filterString = ref("");
let refreshInterval = undefined;

//const redirectCount = ref(0);

watch(filterString, async (newValue) => {
  await monitoringStore.updateFilterString(newValue);
  filterString.value = monitoringStore.filterString;
});

watch(historyPeriod, async (newValue) => {
  await changeRefreshInterval(newValue.refreshIntervalVal);
});

async function changeRefreshInterval(milliseconds) {
  if (typeof refreshInterval !== "undefined") {
    clearInterval(refreshInterval);
  }
  await monitoringStore.updateEndpointList();
  refreshInterval = setInterval(async () => {
    await monitoringStore.updateEndpointList();
  }, milliseconds);
}

onUnmounted(() => {
  if (typeof refreshInterval !== "undefined") {
    clearInterval(refreshInterval);
  }
});

onMounted(async () => {
  await monitoringStore.initializeStore();
  filterString.value = monitoringStore.filterString;
  await changeRefreshInterval(monitoringStore.historyPeriod.refreshIntervalVal);
});
</script>

<template>
  <LicenseExpired />
  <template v-if="!licenseStatus.isExpired">
    <div class="container monitoring-view">
      <ServiceControlNotAvailable />
      <template v-if="connectionState.connected && monitoringStore.isInitialized">
        <MonitoringNoData v-if="noData"></MonitoringNoData>
        <template v-if="!noData">
          <div class="row monitoring-head">
            <div class="col-sm-4 no-side-padding list-section">
              <h1>Endpoints overview</h1>
            </div>
            <div class="col-sm-8 no-side-padding toolbar-menus">
              <div class="filter-group filter-monitoring">
                <PeriodSelector />
                <GroupBy />
                <input type="text" placeholder="Filter by name..." class="form-control-static filter-input" v-model="filterString" />
              </div>
            </div>
          </div>
          <EndpointList />
        </template>
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
