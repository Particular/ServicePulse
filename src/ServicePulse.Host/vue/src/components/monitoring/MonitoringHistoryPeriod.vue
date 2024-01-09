<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useGetAllPeriods } from "../../composables/serviceHistoryPeriods.js";
import { useMonitoringStore } from "../../stores/MonitoringStore";

const emit = defineEmits(["period-selected"]);

const monitoringStore = useMonitoringStore();
const route = useRoute();
const router = useRouter();
const allPeriods = useGetAllPeriods();
const defaultPeriod = ref(monitoringStore.historyPeriod);

async function selectHistoryPeriod(period) {
  monitoringStore.updateHistoryPeriod(period);
  defaultPeriod.value = monitoringStore.historyPeriod;
  await updateQueryParameters();
  emit("period-selected", period);
}

async function updateQueryParameters() {
  const queryParameters = { ...route.query };
  await router.push({ query: { ...queryParameters, historyPeriod: defaultPeriod.value.pVal } });
}

onMounted(async () => {
  monitoringStore.updateHistoryPeriod(defaultPeriod.value);
  await updateQueryParameters();
  selectHistoryPeriod(defaultPeriod.value);
});
</script>

<template>
  <ul class="nav nav-pills period-selector">
    <li role="presentation" data-bs-placement="top" v-for="period in allPeriods" :key="period.pVal" v-tooltip :title="period.refreshIntervalText" :class="{ active: period.pVal === defaultPeriod.pVal, notselected: period.pVal !== defaultPeriod.pVal }">
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
