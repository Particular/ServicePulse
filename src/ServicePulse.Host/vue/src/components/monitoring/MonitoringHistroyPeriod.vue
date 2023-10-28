<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getAllPeriods, saveSelectedPeriod, useGetDefaultPeriod } from "../../composables/serviceHistoryPeriods.js";

const emit = defineEmits(["period-selected"]);
const allPeriods = getAllPeriods();
const defaultPeriod = ref(useGetDefaultPeriod());
const router = useRouter();
const route = useRoute();

watch(defaultPeriod, () => {
  const queryParameters = { ...route.query };
  router.push({ query: { ...queryParameters, historyPeriod: defaultPeriod.value.value } });
});

function selectHistoryPeriod(period) {
  saveSelectedPeriod(period);
  defaultPeriod.value = useGetDefaultPeriod();
  emit("period-selected", period);
}

function checkPermaLink() {
  if (route.query.historyPeriod !== undefined) {
    const historyPeriodParam = parseInt(route.query.historyPeriod);
    const historyPeriod = allPeriods.find((period) => {
      return period.value === historyPeriodParam;
    });
    if (historyPeriod !== undefined) {
      selectHistoryPeriod(historyPeriod);
    } else {
      router.push({ query: { historyPeriod: 1 } });
      selectHistoryPeriod(allPeriods.indexOf(0));
    }
  }
}

onMounted(() => {
  checkPermaLink();
});
</script>

<template>
  <ul class="nav nav-pills period-selector" v-for="period in allPeriods" :key="period.value">
    <li role="presentation" :class="{ active: period.value === defaultPeriod.value, notselected: period.value !== defaultPeriod.value }">
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
