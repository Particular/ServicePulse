<script setup lang="ts">
defineProps<{ label: string; tooltip?: string; ariaLabel?: string }>();
</script>

<template>
  <div class="details-item">
    <label>{{ label }}</label>
    <!-- role and aria-label are used for tests -->
    <span role="note" :title="tooltip" :aria-label="ariaLabel"><slot></slot></span>
  </div>
</template>

<style scoped>
.details-item {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr 1fr;
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
