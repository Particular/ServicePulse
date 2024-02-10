@@ -0,0 +1,55 @@
<script setup>
import { ref } from "vue";
import { useMonitoringStore } from "@/stores/MonitoringStore";

const monitoringStore = useMonitoringStore();
const allPeriods = monitoringStore.allPeriods;
const selectedPeriod = ref(monitoringStore.historyPeriod);

async function selectHistoryPeriod(period) {
  await monitoringStore.setHistoryPeriod(period.pVal);
  selectedPeriod.value = monitoringStore.historyPeriod;
}
</script>

<template>
  <ul class="nav nav-pills period-selector">
    <li
      role="presentation"
      data-bs-placement="top"
      v-for="period in allPeriods"
      :key="period.pVal"
      v-tooltip
      :title="period.refreshIntervalText"
      :class="{ active: period.pVal === selectedPeriod.pVal, notselected: period.pVal !== selectedPeriod.pVal }"
    >
      <a :href="`#`" @click.prevent="selectHistoryPeriod(period)">{{ period.text }}</a>
    </li>
  </ul>
</template>

<style>
.nav-pills.period-selector {
  display: inline-flex;
  position: relative;
  top: 30px;
}

.nav-pills.period-selector > li.active > a,
.nav-pills.period-selector > li.active > a:hover,
.nav-pills.period-selector > li.active > a:focus {
  color: #000;
  font-weight: bold;
  background-color: initial;
  border-bottom: 3px solid #000;
  padding-bottom: 10px;
}

.nav-pills.period-selector > li > a:hover {
  text-decoration: none;
}

.nav-pills > li + li {
  margin-left: 2px;
}
</style>
