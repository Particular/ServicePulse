import { render, screen } from "@testing-library/vue";
import { describe, expect, test } from "vitest";
import TimeoutStatusBadge from "./TimeoutStatusBadge.vue";
import type { SagaTimeoutView } from "@/resources/SagaTimeout";

function renderBadge(overrides: Partial<SagaTimeoutView>) {
  const timeout = {
    status: "Pending",
    is_overdue: false,
    last_change_kind: "Requested",
    last_change_source: "Saga",
    pending_operation: null,
    ...overrides,
  } as SagaTimeoutView;
  return render(TimeoutStatusBadge, { props: { timeout } });
}

describe("TimeoutStatusBadge", () => {
  test.each([
    [{}, "Pending"],
    [{ is_overdue: true }, "Overdue"],
    [{ last_change_kind: "Rescheduled", last_change_source: "Operator" }, "Rescheduled by operator"],
    [{ status: "Triggered" }, "Triggered"],
    [{ status: "Canceled" }, "Canceled"],
    [{ status: "Unknown" }, "Unknown"],
  ] as [Partial<SagaTimeoutView>, string][])("shows %o as %s", (overrides, expected) => {
    renderBadge(overrides);
    expect(screen.getByLabelText("timeout-status")).toHaveTextContent(expected);
    expect(screen.queryByLabelText("change-requested")).toBeNull();
  });

  test("shows that a change was requested while an operation is pending", () => {
    renderBadge({ pending_operation: { operation_id: "op", change: "Reschedule", requested_at: "2026-10-13T09:00:00Z", requested_due_time: null } });
    expect(screen.getByLabelText("change-requested")).toHaveTextContent("change requested");
  });
});
