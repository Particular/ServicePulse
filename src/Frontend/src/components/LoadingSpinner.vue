<script setup lang="ts">
defineProps<{ overlay?: boolean }>();
</script>

<template>
  <div :class="overlay ? 'loading-overlay' : 'text-center'">
    <div class="spinner-border" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>
</template>

<style scoped>
.loading-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.loading-overlay .spinner-border {
  position: sticky;
  top: 4rem;
  margin-top: 2rem;
}
</style>
