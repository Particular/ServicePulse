<script setup lang="ts">
import type { Endpoint } from "./types";
import QueueData from "./QueueData.vue";

// import { computed } from "vue";
// import { compare } from "./utilities";

const props = defineProps<{ endpoint: Endpoint }>();

// const throughput = computed(() =>
//   props.endpoint.queues.every((queue) => queue.throughputByMonth.length || queue.throughput === 0)
//     ? [
//         ...props.endpoint.queues
//           .flatMap((queue) => queue.throughputByMonth)
//           .reduce((result, [month, value]) => {
//             const existing = result.getOrInsert(month, 0);
//             result.set(month, existing + value);
//             return result;
//           }, new Map()),
//       ].sort(([x1], [x2]) => compare(x1, x2))
//     : [],
// );
// const sortedQueues = computed(() => props.endpoint.queues.toSorted((q1, q2) => compare(q1.simplifiedName.toLowerCase(), q2.simplifiedName.toLowerCase())));
</script>

<template>
  <div class="card-body" :key="endpoint.clientId">
    <div class="details">
      <div class="details-item">
        <label>Licensed Size</label><span>{{ endpoint.endpointSize }}</span>
      </div>
      <div class="details-item">
        <label>Current Size</label><span>{{ endpoint.endpointSize }}</span>
      </div>
    </div>
    <!-- <ThroughputGraph :data="throughput" class="graph" v-if="throughput.length" /> -->
    <div class="queue-data">
      <QueueData :queues="endpoint.queues" />
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
