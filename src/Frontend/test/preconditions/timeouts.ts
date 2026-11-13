import type { SetupFactoryOptions } from "../driver";
import type { SagaTimeoutDetails, SagaTimeoutHistoryEntry, SagaTimeoutOperatorChange, SagaTimeoutView } from "@/resources/SagaTimeout";

const OverdueGracePeriodMs = 60_000;

type StoredTimeout = Omit<SagaTimeoutDetails, "is_overdue">;

const minutes = (n: number) => n * 60_000;
const iso = (offsetMs: number, now = Date.now()) => new Date(now + offsetMs).toISOString();

interface TimeoutSeed {
  endpoint: string;
  sagaType: string;
  timeoutType: string;
  correlation: string;
  host: string;
  dueInMs: number;
  payload: string;
  status?: SagaTimeoutDetails["status"];
  sagaId?: string;
  rescheduledByOperator?: boolean;
  payloadUpdated?: boolean;
  pendingOperation?: { change: SagaTimeoutOperatorChange; ageMs: number };
}

export function createTimeout(seed: TimeoutSeed, now = Date.now()): StoredTimeout {
  const timeoutId = crypto.randomUUID();
  const requestedAt = iso(-minutes(30), now);
  const initialDue = seed.rescheduledByOperator ? iso(seed.dueInMs - minutes(45), now) : iso(seed.dueInMs, now);
  const history: SagaTimeoutHistoryEntry[] = [
    {
      kind: "Requested",
      version: 1,
      trigger_id: crypto.randomUUID(),
      due_time: initialDue,
      changed_at: requestedAt,
      received_at: requestedAt,
      source: "Saga",
      operation_id: null,
      requested_change: null,
      requested_due_time: null,
      reason: null,
      host: seed.host,
    },
  ];
  if (seed.payloadUpdated) {
    history.push({ ...history[0], kind: "Rescheduled", version: 2, trigger_id: crypto.randomUUID(), changed_at: iso(-minutes(27), now), received_at: iso(-minutes(27), now) });
  }
  if (seed.rescheduledByOperator) {
    const operationId = crypto.randomUUID();
    history.push({
      ...history[history.length - 1],
      kind: "Rescheduled",
      version: history.length + 1,
      trigger_id: crypto.randomUUID(),
      due_time: iso(seed.dueInMs, now),
      changed_at: iso(-minutes(10), now),
      received_at: iso(-minutes(10), now),
      source: "Operator",
      operation_id: operationId,
      requested_change: "Reschedule",
      requested_due_time: iso(seed.dueInMs, now),
    });
  }
  if (seed.status === "Triggered" || seed.status === "Canceled") {
    history.push({ ...history[history.length - 1], kind: seed.status, version: history.length + 1, changed_at: iso(-minutes(1), now), received_at: iso(-minutes(1), now) });
  }
  const last = history[history.length - 1];

  return {
    timeout_id: timeoutId,
    endpoint_name: seed.endpoint,
    saga_type: seed.sagaType,
    saga_id: seed.sagaId ?? crypto.randomUUID(),
    correlation_value: seed.correlation,
    timeout_type: seed.timeoutType,
    version: last.version,
    trigger_id: last.trigger_id,
    due_time: last.due_time,
    status: seed.status ?? "Pending",
    requested_at: requestedAt,
    last_change_kind: last.kind,
    last_change_source: last.source,
    last_changed_at: last.changed_at,
    host: seed.host,
    management_address: `${seed.endpoint}.SagaTimeoutManagement@${seed.host}`,
    pending_operation: seed.pendingOperation
      ? { operation_id: crypto.randomUUID(), change: seed.pendingOperation.change, requested_at: iso(-seed.pendingOperation.ageMs, now), requested_due_time: seed.pendingOperation.change === "Reschedule" ? iso(minutes(120), now) : null }
      : null,
    payload_content_type: "application/json",
    payload: seed.payload,
    history_truncated: false,
    history,
  };
}

const sagaDefinitions = [
  { endpoint: "Sales", sagaType: "Sales.Sagas.OrderPolicy, Sales", timeoutType: "Sales.Sagas.BuyersRemorseTimeout, Sales", prefix: "order", host: "SALES-01" },
  { endpoint: "Billing", sagaType: "Billing.Sagas.InvoicePolicy, Billing", timeoutType: "Billing.Sagas.PaymentReminderTimeout, Billing", prefix: "invoice", host: "BILLING-02" },
  { endpoint: "Shipping", sagaType: "Shipping.Sagas.ShipmentPolicy, Shipping", timeoutType: "Shipping.Sagas.ShipmentDelayedTimeout, Shipping", prefix: "shipment", host: "SHIP-01" },
];

