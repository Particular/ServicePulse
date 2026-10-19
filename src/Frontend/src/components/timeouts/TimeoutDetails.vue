<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { TYPE } from "vue-toastification";
import dayjs from "@/utils/dayjs";
import routeLinks from "@/router/routeLinks";
import TimeSince from "@/components/TimeSince.vue";
import NoData from "@/components/NoData.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import ActionButton from "@/components/ActionButton.vue";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import PermissionGate from "@/components/PermissionGate.vue";
import TimeoutStatusBadge from "@/components/timeouts/TimeoutStatusBadge.vue";
import { useShowToast } from "@/composables/toast";
import { useAllowedRoutes } from "@/composables/useAllowedRoutes";
import { ApiRoutes } from "@/composables/apiRoutes";
import useTimeoutDetailsStoreAutoRefresh from "@/composables/useTimeoutDetailsStoreAutoRefresh";
import type { TimeoutActionResult } from "@/stores/TimeoutDetailsStore";
import { canForget, escapeHtml, formatUtc, fullTypeName, historyEntryLabel, isOperationUnanswered, shortTypeName, sourceText } from "./timeoutFormatting";

const POLLING_INTERVAL_NORMAL = 5000;
const POLLING_INTERVAL_FAST = 1000;
const FAST_POLLING_LIMIT_MS = 60_000;

const route = useRoute();
const router = useRouter();
const { autoRefresh, updateInterval } = useTimeoutDetailsStoreAutoRefresh;
const { store } = autoRefresh();
const { details, sagaTimeouts, loading, notFound, loadError } = storeToRefs(store);
const { canCall } = useAllowedRoutes();

const timeoutId = computed(() => route.params.timeoutId as string);
watch(
  timeoutId,
  (id, previousId) => {
    store.setTimeoutId(id);
    if (previousId) store.refresh();
  },
  { immediate: true }
);

const canReschedule = computed(() => canCall(ApiRoutes.rescheduleTimeout));
const canTrigger = computed(() => canCall(ApiRoutes.triggerTimeout));
const canCancel = computed(() => canCall(ApiRoutes.cancelTimeout));
const canForgetTimeout = computed(() => canCall(ApiRoutes.forgetTimeout));
const deniedReason = "You don't have permission to manage timeouts.";

const isTerminal = computed(() => details.value?.status === "Triggered" || details.value?.status === "Canceled");
const pendingOperation = computed(() => details.value?.pending_operation ?? null);
const actionInFlight = ref(false);
const actionsDisabled = computed(() => !details.value || details.value.status !== "Pending" || pendingOperation.value !== null || actionInFlight.value);
const showForget = computed(() => !!details.value && canForget(details.value));
const operationUnanswered = computed(() => !!details.value && isOperationUnanswered(details.value));

const prettyPayload = computed(() => {
  const payload = details.value?.payload ?? "";
  try {
    return JSON.stringify(JSON.parse(payload), null, 2);
  } catch {
    return payload;
  }
});

const history = computed(() => (details.value?.history ?? []).map((entry, index, all) => ({ entry, label: historyEntryLabel(entry, all[index - 1]) })));
const otherSagaTimeouts = computed(() => sagaTimeouts.value.filter((t) => t.timeout_id !== details.value?.timeout_id));

// Form state, reset whenever the displayed version changes so the inputs always start from what the page shows.
const dueTimeInput = ref("");
const editPayload = ref(false);
const payloadInput = ref("");
watch(
  () => [details.value?.timeout_id, details.value?.version],
  () => {
    if (!details.value) return;
    dueTimeInput.value = dayjs.utc(details.value.due_time).format("YYYY-MM-DDTHH:mm:ss");
    payloadInput.value = details.value.payload ?? "";
  },
  { immediate: true }
);
const payloadChanged = computed(() => editPayload.value && payloadInput.value !== (details.value?.payload ?? ""));
const dueTimeValid = computed(() => dueTimeInput.value !== "" && dayjs.utc(dueTimeInput.value).isValid());

