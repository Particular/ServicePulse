<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useDateFormatter } from "@/composables/dateFormatter";

const props = defineProps<{
  displayed: number;
  total: number;
  // The total only covers the instances that answered (partial scatter-gather result)
  incomplete?: boolean;
  durationMs?: number | null;
  completedAt?: string | null;
}>();

const { formatCoarseRelative, formatDateTooltip } = useDateFormatter();
const now = ref(new Date());
let timer: number | undefined;
onMounted(() => {
  timer = window.setInterval(() => (now.value = new Date()), 5000);
});
onBeforeUnmount(() => window.clearInterval(timer));

const ranAgo = computed(() => (props.completedAt ? formatCoarseRelative(props.completedAt, () => now.value) : null));
const ranTooltip = computed(() => (props.completedAt ? formatDateTooltip(props.completedAt) : ""));

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
      Showing {{ formattedDisplayed }} of {{ incomplete ? "at least " : "" }}{{ formattedTotal }} result(s)<template v-if="formattedDuration"> · took {{ formattedDuration }}</template
      ><template v-if="ranAgo">
        · ran <span :title="ranTooltip" data-testid="ran-ago">{{ ranAgo }}</span></template
      >
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
