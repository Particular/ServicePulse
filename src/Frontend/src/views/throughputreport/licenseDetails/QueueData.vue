<script setup lang="ts">
import DataView from "@/components/DataView.vue";
import InlineThroughputGraph from "../queues/InlineThroughputGraph.vue";
import QueueName from "./QueueName.vue";
import type { Queue } from "@/resources/LicenseDetails";

defineProps<{
  queues: Queue[];
  actionsComponent?: object;
  additionalData?: object;
}>();
</script>

<template>
  <DataView v-if="queues" :data="queues" :items-per-page="100">
    <template #data="{ pageData }">
      <table class="table">
        <thead>
          <tr>
            <th class="queue-name">Queue Name</th>
            <th class="text-end">Throughput</th>
            <th v-if="actionsComponent"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="queue in pageData" :key="`${queue.nameHash}`">
            <td class="queue-name">
              <QueueName :queue="queue" />
            </td>
            <td class="text-end">
              <div class="throughput">
                <InlineThroughputGraph class="position-right" v-if="queue.details?.monthly_throughput?.length" :data="queue.details.monthly_throughput" />
                {{ queue.details?.average_monthly_throughput?.toLocaleString() }}
              </div>
            </td>
            <td v-if="actionsComponent">
              <component :is="actionsComponent" :queue="queue" :additional-data="additionalData" />
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
}

td.queue-name {
  display: flex;
  gap: 3px;
}

.throughput {
  display: flex;
  justify-content: space-between;
}
</style>
