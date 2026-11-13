import { acceptHMRUpdate, defineStore } from "pinia";
import { ref } from "vue";
import serviceControlClient from "@/components/serviceControlClient";
import { HttpError } from "@/utils/HttpError";
import type { SagaTimeoutDetails, SagaTimeoutView } from "@/resources/SagaTimeout";

export type TimeoutActionResult = { kind: "accepted"; operationId?: string } | { kind: "conflict"; detail: string } | { kind: "failed"; status: number; detail: string };

export const useTimeoutDetailsStore = defineStore("TimeoutDetailsStore", () => {
  const timeoutId = ref<string>();
  const details = ref<SagaTimeoutDetails | null>(null);
  const sagaTimeouts = ref<SagaTimeoutView[]>([]);
  const loading = ref(true);
  const notFound = ref(false);
  const loadError = ref(false);

  function setTimeoutId(id: string) {
    if (timeoutId.value === id) return;
    timeoutId.value = id;
    details.value = null;
    sagaTimeouts.value = [];
    loading.value = true;
    notFound.value = false;
    loadError.value = false;
  }

  async function refresh() {
    const id = timeoutId.value;
    if (!id) return;
    try {
      const [, data] = await serviceControlClient.fetchTypedFromServiceControl<SagaTimeoutDetails>(`timeouts/${encodeURIComponent(id)}`);
      if (id !== timeoutId.value) return;
      details.value = data;
      notFound.value = false;
      loadError.value = false;
      await refreshSagaTimeouts(data.saga_id);
    } catch (e) {
      if (id !== timeoutId.value) return;
      if (e instanceof HttpError && e.status === 404) {
        notFound.value = true;
        details.value = null;
      } else {
        loadError.value = true;
      }
    } finally {
      if (id === timeoutId.value) loading.value = false;
    }
  }

  async function refreshSagaTimeouts(sagaId: string) {
    try {
      const [, data] = await serviceControlClient.fetchTypedFromServiceControl<SagaTimeoutView[]>(`sagas/${encodeURIComponent(sagaId)}/timeouts`);
      sagaTimeouts.value = data;
    } catch {
      sagaTimeouts.value = [];
    }
  }

  async function toResult(response: Response): Promise<TimeoutActionResult> {
    let body: { operation_id?: string; detail?: string; title?: string } = {};
    try {
      body = await response.json();
    } catch {
      // Responses such as 204 have no body.
    }
    if (response.ok) return { kind: "accepted", operationId: body.operation_id };
    const detail = body.detail ?? body.title ?? response.statusText;
    if (response.status === 409) return { kind: "conflict", detail };
    return { kind: "failed", status: response.status, detail };
  }

  function actionUrl(action: string) {
    return `timeouts/${encodeURIComponent(timeoutId.value ?? "")}/${action}`;
  }

  async function reschedule(dueTime: string, payload: string | null) {
    const current = details.value!;
    const response = await serviceControlClient.postToServiceControl(actionUrl("reschedule"), {
      due_time: dueTime,
      expected_version: current.version,
      payload,
      payload_content_type: payload === null ? null : current.payload_content_type,
    });
    return toResult(response);
  }

  async function trigger() {
    const response = await serviceControlClient.postToServiceControl(actionUrl("trigger"), { expected_version: details.value!.version });
    return toResult(response);
  }

  async function cancel() {
    const response = await serviceControlClient.postToServiceControl(actionUrl("cancel"), { expected_version: details.value!.version });
    return toResult(response);
  }

  async function forget() {
    const response = await serviceControlClient.deleteFromServiceControl(`timeouts/${encodeURIComponent(timeoutId.value ?? "")}`);
    return toResult(response);
  }

  return { timeoutId, details, sagaTimeouts, loading, notFound, loadError, setTimeoutId, refresh, reschedule, trigger, cancel, forget };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTimeoutDetailsStore, import.meta.hot));
}

export type TimeoutDetailsStore = ReturnType<typeof useTimeoutDetailsStore>;
