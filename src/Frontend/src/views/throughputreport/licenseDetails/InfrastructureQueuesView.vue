<script setup lang="ts">
import { useLicenseDetailsStore } from "@/stores/LicenseDetailsStore";
import { storeToRefs } from "pinia";
import QueueData from "./QueueData.vue";
import NoData from "@/components/NoData.vue";
import InfrastructureQueueActions from "./InfrastructureQueueActions.vue";

const licenseDetailsStore = useLicenseDetailsStore();
const { infrastructureQueues } = storeToRefs(licenseDetailsStore);
</script>

<template>
  <div class="alert alert-info mt-1">These are queues which only exist in your system to support the Particular Platform functionality</div>
  <div class="mt-2" v-if="infrastructureQueues.length">
    <QueueData :queues="infrastructureQueues">
      <template #actions="{ queue }">
        <InfrastructureQueueActions :queue="queue" />
      </template>
    </QueueData>
  </div>
  <NoData v-else message="There are currently no infrastructure queues associated with your license"></NoData>
</template>
