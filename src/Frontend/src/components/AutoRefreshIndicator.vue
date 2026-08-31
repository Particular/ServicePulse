<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

const props = defineProps<{ nextRefreshAt: number | null; intervalMs: number | null; refreshing: boolean }>();

const now = ref(Date.now());
let timer: number | undefined;

onMounted(() => {
  timer = window.setInterval(() => (now.value = Date.now()), 250);
});

onBeforeUnmount(() => window.clearInterval(timer));

const fraction = computed(() => {
  if (props.nextRefreshAt === null || !props.intervalMs) return null;
  const remaining = props.nextRefreshAt - now.value;
  return Math.min(1, Math.max(0, remaining / props.intervalMs));
});

const secondsLeft = computed(() => (props.nextRefreshAt === null ? null : Math.max(0, Math.ceil((props.nextRefreshAt - now.value) / 1000))));
</script>

<template>
  <div
    v-if="fraction !== null"
    class="auto-refresh-indicator"
    role="timer"
    :aria-label="refreshing ? 'Waiting for query results' : `Auto refresh in ${secondsLeft} seconds`"
    :title="refreshing ? 'Waiting for query results…' : `Auto refresh in ${secondsLeft}s`"
    data-testid="auto-refresh-indicator"
  >
    <div v-if="refreshing" class="bar waiting" data-testid="auto-refresh-waiting" />
    <div v-else class="bar" :style="{ width: `${fraction * 100}%` }" data-testid="auto-refresh-countdown" />
  </div>
</template>

<style scoped>
.auto-refresh-indicator {
  width: 100%;
  height: 3px;
  margin-top: 0.25rem;
  background-color: #e0e0e0;
  border-radius: 2px;
  overflow: hidden;
}

.bar {
  height: 100%;
  background-color: #00729c;
  transition: width 250ms linear;
}

.bar.waiting {
  width: 100%;
  animation: waiting-pulse 1.2s ease-in-out infinite;
}

@keyframes waiting-pulse {
  0%,
  100% {
    opacity: 0.35;
  }
  50% {
    opacity: 0.9;
  }
}
</style>
