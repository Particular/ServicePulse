<script setup lang="ts">
import { ref } from "vue";
import ThroughputGraph from "./ThroughputGraph.vue";
import type { MonthlyThroughput } from "@/resources/EndpointThroughputSummary.ts";
import FAIcon from "@/components/FAIcon.vue";
import { faLineChart } from "@fortawesome/free-solid-svg-icons";

const props = defineProps<{ data: MonthlyThroughput[] }>();

const showContent = ref(false);
</script>

<template>
  <div class="graph-container" :class="{ showContent }">
    <div class="icon" @click="showContent = !showContent">
      <FAIcon :icon="faLineChart" />
    </div>
    <ThroughputGraph class="graph" :data="data" />
  </div>
</template>

<style scoped>
.graph-container {
  position: relative;
  --pips: 0;
}

.graph-container .icon {
  cursor: pointer;
  outline: none;
}

.graph-container.showContent .icon {
  color: var(--sp-blue);
}

.icon svg {
  pointer-events: none;
}

.graph {
  display: none;
  position: absolute;
  top: 1em;
  left: 20%;
  height: 7.5rem;
  box-shadow: 1px 2px 3px hsl(var(--shadow-color));
}

.graph-container:hover .graph,
.graph-container.showContent .graph,
.graph-container:has(svg:focus) .graph {
  display: flex;
  z-index: 1;
}
</style>
