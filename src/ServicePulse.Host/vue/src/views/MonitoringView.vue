<script setup>
// Composables
import { onMounted, watch, onUnmounted, computed } from "vue";
import { useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { licenseStatus } from "@/composables/serviceLicense";
import { connectionState } from "@/composables/serviceServiceControl";
import { useMonitoringStore } from "@/stores/MonitoringStore";
// Components
import LicenseExpired from "@/components/LicenseExpired.vue";
import ServiceControlNotAvailable from "@/components/ServiceControlNotAvailable.vue";
import EndpointList from "@/components/monitoring/EndpointList.vue";
import MonitoringNoData from "@/components/monitoring/MonitoringNoData.vue";
import MonitoringHead from "@/components/monitoring/MonitoringHead.vue";

const route = useRoute();
const monitoringStore = useMonitoringStore();
const { historyPeriod } = storeToRefs(monitoringStore);
const noData = computed(() => monitoringStore.endpointListIsEmpty);
let refreshInterval = undefined;

watch(route, () => monitoringStore.setHistoryPeriod(route.params.historyPeriod), { deep: true, immediate: true, flush: "pre" });

//const redirectCount = ref(0);

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
          <MonitoringHead />
          <EndpointList />
        </template>
      </template>
    </div>
  </template>
</template>

<style>
/* particular.css START - TODO extract only the classes required */

.box-header {
  padding-bottom: 3px;
  padding-top: 2px;
}

.box-header ul {
  list-style-type: none;
  margin: 0;
  padding: 0;
}

.box-no-click {
  background: none;
  border-bottom: 1px solid #ced6d3;
  border-left: none;
  border-right: none;
  cursor: default;
}

.box-no-click:first-child {
  border-top: 1px solid #ced6d3;
}

.righ-side-ellipsis {
  direction: rtl;
  text-align: left;
}

@supports (-ms-ime-align: auto) {
  .righ-side-ellipsis {
    direction: ltr;
  }
}

@media all and (-ms-high-contrast: none), (-ms-high-contrast: active) {
  .righ-side-ellipsis {
    direction: ltr;
  }
}

.box-no-click {
  padding-left: 0;
  padding-right: 0;
}

.box-no-click:hover {
  background: none !important;
  border-bottom: 1px solid #ced6d3 !important;
  border-left: none;
  border-right: none;
  border-top: none;
  cursor: default;
  padding-top: 21px;
}

.box-no-click:first-child:hover {
  border-top: 1px solid #ced6d3 !important;
  padding-top: 20px;
}

.box-no-click > div > div {
  padding-left: 0;
  padding-right: 0;
}

.box-no-click > div > div > div {
  padding-left: 0;
  padding-right: 0;
}

.row.message-type-properties {
  position: relative;
  top: -5px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

i.fa.pa-endpoint-lost.endpoints-overview,
i.fa.pa-monitoring-lost.endpoints-overview {
  position: relative;
  margin-right: 4px;
}

i.fa.pa-endpoint-lost.endpoints-overview {
  top: 8px;
}

.toolbar-menus.endpoint-details {
  display: flex;
  margin-bottom: 5px;
  justify-content: flex-end;
}

.nav.nav-pills.period-selector.endpoint-details {
  top: 5px;
}

@media (min-width: 0px) {
  .container {
    width: 92%;
  }

  .col-lg-max-8 {
    max-width: 66%;
    float: left;
  }
  .col-lg-max-9 {
    max-width: 76%;
    float: left;
  }

  .col-lg-max-10 {
    max-width: 88%;
    float: left;
  }
}

span.fa-exclamation-triangle.warning {
  color: #f3bc52;
  background: linear-gradient(black, black) center/20% 72% no-repeat;
}

span.fa-exclamation-triangle.danger {
  color: #ce4844;
  font-weight: normal !important;
  background: linear-gradient(white, white) center/20% 72% no-repeat;
}

.monitoring-no-data a.btn.btn-default.btn-secondary {
  margin-left: 10px;
}

.endpoint-data-changed {
  text-align: center;
  margin: 26px 0 0;
}

.endpoint-data-changed a {
  text-decoration: underline;
}

.endpoint-data-changed a:hover {
  cursor: pointer;
}

.endpoint-data-changed.sticky {
  position: fixed;
  top: 50px;
  width: 92%;
  z-index: 999999;
  box-shadow: 0 3px 20px rgba(0, 0, 0, 0.15);
  transition-duration: 0.5s;
}

div[content="Unable to connect to instance"],
div[content="Unable to connect to monitoring server"] {
  z-index: 99999;
}

ul.dropdown-menu li a span {
  color: #aaa;
}

.endpoint-row a.remove-endpoint {
  display: block;
  position: absolute;
  top: 17px;
  right: 22px;
}

.endpoint-row:hover a.remove-endpoint {
  display: block;
  position: absolute;
  top: 17px;
  right: 22px;
}

a.remove-endpoint {
  margin-left: 7px;
}

a.remove-endpoint:hover {
  cursor: pointer;
}

a.remove-endpoint i {
  color: #00a3c4;
}

a.remove-endpoint:hover i {
  color: #00729c;
}

.monitoring-lost-link i {
  top: 7px;
}

.select-all {
  width: 127px;
}

.endpoint-group-title {
  font-size: 14px;
  font-weight: bold;
  margin: 20px 0 10px 15px;
}

div.avg-tooltip {
  position: absolute;
  text-align: left;
  padding: 0.3rem;
  line-height: 1;
  background: var(--avg-tooltip-background-color);
  color: #ffffff;
  border-radius: 8px 1px 1px 8px;
  pointer-events: none;
  font-size: 11px;
  white-space: nowrap;
}

div.avg-tooltip.left {
  border-radius: 1px 8px 8px 1px;
}

div.avg-tooltip:before {
  content: "";
  display: block;
  z-index: -1;
  right: 0;
  position: absolute;
  top: 50%;
  background-color: var(--avg-tooltip-background-color);
  width: 24px;
  height: 24px;
  margin-top: -12px;
  margin-right: -12px;

  transform: rotate(45deg);
}

div.avg-tooltip.left:before {
  right: inherit;
  margin-right: inherit;
  margin-left: -12px;
  left: 0;
}

div.avg-tooltip .value {
  font-size: 14px;
  font-weight: bold;
}

div.avg-tooltip .value span {
  font-size: 11px;
  font-weight: normal;
}
/* particular.css END */
</style>