// Fast polling after an action until the endpoint reports the change (or a rejection) and the pending operation clears.
let fastPollingStartedAt = 0;
let versionAtAction = 0;
let sawPendingOperation = false;
function startFastPolling() {
  fastPollingStartedAt = Date.now();
  versionAtAction = details.value?.version ?? 0;
  sawPendingOperation = false;
  updateInterval(POLLING_INTERVAL_FAST);
}
function stopFastPolling() {
  fastPollingStartedAt = 0;
  updateInterval(POLLING_INTERVAL_NORMAL);
}
watch(details, (current) => {
  if (!fastPollingStartedAt || !current) return;
  if (current.pending_operation) {
    sawPendingOperation = true;
  } else if (sawPendingOperation || current.version !== versionAtAction) {
    stopFastPolling();
    return;
  }
  if (Date.now() - fastPollingStartedAt > FAST_POLLING_LIMIT_MS) stopFastPolling();
});
onUnmounted(() => updateInterval(POLLING_INTERVAL_NORMAL));

async function runAction(name: string, action: () => Promise<TimeoutActionResult>) {
  actionInFlight.value = true;
  try {
    const result = await action();
    if (result.kind === "accepted") {
      useShowToast(TYPE.INFO, "Change requested", `${name} was sent to the endpoint.`);
      startFastPolling();
    } else if (result.kind === "conflict") {
      useShowToast(TYPE.WARNING, "Timeout changed", "The timeout changed before the action was applied. The page now shows the current version.");
    } else {
      useShowToast(TYPE.ERROR, `${name} failed`, escapeHtml(result.detail || `ServiceControl returned ${result.status}.`));
    }
  } catch {
    useShowToast(TYPE.ERROR, `${name} failed`, "ServiceControl could not be reached.");
  } finally {
    actionInFlight.value = false;
    await store.refresh();
  }
}

const rescheduleLabel = computed(() => (editPayload.value ? "Edit and reschedule" : "Reschedule"));

function reschedule() {
  const dueTime = dayjs.utc(dueTimeInput.value).toISOString();
  const payload = payloadChanged.value ? payloadInput.value : null;
  return runAction(rescheduleLabel.value, () => store.reschedule(dueTime, payload));
}

function trigger() {
  return runAction("Trigger", () => store.trigger());
}

const showCancelDialog = ref(false);
function confirmCancel() {
  showCancelDialog.value = false;
  return runAction("Cancel", () => store.cancel());
}

const showForgetDialog = ref(false);
async function confirmForget() {
  showForgetDialog.value = false;
  try {
    const result = await store.forget();
    if (result.kind === "accepted") {
      useShowToast(TYPE.SUCCESS, "Timeout forgotten", "ServiceControl no longer tracks this timeout.");
      await router.push(routeLinks.timeouts.root);
    } else {
      useShowToast(TYPE.ERROR, "Forget failed", escapeHtml(result.detail || "ServiceControl rejected the request."));
    }
  } catch {
    useShowToast(TYPE.ERROR, "Forget failed", "ServiceControl could not be reached.");
  }
}
</script>