export function generateTimeouts(count = 60, now = Date.now()): StoredTimeout[] {
  const result: StoredTimeout[] = [];
  for (let i = 0; i < count; i++) {
    const definition = sagaDefinitions[i % sagaDefinitions.length];
    const correlation = `${definition.prefix}-${48213 + i}`;
    result.push(
      createTimeout(
        {
          endpoint: definition.endpoint,
          sagaType: definition.sagaType,
          timeoutType: definition.timeoutType,
          correlation,
          host: definition.host,
          dueInMs: minutes(12 + i * 47),
          payload: JSON.stringify({ orderId: correlation, customerId: `customer-${1100 + i}`, remorseWindowMinutes: 30 }),
          rescheduledByOperator: i % 7 === 1,
          payloadUpdated: i % 5 === 3,
        },
        now
      )
    );
  }

  const sales = sagaDefinitions[0];
  const sharedSagaId = result[0].saga_id;
  result.push(
    createTimeout({ endpoint: sales.endpoint, sagaType: sales.sagaType, timeoutType: "Sales.Sagas.OrderExpiredTimeout, Sales", correlation: "order-48213", host: sales.host, dueInMs: minutes(60 * 24), payload: "{}", sagaId: sharedSagaId }, now),
    createTimeout({ endpoint: sales.endpoint, sagaType: sales.sagaType, timeoutType: sales.timeoutType, correlation: "order-47001", host: sales.host, dueInMs: -minutes(15), payload: '{"orderId":"order-47001"}' }, now),
    createTimeout({ endpoint: "Billing", sagaType: sagaDefinitions[1].sagaType, timeoutType: sagaDefinitions[1].timeoutType, correlation: "invoice-9001", host: "BILLING-01", dueInMs: -minutes(90), payload: "not json: legacy payload" }, now),
    createTimeout(
      {
        endpoint: "Shipping",
        sagaType: sagaDefinitions[2].sagaType,
        timeoutType: sagaDefinitions[2].timeoutType,
        correlation: "shipment-7001",
        host: "SHIP-01",
        dueInMs: minutes(300),
        payload: "{}",
        pendingOperation: { change: "Reschedule", ageMs: minutes(25) },
      },
      now
    ),
    createTimeout({ endpoint: "Legacy", sagaType: "Legacy.Sagas.ImportPolicy, Legacy", timeoutType: "Legacy.Sagas.ImportTimeout, Legacy", correlation: "import-1", host: "OLD-01", dueInMs: -minutes(600), payload: "{}", status: "Unknown" }, now),
    createTimeout({ endpoint: sales.endpoint, sagaType: sales.sagaType, timeoutType: sales.timeoutType, correlation: "order-40000", host: sales.host, dueInMs: -minutes(5), payload: "{}", status: "Triggered" }, now),
    createTimeout({ endpoint: "Billing", sagaType: sagaDefinitions[1].sagaType, timeoutType: sagaDefinitions[1].timeoutType, correlation: "invoice-8000", host: "BILLING-02", dueInMs: minutes(50), payload: "{}", status: "Canceled" }, now)
  );
  return result;
}

function toView(timeout: StoredTimeout, now = Date.now()): SagaTimeoutDetails {
  return { ...timeout, is_overdue: timeout.status === "Pending" && new Date(timeout.due_time).getTime() < now - OverdueGracePeriodMs };
}

function toListView(timeout: StoredTimeout): SagaTimeoutView {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { payload, payload_content_type, history, history_truncated, ...view } = toView(timeout);
  return view;
}

const sortSelectors: Record<string, (t: SagaTimeoutView) => string> = {
  due_time: (t) => t.due_time,
  last_changed_at: (t) => t.last_changed_at,
  endpoint: (t) => t.endpoint_name,
  saga_type: (t) => t.saga_type,
  timeout_type: (t) => t.timeout_type,
};

export interface TimeoutsMockOptions {
  /** Delay before the simulated endpoint applies a requested change. Null leaves the operation pending. */
  endpointResponseDelayMs?: number | null;
}

/**
 * Serves the timeout API from an in-memory list. Actions behave like a live endpoint: the request becomes a pending
 * operation and, after a delay, the change is applied and recorded in the history.
 */
