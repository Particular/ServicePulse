<script setup lang="ts">
import { computed } from "vue";
import type { SagaTimeoutView } from "@/resources/SagaTimeout";

const props = defineProps<{ timeout: SagaTimeoutView }>();

const display = computed(() => {
  const t = props.timeout;
  switch (t.status) {
    case "Pending":
      if (t.is_overdue) return { text: "Overdue", css: "text-bg-danger" };
      if (t.last_change_kind === "Rescheduled" && t.last_change_source === "Operator") return { text: "Rescheduled by operator", css: "text-bg-primary" };
      return { text: "Pending", css: "text-bg-success" };
    case "Triggered":
      return { text: "Triggered", css: "text-bg-secondary" };
    case "Canceled":
      return { text: "Canceled", css: "text-bg-dark" };
    default:
      return { text: "Unknown", css: "text-bg-warning" };
  }
});
</script>

<template>
  <span class="timeout-status">
    <span class="badge rounded-pill" :class="display.css" aria-label="timeout-status">{{ display.text }}</span>
    <span v-if="timeout.pending_operation" class="badge rounded-pill text-bg-warning change-requested" aria-label="change-requested" :title="`${timeout.pending_operation.change} requested, waiting for the endpoint`">change requested</span>
  </span>
</template>

<style scoped>
.timeout-status {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}
</style>
