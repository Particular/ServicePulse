<script setup>
import { ref } from "vue";
import { getAllPeriods, saveSelectedPeriod, useGetDefaultPeriod } from "../../composables/serviceHistoryPeriods.js";

const emit = defineEmits(["period-selected"]);
const allPeriods = getAllPeriods();
const defaultPeriod = ref(useGetDefaultPeriod());

function selectHistoryPeriod(period) {
  saveSelectedPeriod(period);
  defaultPeriod.value = useGetDefaultPeriod();
  emit("period-selected");
}
</script>

<template>
  <ul class="nav nav-pills period-selector" v-for="period in allPeriods" :key="period.value">
    <li role="presentation" :class="{ active: period.value === defaultPeriod.value, notselected: period.value !== defaultPeriod.value }">
      <a :href="`#/monitoring?historyPeriod=` + period.value" @click="selectHistoryPeriod(period)">{{ period.text }}</a>
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
