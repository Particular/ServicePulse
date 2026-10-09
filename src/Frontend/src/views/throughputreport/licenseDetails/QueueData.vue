<script setup lang="ts">
import DataView from "@/components/DataView.vue";
import InlineThroughputGraph from "../queues/InlineThroughputGraph.vue";
import QueueName from "./QueueName.vue";
import type { Queue } from "@/resources/LicenseDetails";

defineProps<{ queues: Queue[]; currentLocation?: string }>();
</script>

<template>
  <DataView v-if="queues" :data="queues" :items-per-page="100">
    <template #data="{ pageData }">
      <table class="table">
        <thead>
          <tr>
            <th class="queue-name">Queue Name</th>
            <th class="text-end">Throughput</th>
            <th v-if="$slots.actions"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="queue in pageData" :key="`${queue.nameHash}`">
            <td class="queue-name">
              <QueueName :queue="queue" :amended="queue.originalLocation != currentLocation" />
            </td>
            <td class="text-end">
              <div class="throughput">
                <InlineThroughputGraph class="position-right" v-if="queue.details?.monthly_throughput?.length" :data="queue.details.monthly_throughput" />
                {{ queue.details?.average_monthly_throughput?.toLocaleString() }}
              </div>
            </td>
            <td v-if="$slots.actions" class="actions">
              <slot name="actions" :queue="queue" />
            </td>
          </tr>
        </tbody>
      </table>
    </template>
  </DataView>
</template>

<style scoped>
.table {
  width: 100%;
}

.table thead tr th {
  background-color: transparent;
}

td:not(.queue-name),
th:not(.queue-name) {
  width: 0;
}

td {
  padding-top: 0.1rem;
  padding-bottom: 0.1rem;
  align-content: center;
}

.throughput {
  display: flex;
  justify-content: space-between;
}

.actions {
  background: linear-gradient(to right, transparent 0%, var(--reduced-emphasis) 1em, var(--reduced-emphasis) calc(100% - 1em), transparent 100%);
}
</style>
