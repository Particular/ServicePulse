<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useDateFormatter } from "@/composables/dateFormatter";
import { useTimestampZone } from "@/composables/timestampZone";

// part: render only one half — lets a layout place the absolute time and the
// age in separate (grid) cells while both keep the dual-zone tooltip
const props = defineProps<{ dateUtc: string; part?: "absolute" | "relative" }>();

const { formatAdaptiveDate, formatCoarseRelative, formatDateTooltip } = useDateFormatter();
const { zone } = useTimestampZone();

// tick so the relative label stays honest and the adaptive form rolls over at midnight
const now = ref(new Date());
let timer: number | undefined;
onMounted(() => {
  timer = window.setInterval(() => (now.value = new Date()), 5000);
});
onBeforeUnmount(() => window.clearInterval(timer));

const absolute = computed(() => formatAdaptiveDate(props.dateUtc, () => now.value, zone.value));
const relative = computed(() => formatCoarseRelative(props.dateUtc, () => now.value));
const tooltip = computed(() => formatDateTooltip(props.dateUtc));
</script>

<template>
  <span class="adaptive-timestamp" :title="tooltip">
    <span v-if="props.part !== 'relative'" data-testid="adaptive-absolute">{{ absolute }}</span>
    <span v-if="props.part !== 'absolute'" class="relative" data-testid="adaptive-relative">{{ props.part === "relative" ? "" : " · " }}{{ relative }}</span>
  </span>
</template>

<style scoped>
.relative {
  color: #999;
}
</style>