<template>
  <div class="container timeout-details">
    <Teleport to="#modalDisplay">
      <ConfirmDialog v-if="showCancelDialog" heading="Cancel timeout" body="The endpoint removes the timeout and the saga never receives it. Do you want to cancel this timeout?" @cancel="showCancelDialog = false" @confirm="confirmCancel" />
      <ConfirmDialog
        v-if="showForgetDialog"
        heading="Forget timeout"
        body="ServiceControl deletes its record of this timeout and its history. The saga is not changed. Do you want to continue?"
        @cancel="showForgetDialog = false"
        @confirm="confirmForget"
      />
    </Teleport>

    <LoadingSpinner v-if="loading" />
    <NoData v-else-if="notFound" message="The timeout was not found. It may have been triggered and removed, or forgotten." role="note" aria-label="timeout-not-found">
      <p><RouterLink :to="routeLinks.timeouts.root">Back to timeouts</RouterLink></p>
    </NoData>
    <NoData v-else-if="loadError && !details" message="The timeout could not be loaded from ServiceControl." />
    <template v-else-if="details">
      <nav class="breadcrumbs" aria-label="breadcrumb">
        <RouterLink :to="routeLinks.timeouts.root">Timeouts</RouterLink>
        <span> / {{ details.endpoint_name }} / {{ shortTypeName(details.saga_type) }}</span>
        <span v-if="details.correlation_value"> / {{ details.correlation_value }}</span>
      </nav>
      <h1 class="title">
        <span :title="details.timeout_type">{{ shortTypeName(details.timeout_type) }}</span>
        <TimeoutStatusBadge :timeout="details" />
      </h1>

      <div class="row">
        <div class="col-lg-8">
          <section class="panel" aria-label="timeout-details">
            <h3>Details</h3>
            <dl class="details-grid">
              <dt>Timeout ID</dt>
              <dd class="mono">{{ details.timeout_id }}</dd>
              <dt>Endpoint</dt>
              <dd>{{ details.endpoint_name }}</dd>
              <dt>Saga type</dt>
              <dd class="mono">{{ details.saga_type }}</dd>
              <dt>Saga instance ID</dt>
              <dd class="mono">{{ details.saga_id }}</dd>
              <dt>Correlation value</dt>
              <dd class="mono">{{ details.correlation_value ?? "n/a" }}</dd>
              <dt>Due</dt>
              <dd>
                <strong>{{ formatUtc(details.due_time, true) }}</strong> (<TimeSince :date-utc="details.due_time" />)
              </dd>
              <dt>Requested</dt>
              <dd>
                {{ formatUtc(details.requested_at, true) }}<template v-if="details.host"> on {{ details.host }}</template>
                <span class="hint">time as seen by the endpoint</span>
              </dd>
              <dt>Current trigger message ID</dt>
              <dd class="mono">{{ details.trigger_id }}</dd>
              <dt>Version</dt>
              <dd aria-label="timeout-version">{{ details.version }}</dd>
            </dl>
          </section>

          <section class="panel" aria-label="timeout-payload">
            <h3>Payload</h3>
            <div class="secondary" v-if="details.payload_content_type">{{ details.payload_content_type }}</div>
            <pre class="payload">{{ prettyPayload }}</pre>
          </section>

          <section class="panel" aria-label="timeout-history">
            <h3>History</h3>
            <p v-if="details.history_truncated" class="secondary">Older history entries were removed.</p>
            <ol class="timeline">
              <li v-for="{ entry, label } in history" :key="`${entry.version}-${entry.kind}-${entry.changed_at}`" :class="`kind-${entry.kind.toLowerCase()}`" aria-label="timeout-history-entry">
                <div class="entry-title">
                  {{ label }} <span class="secondary">version {{ entry.version }}</span>
                </div>
                <div class="secondary">
                  {{ formatUtc(entry.changed_at, true) }} {{ sourceText(entry.source) }}<template v-if="entry.host"> ({{ entry.host }})</template>, due {{ formatUtc(entry.due_time, true) }}
                </div>
                <div v-if="entry.operation_id" class="secondary">
                  Operation {{ entry.operation_id }}<template v-if="entry.requested_change"> ({{ entry.requested_change }})</template>
                </div>
                <div v-if="entry.reason" class="text-danger">Rejected: {{ entry.reason }}</div>
              </li>
            </ol>
          </section>
        </div>

        <div class="col-lg-4">
          <section class="panel" aria-label="timeout-actions">
            <h3>Actions</h3>
            <template v-if="isTerminal">
              <p class="secondary" role="note">This timeout is {{ details.status.toLowerCase() }}. It can no longer be changed.</p>
            </template>
            <template v-else>
              <div class="alert alert-info" role="note">This page shows version {{ details.version }}. If the timeout changes before you apply an action, the action is rejected.</div>
              <div v-if="pendingOperation" class="alert alert-warning" role="status" aria-label="pending-operation">
                {{ pendingOperation.change }} requested at {{ formatUtc(pendingOperation.requested_at, true) }}, waiting for the endpoint.
                <template v-if="operationUnanswered"> No response from the endpoint.</template>
              </div>
              <label for="timeout-due-time" class="form-label">New due date and time (UTC)</label>
              <input id="timeout-due-time" v-model="dueTimeInput" type="datetime-local" step="1" class="form-control" :disabled="actionsDisabled" />
              <div class="payload-toggle">
                <label><input v-model="editPayload" type="checkbox" :disabled="actionsDisabled" /> Change payload</label>
              </div>
              <textarea v-if="editPayload" v-model="payloadInput" class="form-control payload-editor" rows="8" aria-label="New payload" :disabled="actionsDisabled"></textarea>
              <div class="action-buttons">
                <PermissionGate :allowed="canReschedule" :reason="deniedReason">
                  <ActionButton variant="primary" :aria-label="rescheduleLabel" :disabled="actionsDisabled || !dueTimeValid || !canReschedule" @click="reschedule">{{ rescheduleLabel }}</ActionButton>
                </PermissionGate>
                <PermissionGate :allowed="canTrigger" :reason="deniedReason">
                  <ActionButton aria-label="Trigger now" :disabled="actionsDisabled || !canTrigger" @click="trigger">Trigger now</ActionButton>
                </PermissionGate>
                <PermissionGate :allowed="canCancel" :reason="deniedReason">
                  <ActionButton variant="danger" aria-label="Cancel timeout" :disabled="actionsDisabled || !canCancel" @click="showCancelDialog = true">Cancel timeout</ActionButton>
                </PermissionGate>
              </div>
              <p class="secondary">"Trigger now" reschedules the timeout to the current time. It still goes through the endpoint's main input queue.</p>
            </template>
            <div v-if="showForget" class="forget">
              <PermissionGate :allowed="canForgetTimeout" :reason="deniedReason">
                <ActionButton variant="link" aria-label="Forget" :disabled="!canForgetTimeout" @click="showForgetDialog = true">Forget this timeout</ActionButton>
              </PermissionGate>
              <p class="secondary">Removes the record from ServiceControl only. Use it when the endpoint will never report this timeout again.</p>
            </div>
          </section>

          <section class="panel" aria-label="saga-timeouts">
            <h3>Other timeouts of this saga instance</h3>
            <p v-if="otherSagaTimeouts.length === 0" class="secondary">None</p>
            <ul v-else class="related">
              <li v-for="t in otherSagaTimeouts" :key="t.timeout_id">
                <RouterLink :to="routeLinks.timeouts.details.link(t.timeout_id)">{{ shortTypeName(t.timeout_type) }}</RouterLink>
                <span class="secondary"> due {{ formatUtc(t.due_time) }}</span>
                <TimeoutStatusBadge :timeout="t" />
              </li>
            </ul>
            <p class="secondary mono saga-type">{{ fullTypeName(details.saga_type) }}</p>
          </section>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.timeout-details {
  padding-top: 1rem;
}

