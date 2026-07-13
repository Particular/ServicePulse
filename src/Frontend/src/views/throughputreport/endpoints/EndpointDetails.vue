<script setup lang="ts">
import type { Endpoint } from "./types";
import QueueData from "./QueueData.vue";
import { computed } from "vue";
import type { MonthlyThroughput } from "@/resources/QueueThroughputSummary.ts";
import ThroughputGraph from "../queues/ThroughputGraph.vue";

const props = defineProps<{ endpoint: Endpoint }>();

const throughputByMonth = computed(() =>
  [
    ...props.endpoint.queues
      .flatMap((queue) => queue.details?.monthly_throughput ?? [])
      .reduce((result, { month, throughput }) => {
        const existing = (result as any).getOrInsert(month, 0);
        result.set(month, existing + throughput);
        return result;
      }, new Map()),
  ]
    .toSorted(([x1], [x2]) => x1.localeCompare(x2))
    .map(([month, throughput]) => ({ month, throughput }) as MonthlyThroughput)
);
const sortedQueues = computed(() => props.endpoint.queues.toSorted((q1, q2) => q1.details?.name.toLowerCase().localeCompare(q2.details?.name.toLowerCase())));
</script>

<template>
  <div class="card-body" :key="endpoint.clientId">
    <div class="details">
      <div class="details-item" :title="endpoint.endpointSize.throughputText">
        <label>Licensed Size</label><span>{{ endpoint.endpointSize.name }}</span>
      </div>
      <div class="details-item">
        <label>Total Throughput</label><span>{{ endpoint.totalThroughput.toLocaleString() }}</span>
      </div>
      <div class="details-item" :title="endpoint.currentSize.throughputText">
        <label>Current Size</label><span>{{ endpoint.currentSize.name }}</span>
      </div>
    </div>
    <ThroughputGraph :data="throughputByMonth" class="graph" v-if="throughputByMonth.length" />
    <div class="queue-data">
      <QueueData :queues="sortedQueues" />
    </div>
  </div>
</template>

<style scoped>
.card-body {
  display: grid;
  gap: 2px;
  grid-template-areas:
    "details graph"
    "queue-data queue-data";
}

.details {
  grid-area: details;
  display: flex;
}

.graph {
  grid-area: graph;
  height: 7rem;
  margin-bottom: 1rem;
  justify-self: flex-end;
}

.queue-data {
  grid-area: queue-data;
}

.details-item {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr 0.75fr;
  align-items: center;
}

.details-item label {
  font-weight: bold;
  margin: 0;
}

.details-item label::after {
  content: ":";
}

.details-item span {
  padding: 0.375rem 0;
}
</style>
