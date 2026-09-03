<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useDateFormatter } from "@/composables/dateFormatter";
import { useTimestampZone } from "@/composables/timestampZone";

const props = defineProps<{ dateUtc: string }>();

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
    <span data-testid="adaptive-absolute">{{ absolute }}</span>
    <span class="relative" data-testid="adaptive-relative"> · {{ relative }}</span>
  </span>
</template>

<style scoped>
.relative {
  color: #999;
}
</style>