export const hasSagaTimeouts =
  (timeouts: StoredTimeout[] = generateTimeouts(), { endpointResponseDelayMs = 3000 }: TimeoutsMockOptions = {}) =>
  ({ driver }: SetupFactoryOptions) => {
    const serviceControlInstanceUrl = window.defaultConfig.service_control_url;
    const find = (id: unknown) => timeouts.find((t) => t.timeout_id === id);

    driver.mockEndpointDynamic(`${serviceControlInstanceUrl}timeouts`, "get", (url) => {
      const status = url.searchParams.get("status") ?? "pending";
      const endpoint = url.searchParams.get("endpoint");
      const sagaType = url.searchParams.get("saga_type");
      const sagaId = url.searchParams.get("saga_id");
      const q = url.searchParams.get("q")?.toLowerCase();
      const page = parseInt(url.searchParams.get("page") ?? "1");
      const perPage = parseInt(url.searchParams.get("per_page") ?? "50");
      const sort = sortSelectors[url.searchParams.get("sort") ?? "due_time"] ?? sortSelectors.due_time;
      const direction = url.searchParams.get("direction") === "desc" ? -1 : 1;

      const filtered = timeouts
        .map(toListView)
        .filter((t) => (status === "pending" ? t.status === "Pending" : status === "overdue" ? t.is_overdue : true))
        .filter((t) => !endpoint || t.endpoint_name === endpoint)
        .filter((t) => !sagaType || t.saga_type === sagaType || t.saga_type.startsWith(`${sagaType},`))
        .filter((t) => !sagaId || t.saga_id === sagaId)
        .filter((t) => !q || [t.saga_type, t.correlation_value ?? "", find(t.timeout_id)?.payload ?? ""].some((v) => v.toLowerCase().includes(q)))
        .sort((a, b) => sort(a).localeCompare(sort(b)) * direction);

      return Promise.resolve({ body: filtered.slice((page - 1) * perPage, page * perPage), headers: { "Total-Count": filtered.length.toString() } });
    });

    driver.mockEndpointDynamic(`${serviceControlInstanceUrl}timeouts/:timeoutId`, "get", (_url, params) => {
      const timeout = find(params.timeoutId);
      return Promise.resolve(timeout ? { body: toView(timeout) } : { body: { detail: "Not found" }, status: 404 });
    });

    driver.mockEndpointDynamic(`${serviceControlInstanceUrl}timeouts/counts`, "get", () => {
      const views = timeouts.map((t) => toView(t));
      return Promise.resolve({ body: { pending: views.filter((t) => t.status === "Pending").length, overdue: views.filter((t) => t.is_overdue).length } });
    });

    driver.mockEndpointDynamic(`${serviceControlInstanceUrl}sagas/:sagaId/timeouts`, "get", (_url, params) => {
      return Promise.resolve({ body: timeouts.filter((t) => t.saga_id === params.sagaId).map(toListView) });
    });

    driver.mockEndpointDynamic(`${serviceControlInstanceUrl}timeouts/:timeoutId`, "delete", (_url, params) => {
      const index = timeouts.findIndex((t) => t.timeout_id === params.timeoutId);
      if (index < 0) return Promise.resolve({ body: { detail: "Not found" }, status: 404 });
      timeouts.splice(index, 1);
      // A 204 response cannot carry the JSON body that mockEndpointDynamic always writes.
      return Promise.resolve({ body: {}, status: 200 });
    });

    for (const [action, change] of [
      ["reschedule", "Reschedule"],
      ["trigger", "Trigger"],
      ["cancel", "Cancel"],
    ] as const) {
      driver.mockEndpointDynamic(`${serviceControlInstanceUrl}timeouts/:timeoutId/${action}`, "post", async (_url, params, request) => {
        const timeout = find(params.timeoutId);
        if (!timeout) return { body: { detail: "Not found" }, status: 404 };
        const body = (await request.json()) as { expected_version: number; due_time?: string; payload?: string | null };
        if (timeout.status !== "Pending") return { body: { detail: `The timeout is ${timeout.status}.` }, status: 422 };
        if (timeout.pending_operation) return { body: { detail: "Another operation is pending for this timeout." }, status: 409 };
        if (body.expected_version !== timeout.version) return { body: { detail: `Expected version ${body.expected_version}, but the timeout is at version ${timeout.version}.` }, status: 409 };

        const operationId = crypto.randomUUID();
        const requestedDueTime = change === "Reschedule" ? (body.due_time ?? null) : change === "Trigger" ? new Date().toISOString() : null;
        timeout.pending_operation = { operation_id: operationId, change, requested_at: new Date().toISOString(), requested_due_time: requestedDueTime };

        if (endpointResponseDelayMs !== null) {
          setTimeout(() => applyOperatorChange(timeout, change, operationId, requestedDueTime, body.payload ?? null), endpointResponseDelayMs);
        }
        return { body: { operation_id: operationId }, status: 202 };
      });
    }

    return timeouts;
  };

function applyOperatorChange(timeout: StoredTimeout, change: SagaTimeoutOperatorChange, operationId: string, requestedDueTime: string | null, payload: string | null) {
  const now = new Date().toISOString();
  const kind = change === "Cancel" ? "Canceled" : change === "Trigger" ? "Triggered" : "Rescheduled";
  const entry: SagaTimeoutHistoryEntry = {
    kind,
    version: timeout.version + 1,
    trigger_id: crypto.randomUUID(),
    due_time: requestedDueTime ?? timeout.due_time,
    changed_at: now,
    received_at: now,
    source: "Operator",
    operation_id: operationId,
    requested_change: change,
    requested_due_time: requestedDueTime,
    reason: null,
    host: timeout.host,
  };
  timeout.history.push(entry);
  timeout.version = entry.version;
  timeout.trigger_id = entry.trigger_id;
  timeout.due_time = entry.due_time;
  timeout.last_change_kind = kind;
  timeout.last_change_source = "Operator";
  timeout.last_changed_at = now;
  timeout.pending_operation = null;
  if (payload !== null) timeout.payload = payload;
  if (kind !== "Rescheduled") timeout.status = kind;
}
