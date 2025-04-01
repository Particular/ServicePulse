<script setup lang="ts">
import { EndpointCentrePoint } from "./EndpointsComponent.vue";

defineProps<{
  centrePoints: EndpointCentrePoint[];
  height: number;
}>();
</script>

<template>
  <g v-for="timeline in centrePoints" :key="timeline.name">
    <path :d="`M${timeline.centre} ${timeline.top} v0 ${height - timeline.top}`" stroke="var(--gray90)" stroke-width="2" />
  </g>
</template>
