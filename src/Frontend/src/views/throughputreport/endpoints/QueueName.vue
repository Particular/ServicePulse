<script setup lang="ts">
import type { Queue } from "./types";
import { faWarning } from "@fortawesome/free-solid-svg-icons";
import ExclamationMark from "@/components/ExclamationMark.vue";
import { WarningLevel } from "@/components/WarningLevel";

defineProps<{ queue: Queue }>();
</script>

<template>
  <div class="queue-name">
    <span>
      <span class="scope" v-if="queue.scope != null">{{ queue.scope }}</span>
      <span class="name" v-if="queue.details">{{ queue.details.name }}</span>
      <ExclamationMark v-else :icon="faWarning" :type="WarningLevel.Danger" title="A queue existed when the usage report for the last license was generated which no longer exists. Please contact Particular Support" />
    </span>
  </div>
</template>

<style scoped>
.queue-name {
  display: flex;
  flex-direction: column;
}

.scope {
  border: solid 1px #666;
  border-radius: 4px;
  font-family: Helvetica, Arial, sans-serif;
  font-size: 13px;
  padding: 2px;
  margin-right: 4px;
  white-space: nowrap;
}

.name {
  overflow-wrap: anywhere;
}
</style>
