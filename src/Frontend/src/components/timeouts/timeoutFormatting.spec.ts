import { describe, expect, test } from "vitest";
import type { SagaTimeoutHistoryEntry, SagaTimeoutView } from "@/resources/SagaTimeout";
import { canForget, escapeHtml, formatUtc, fullTypeName, historyEntryLabel, shortTypeName } from "./timeoutFormatting";

function entry(overrides: Partial<SagaTimeoutHistoryEntry>): SagaTimeoutHistoryEntry {
  return {
    kind: "Requested",
    version: 1,
    trigger_id: "t1",
    due_time: "2026-10-13T09:42:00Z",
    changed_at: "2026-10-13T09:12:00Z",
    received_at: "2026-10-13T09:12:01Z",
    source: "Saga",
    operation_id: null,
    requested_change: null,
    requested_due_time: null,
    reason: null,
    ...overrides,
  };
}

function view(overrides: Partial<SagaTimeoutView>): SagaTimeoutView {
  return {
    timeout_id: "id",
    endpoint_name: "Sales",
    saga_type: "Sales.Sagas.OrderPolicy, Sales",
    saga_id: "saga",
    correlation_value: "order-1",
    timeout_type: "Sales.Sagas.BuyersRemorseTimeout, Sales",
    version: 1,
    trigger_id: "t1",
    due_time: "2026-10-13T09:42:00Z",
    status: "Pending",
    is_overdue: false,
    requested_at: "2026-10-13T09:12:00Z",
    last_change_kind: "Requested",
    last_change_source: "Saga",
    last_changed_at: "2026-10-13T09:12:00Z",
    host: "SALES-01",
    management_address: "Sales",
    pending_operation: null,
    ...overrides,
  };
}

describe("timeout formatting", () => {
  test("type names drop the namespace and the assembly", () => {
    expect(shortTypeName("Sales.Sagas.OrderPolicy, Sales")).toBe("OrderPolicy");
    expect(fullTypeName("Sales.Sagas.OrderPolicy, Sales")).toBe("Sales.Sagas.OrderPolicy");
  });

  test("dates are shown in UTC", () => {
    expect(formatUtc("2026-10-13T09:42:05Z")).toBe("2026-10-13 09:42 UTC");
    expect(formatUtc("2026-10-13T09:42:05Z", true)).toBe("2026-10-13 09:42:05 UTC");
  });

  test("a reschedule that keeps the due time is labeled as a payload update", () => {
    const requested = entry({});
    expect(historyEntryLabel(entry({ kind: "Rescheduled", version: 2 }), requested)).toBe("Payload updated");
    expect(historyEntryLabel(entry({ kind: "Rescheduled", version: 2, due_time: "2026-10-14T09:42:00Z" }), requested)).toBe("Rescheduled");
    expect(historyEntryLabel(requested, undefined)).toBe("Requested");
  });

  test("forget is offered for unknown timeouts and unanswered operations only", () => {
    const now = Date.parse("2026-10-13T10:00:00Z");
    expect(canForget(view({}), now)).toBe(false);
    expect(canForget(view({ status: "Unknown" }), now)).toBe(true);
    const operation = { operation_id: "op", change: "Cancel" as const, requested_due_time: null };
    expect(canForget(view({ pending_operation: { ...operation, requested_at: "2026-10-13T09:55:00Z" } }), now)).toBe(false);
    expect(canForget(view({ pending_operation: { ...operation, requested_at: "2026-10-13T09:45:00Z" } }), now)).toBe(true);
  });

  test("HTML in server details is escaped", () => {
    expect(escapeHtml(`<b>"x" & 'y'</b>`)).toBe("&lt;b&gt;&quot;x&quot; &amp; &#39;y&#39;&lt;/b&gt;");
  });
});
