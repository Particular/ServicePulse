<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  displayed: number;
  total: number;
  durationMs?: number | null;
}>();

// Large audit stores easily reach nine digits; format both numbers in the user's locale
const numberFormat = new Intl.NumberFormat();
const formattedDisplayed = computed(() => numberFormat.format(props.displayed));
const formattedTotal = computed(() => numberFormat.format(props.total));
const formattedDuration = computed(() => {
  if (props.durationMs === null || props.durationMs === undefined) return null;
  if (props.durationMs < 1000) return `${props.durationMs} ms`;
  return `${(props.durationMs / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })} s`;
});
</script>

<template>
  <div class="col format-showing-results">
    <div>
      Showing {{ formattedDisplayed }} of {{ formattedTotal }} result(s)<template v-if="formattedDuration"> · took {{ formattedDuration }}</template>
    </div>
  </div>
</template>

<style scoped>
.format-showing-results {
  display: flex;
  align-items: flex-end;
  font-style: italic;
}
</style>