.breadcrumbs {
  color: #6c757d;
  margin-bottom: 0.5rem;
}

.title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.75rem;
}

.title :deep(.badge) {
  font-size: 0.8rem;
}

.panel {
  background-color: #fff;
  padding: 1.25rem;
  margin-bottom: 1rem;
}

.panel h3 {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.details-grid {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 0.4rem 2rem;
  margin: 0;
}

.details-grid dt {
  font-weight: normal;
  color: #6c757d;
}

.details-grid dd {
  margin: 0;
  overflow-wrap: anywhere;
}

.mono {
  font-family: monospace;
  font-size: 13px;
}

.secondary {
  font-size: 13px;
  color: #6c757d;
}

.hint {
  margin-left: 0.5rem;
  padding: 0 0.4rem;
  font-size: 12px;
  background-color: #e8f4f8;
  color: #1b809e;
}

.payload {
  background-color: #222;
  color: #eee;
  padding: 1rem;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.timeline {
  list-style: none;
  padding-left: 1rem;
  border-left: 2px solid #ddd;
  margin-left: 0.5rem;
}

.timeline li {
  position: relative;
  padding-left: 0.75rem;
  margin-bottom: 1rem;
}

.timeline li::before {
  content: "";
  position: absolute;
  left: -1.45rem;
  top: 0.4rem;
  width: 0.7rem;
  height: 0.7rem;
  border-radius: 50%;
  background-color: #1b809e;
}

.timeline li.kind-rescheduled::before {
  background-color: #ef8a17;
}

.timeline li.kind-canceled::before,
.timeline li.kind-rejected::before {
  background-color: #ce4844;
}

.timeline li.kind-triggered::before {
  background-color: #00a65a;
}

.entry-title {
  font-weight: bold;
}

.payload-toggle {
  margin: 0.75rem 0 0.5rem;
}

.payload-editor {
  font-family: monospace;
  font-size: 13px;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0.75rem 0;
}

.forget {
  border-top: 1px solid #eee;
  margin-top: 1rem;
  padding-top: 0.75rem;
}

.related {
  list-style: none;
  padding: 0;
}

.related li {
  margin-bottom: 0.5rem;
}

.saga-type {
  margin-top: 0.5rem;
}
</style>
