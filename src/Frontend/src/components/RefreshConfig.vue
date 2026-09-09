<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useId, watch } from "vue";
import ActionButton from "@/components/ActionButton.vue";
import AutoRefreshIndicator from "@/components/AutoRefreshIndicator.vue";
import { abbreviateInterval, refreshIntervalOptions } from "@/components/refreshInterval";
import { faRefresh, faXmark } from "@fortawesome/free-solid-svg-icons";

const props = defineProps<{ queryInProgress: boolean; nextRefreshAt?: number | null }>();
const model = defineModel<number | null>({ required: true });
const emit = defineEmits<{ (e: "manualRefresh"): Promise<void>; (e: "cancelQuery"): void }>();

// The interval lives in the button as a short label ("5s", "1m", "Off"), the way Grafana
// shows it; the menu spells each option out
const currentOption = computed(() => refreshIntervalOptions.find((option) => option.ms === (model.value ?? 0)) ?? { ms: model.value ?? 0, short: abbreviateInterval(model.value), long: abbreviateInterval(model.value) });

function selectInterval(ms: number) {
  model.value = ms === 0 ? null : ms;
}

// While auto-refresh is armed and no query runs, the countdown ring takes the
// place of the refresh arrow inside the button
const ringActive = computed(() => !props.queryInProgress && props.nextRefreshAt != null && model.value != null);

/* clock for the countdown text, ticking only while the ring is showing */
const now = ref(Date.now());
let ticker: number | undefined;
watch(
  ringActive,
  (active) => {
    window.clearInterval(ticker);
    if (active) {
      now.value = Date.now();
      ticker = window.setInterval(() => (now.value = Date.now()), 250);
    }
  },
  { immediate: true }
);
onBeforeUnmount(() => window.clearInterval(ticker));

// The ring is visual only; the countdown reaches assistive tech as text that describes
// the button (a timer is not announced on every tick, but is read along with the button)
const countdownId = useId();
const secondsLeft = computed(() => (props.nextRefreshAt == null ? 0 : Math.max(0, Math.ceil((props.nextRefreshAt - now.value) / 1000))));

async function refreshOrCancel() {
  if (props.queryInProgress) {
    emit("cancelQuery");
    return;
  }
  await emit("manualRefresh");
}
</script>

<template>
  <div class="refresh-config">
    <div class="btn-group refresh-group" role="group" aria-label="Refresh">
      <ActionButton
        size="sm"
        class="refresh-action"
        :icon="props.queryInProgress ? faXmark : ringActive ? undefined : faRefresh"
        :loading="props.queryInProgress"
        :disable-on-loading="false"
        :aria-describedby="ringActive ? countdownId : undefined"
        @click="refreshOrCancel"
      >
        <template v-if="ringActive && !props.queryInProgress" #icon>
          <AutoRefreshIndicator class="ring" :next-refresh-at="props.nextRefreshAt ?? null" :interval-ms="model" :refreshing="false" />
        </template>
        <template v-if="props.queryInProgress">Cancel</template>
        <template v-else>Refresh</template>
      </ActionButton>
      <div class="btn-group" role="group">
        <button
          type="button"
          class="btn btn-default btn-sm dropdown-toggle interval-toggle"
          data-bs-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="false"
          :aria-label="`Auto-refresh: ${currentOption.long}`"
          :title="`Auto-refresh: ${currentOption.long}`"
          data-testid="refresh-interval"
        >
          {{ currentOption.short }}
        </button>
        <ul class="dropdown-menu dropdown-menu-end interval-menu">
          <li v-for="option in refreshIntervalOptions" :key="option.ms">
            <button type="button" class="dropdown-item" :class="{ active: option.ms === (model ?? 0) }" @click="selectInterval(option.ms)">
              <span class="short">{{ option.short }}</span>
              <span class="long">{{ option.long }}</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
    <span v-if="ringActive" :id="countdownId" class="visually-hidden" role="timer">Next auto refresh in {{ secondsLeft }} {{ secondsLeft === 1 ? "second" : "seconds" }}</span>
  </div>
</template>

<style scoped>
.refresh-config {
  display: flex;
  align-items: center;
}

/* One width for "Refresh" and "Cancel", so the group does not jump between states.
   No clock in the label: how long a query has run is advice on the results line, not a
   number in a button */
.refresh-action {
  width: 7rem;
  justify-content: center;
}

.interval-toggle {
  min-width: 3.4em;
  font-variant-numeric: tabular-nums;
}

.interval-menu {
  min-width: 11rem;
}

.interval-menu .dropdown-item {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  font-size: 0.875rem;
}

.interval-menu .short {
  font-variant-numeric: tabular-nums;
  min-width: 2.5em;
}

.interval-menu .long {
  color: var(--reduced-emphasis);
}

.interval-menu .dropdown-item.active,
.interval-menu .dropdown-item.active .long {
  color: #fff;
}

.ring {
  /* the icon slot is a flex child; only the FA icon's own margin needs matching */
  margin-right: 0.25rem;
}
</style>
