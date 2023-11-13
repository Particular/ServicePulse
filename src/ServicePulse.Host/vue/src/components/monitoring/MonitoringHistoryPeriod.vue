<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useGetAllPeriods, saveSelectedPeriod, useGetDefaultPeriod, useHistoryPeriodQueryString } from "../../composables/serviceHistoryPeriods.js";

const emit = defineEmits(["period-selected"]);
const settings = defineProps({
  period: { type: Object, default: useGetDefaultPeriod() },
});
const route = useRoute();
const router = useRouter();
const allPeriods = useGetAllPeriods();
const defaultPeriod = ref(settings.period);

watch(defaultPeriod, () => {
  const queryParameters = { ...route.query };
  router.push({ query: { ...queryParameters, historyPeriod: defaultPeriod.value.pVal } });
});

function selectHistoryPeriod(period) {
  saveSelectedPeriod(period);
  defaultPeriod.value = useGetDefaultPeriod();
  emit("period-selected", period);
}

onMounted(() => {
  defaultPeriod.value = settings.period;
  if (defaultPeriod.value === undefined) {
    defaultPeriod.value = useHistoryPeriodQueryString(route);
    if (defaultPeriod.value === undefined) {
      defaultPeriod.value = useGetDefaultPeriod();
    }
  }
  router.push({ query: { historyPeriod: defaultPeriod.value.pVal } });
  selectHistoryPeriod(defaultPeriod.value);
});
</script>

<template>
  <ul class="nav nav-pills period-selector" v-for="period in allPeriods" :key="period.pVal">
    <li role="presentation" data-bs-placement="top" v-tooltip :title="period.refreshIntervalText" :class="{ active: period.pVal === defaultPeriod.pVal, notselected: period.pVal !== defaultPeriod.pVal }">
      <a :href="`#`" @click.prevent="selectHistoryPeriod(period)">{{ period.text }}</a>
    </li>
  </ul>
</template>

<style>
.nav-pills.period-selector > li.active > a,
.nav-pills.period-selector > li.active > a:hover,
.nav-pills.period-selector > li.active > a:focus {
  color: #000;
  font-weight: bold;
  background-color: initial;
  border-bottom: 3px solid #000;
  padding-bottom: 10px;
}
</style>
