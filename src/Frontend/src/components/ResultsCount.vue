<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  displayed: number;
  total: number;
}>();

// Large audit stores easily reach nine digits; format both numbers in the user's locale
const numberFormat = new Intl.NumberFormat();
const formattedDisplayed = computed(() => numberFormat.format(props.displayed));
const formattedTotal = computed(() => numberFormat.format(props.total));
</script>

<template>
  <div class="col format-showing-results">
    <div>Showing {{ formattedDisplayed }} of {{ formattedTotal }} result(s)</div>
  </div>
</template>

<style scoped>
.format-showing-results {
  display: flex;
  align-items: flex-end;
  font-style: italic;
}
</style>
