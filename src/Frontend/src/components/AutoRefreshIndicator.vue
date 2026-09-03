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

// r=6.75 in a 16x16 viewBox (filling the box like a FontAwesome glyph does);
// the arc depletes as the next refresh approaches
const circumference = 2 * Math.PI * 6.75;
const dashOffset = computed(() => (fraction.value === null ? 0 : circumference * (1 - fraction.value)));

const label = computed(() => (props.refreshing ? "Waiting for query results…" : `Auto refresh in ${secondsLeft.value}s`));
</script>

<template>
  <span v-if="fraction !== null" class="auto-refresh-indicator" role="timer" :aria-label="label" :title="label" data-testid="auto-refresh-indicator" :data-state="refreshing ? 'waiting' : 'countdown'">
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <circle class="track" cx="8" cy="8" r="6.75" />
      <circle v-if="!refreshing" class="progress" cx="8" cy="8" r="6.75" :stroke-dasharray="circumference" :stroke-dashoffset="dashOffset" data-testid="auto-refresh-countdown" />
      <circle v-else class="waiting" cx="8" cy="8" r="6.75" :stroke-dasharray="`${circumference / 5} ${circumference / 5}`" data-testid="auto-refresh-waiting" />
    </svg>
  </span>
</template>

<style scoped>
.auto-refresh-indicator {
  /* mirror FontAwesome's sizing so the ring occupies exactly the arrow icon's box */
  display: inline-block;
  line-height: 0;
  vertical-align: -0.125em;
}

svg {
  width: 1em;
  height: 1em;
}

circle {
  fill: none;
  stroke-width: 2.4;
}

.track {
  stroke: #e3e3e3;
}

.progress {
  stroke: #00729c;
  stroke-linecap: round;
  transform: rotate(-90deg);
  transform-origin: center;
  transition: stroke-dashoffset 250ms linear;
}

.waiting {
  stroke: #b0b0b0;
  animation: ring-spin 1.6s linear infinite;
  transform-origin: center;
}

@media (prefers-reduced-motion: reduce) {
  .progress {
    transition: none;
  }

  .waiting {
    animation: none;
  }
}

@keyframes ring-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
