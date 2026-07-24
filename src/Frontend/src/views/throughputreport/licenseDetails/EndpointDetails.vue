<script setup lang="ts">
import { EndpointClassification, type Endpoint } from "@/resources/LicenseDetails";
import QueueData from "./QueueData.vue";
import { computed } from "vue";
import type { MonthlyThroughput } from "@/resources/QueueThroughputSummary.ts";
import ThroughputGraph from "../queues/ThroughputGraph.vue";
import DetailsItem from "@/components/DetailsItem.vue";

const props = defineProps<{ endpoint: Endpoint }>();

const throughputByMonth = computed(() =>
  [
    ...props.endpoint.queues
      .flatMap((queue) => queue.details?.monthly_throughput ?? [])
      .reduce((result, { month, throughput }) => {
        const existing = result.get(month) ?? 0;
        result.set(month, existing + throughput);
        return result;
      }, new Map<string, number>()),
  ]
    .toSorted(([x1], [x2]) => x1.localeCompare(x2))
    .map(([month, throughput]) => ({ month, throughput }) as MonthlyThroughput)
);
const sortedQueues = computed(() => props.endpoint.queues.toSorted((q1, q2) => q1.details?.name.toLowerCase().localeCompare(q2.details?.name.toLowerCase())));
</script>

<template>
  <div class="card-body" :key="endpoint.clientId">
    <div class="details">
      <DetailsItem label="Average Throughput/Month">
        {{ endpoint.totalMonthlyThroughput.toLocaleString() }}
      </DetailsItem>
      <DetailsItem v-if="endpoint.classification === EndpointClassification.Full" label="Current Size" :tooltip="endpoint.currentSize.throughputText">
        {{ endpoint.currentSize.name }}
      </DetailsItem>
      <DetailsItem label="Licensed Size" :tooltip="endpoint.classification === EndpointClassification.Full ? endpoint.endpointSize.throughputText : undefined">
        {{ endpoint.classification === EndpointClassification.Full ? endpoint.endpointSize.name : "Send Only" }}
      </DetailsItem>
    </div>
    <ThroughputGraph :data="throughputByMonth" class="graph" v-if="throughputByMonth.length" />
    <div class="queue-data">
      <QueueData :queues="sortedQueues" />
    </div>
  </div>
</template>

<style scoped>
.card-body {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 2px;
}

.details {
  display: flex;
  flex-direction: column;
  flex: 1;
  max-width: 28em;
}

.graph {
  height: 7rem;
  justify-self: flex-end;
}

.queue-data {
  flex-basis: 100%;
}
</style>
