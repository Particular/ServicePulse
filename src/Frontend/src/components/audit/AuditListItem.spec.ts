import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/vue";
import { createMemoryHistory, createRouter } from "vue-router";
import AuditListItem from "@/components/audit/AuditListItem.vue";
import { type default as Message, MessageStatus } from "@/resources/Message";

const NOW = new Date("2026-09-03T15:00:00");

function renderRow(timeSent: string) {
  const router = createRouter({ history: createMemoryHistory(), routes: [{ path: "/:pathMatch(.*)*", component: { template: "<div />" } }] });
  const message = {
    id: "id-1",
    message_id: "msg-1",
    message_type: "Sales.OrderPlaced",
    time_sent: timeSent,
    status: MessageStatus.Successful,
    processing_time: "00:00:00.012",
    critical_time: "00:00:00.123",
    delivery_time: "00:00:00.001",
  } as unknown as Message;
  render(AuditListItem, { props: { message }, global: { plugins: [router] } });
}

describe("FEATURE: Audit row layout", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("RULE: The age belongs to Time Sent, not to a column of its own", () => {
    test("EXAMPLE: The Time Sent cell carries the label, the absolute time and the age", () => {
      renderRow(new Date("2026-09-03T14:56:00").toISOString());

      const cell = document.querySelector(".time-sent")!;
      expect(cell.textContent).toContain("Time Sent:");
      expect(cell.querySelector('[data-testid="adaptive-absolute"]')).not.toBeNull();
      expect(cell.querySelector('[data-testid="adaptive-relative"]')!.textContent).toContain("4 minutes ago");
      expect(screen.getByText("4 minutes ago", { exact: false })).toBeInTheDocument();
    });

    test("EXAMPLE: The age hides below Bootstrap's lg breakpoint through its display utilities", () => {
      renderRow(new Date("2026-09-03T14:56:00").toISOString());

      const age = document.querySelector('[data-testid="adaptive-relative"]')!.closest(".d-none.d-lg-inline");
      expect(age).not.toBeNull();
      // the separator hides together with the age
      expect(age!.textContent).toContain("·");
    });

    test("EXAMPLE: There is no separate age cell", () => {
      renderRow(new Date("2026-09-03T14:56:00").toISOString());

      // the age is text inside the Time Sent cell, not a grid cell of the row
      expect(document.querySelector(".item > .age")).toBeNull();
    });
  });
});
