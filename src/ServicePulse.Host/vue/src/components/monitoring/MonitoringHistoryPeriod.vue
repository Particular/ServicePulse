<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useGetAllPeriods, saveSelectedPeriod, useGetDefaultPeriod } from "../../composables/serviceHistoryPeriods.js";

const emit = defineEmits(["period-selected"]);

const route = useRoute();
const router = useRouter();
const allPeriods = useGetAllPeriods();
const defaultPeriod = ref(useGetDefaultPeriod(route));

function selectHistoryPeriod(period) {
  saveSelectedPeriod(period);
  defaultPeriod.value = period;
  const queryParameters = { ...route.query };
  router.push({ query: { ...queryParameters, historyPeriod: defaultPeriod.value.pVal } });
  emit("period-selected", period);
}

onMounted(() => {
  router.push({ query: { historyPeriod: defaultPeriod.value.pVal } });
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
