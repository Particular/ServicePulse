<script setup lang="ts">
import { useLicenseDetailsStore } from "@/stores/LicenseDetailsStore";
import { storeToRefs } from "pinia";
import QueueData from "./QueueData.vue";
import NoData from "@/components/NoData.vue";
import ExcludedQueueActions from "./ExcludedQueueActions.vue";

const licenseDetailsStore = useLicenseDetailsStore();
const { excludedQueues } = storeToRefs(licenseDetailsStore);
</script>

<template>
  <div class="alert alert-info mt-1">These are queues which do not form part of your NServiceBus system, and do not contribute to your license</div>
  <div class="mt-2" v-if="excludedQueues.length">
    <QueueData :queues="excludedQueues" current-location="excluded">
      <template #actions="{ queue }">
        <ExcludedQueueActions :queue="queue" />
      </template>
    </QueueData>
  </div>
  <NoData v-else message="There are currently no excluded queues associated with your license"></NoData>
</template>
