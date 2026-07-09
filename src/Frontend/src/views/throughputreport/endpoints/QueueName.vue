<script setup lang="ts">
import type { Queue } from "./types";

defineProps<{ queue: Queue }>();
</script>

<template>
  <div class="queue-name">
    <span>
      <span class="scope" v-if="queue.scope != null">{{ queue.scope }}</span>
      <span class="name">{{ queue.details?.name ?? queue.nameHash }}</span>
    </span>
  </div>
</template>

<style scoped>
.queue-name {
  display: flex;
  flex-direction: column;
  font-family:
    Consolas,
    Lucida Console,
    monospace;
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
