<script setup lang="ts">
import type { Queue } from "@/resources/LicenseDetails";
import { Tippy } from "vue-tippy";
import { computed } from "vue";

const props = defineProps<{ queues: Queue[] }>();
const validQueues = computed(() => props.queues.filter((queue) => queue.details));
</script>

<template>
  <tippy v-if="validQueues.length">
    <template #content>
      <ul>
        <li v-for="queue in validQueues" :key="queue.details.name">{{ queue.details.name }}</li>
      </ul>
    </template>
    <span class="badge rounded-pill" v-if="queues.length"> {{ queues.length }} {{ queues.length === 1 ? "queue" : "queues" }} </span>
  </tippy>
  <span class="badge rounded-pill" v-else-if="queues.length"> {{ queues.length }} {{ queues.length === 1 ? "queue" : "queues" }} </span>
</template>

<style scoped></style>
