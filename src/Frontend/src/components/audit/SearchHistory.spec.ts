import { beforeEach, describe, expect, test, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/vue";
import { nextTick } from "vue";
import { createTestingPinia } from "@pinia/testing";
import SearchHistory from "@/components/audit/SearchHistory.vue";
import { useAuditStore } from "@/stores/AuditStore";

function renderHistory(entries: { search: string; endpoint: string; from?: string; to?: string; at: string }[]) {
  const pinia = createTestingPinia({ createSpy: vi.fn, initialState: { AuditStore: { searchHistory: entries } } });
  // The history wraps the search field it belongs to
  render(SearchHistory, { global: { plugins: [pinia] }, slots: { default: '<input aria-label="Search messages" />' } });
  return useAuditStore(pinia);
}

const searchField = () => screen.getByLabelText("Search messages") as HTMLInputElement;
const openHistory = () => fireEvent.focusIn(searchField());
const panel = () => screen.queryByRole("listbox", { name: "Recent searches" });

describe("FEATURE: Search history panel under the search field", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("EXAMPLE: Entries list the search, the endpoint and when they ran", async () => {
    renderHistory([{ search: "orders", endpoint: "Sales.Endpoint", at: new Date().toISOString() }]);

    await openHistory();

    expect(screen.getByText("orders")).toBeInTheDocument();
    expect(screen.getByText("@ Sales.Endpoint")).toBeInTheDocument();
  });

  test("EXAMPLE: Entries show the time range they ran with, worded like the picker", async () => {
    renderHistory([
      { search: "orders", endpoint: "", from: "now-1h", to: "now", at: new Date().toISOString() },
      { search: "invoices", endpoint: "", from: "2026-09-01 08:00", to: "2026-09-01 12:00", at: new Date().toISOString() },
    ]);

    await openHistory();

    expect(screen.getByText("now-1h")).toBeInTheDocument();
    expect(screen.getByText("2026-09-01 08:00 to 2026-09-01 12:00")).toBeInTheDocument();
  });

  test("EXAMPLE: Clicking an entry reruns it, time range included", async () => {
    const store = renderHistory([{ search: "orders", endpoint: "Sales.Endpoint", from: "now-1h", to: "now", at: new Date().toISOString() }]);

    await openHistory();
    await fireEvent.click(screen.getByText("orders"));

    expect(store.messageFilterString).toBe("orders");
    expect(store.selectedEndpointName).toBe("Sales.Endpoint");
    expect(store.timeRangeFrom).toBe("now-1h");
    expect(store.timeRangeTo).toBe("now");
  });

  test("EXAMPLE: Rerunning an entry recorded before ranges were captured leaves the current range alone", async () => {
    const store = renderHistory([{ search: "orders", endpoint: "", at: new Date().toISOString() }]);
    store.timeRangeFrom = "now-6h";
    store.timeRangeTo = "now";

    await openHistory();
    await fireEvent.click(screen.getByText("orders"));

    expect(store.timeRangeFrom).toBe("now-6h");
    expect(store.timeRangeTo).toBe("now");
  });

  test("EXAMPLE: The panel opens when the search field receives focus and closes on Escape", async () => {
    renderHistory([{ search: "orders", endpoint: "", at: new Date().toISOString() }]);

    expect(panel()).not.toBeInTheDocument();

    await openHistory();
    expect(panel()).toBeInTheDocument();

    await fireEvent.keyDown(searchField(), { key: "Escape" });
    expect(panel()).not.toBeInTheDocument();
  });

  test("EXAMPLE: Clicking the search field re-opens the panel after it was dismissed", async () => {
    renderHistory([{ search: "orders", endpoint: "", at: new Date().toISOString() }]);

    await openHistory();
    await fireEvent.keyDown(searchField(), { key: "Escape" });
    await fireEvent.click(searchField());

    expect(panel()).toBeInTheDocument();
  });

  test("EXAMPLE: Typing narrows the panel to the searches that match", async () => {
    renderHistory([
      { search: "orders", endpoint: "", at: new Date().toISOString() },
      { search: "invoices", endpoint: "Billing", at: new Date().toISOString() },
    ]);

    await openHistory();
    await fireEvent.input(searchField(), { target: { value: "inv" } });

    expect(screen.queryByText("orders")).not.toBeInTheDocument();
    expect(screen.getByText("invoices")).toBeInTheDocument();

    await fireEvent.input(searchField(), { target: { value: "bill" } });
    expect(screen.getByText("invoices")).toBeInTheDocument();

    await fireEvent.input(searchField(), { target: { value: "zzz" } });
    expect(panel()).not.toBeInTheDocument();
  });

  test("EXAMPLE: An empty history shows no panel, even on focus", async () => {
    renderHistory([]);

    await openHistory();

    expect(panel()).not.toBeInTheDocument();
  });

  test("EXAMPLE: Clear history goes through the store", async () => {
    const store = renderHistory([{ search: "orders", endpoint: "", at: new Date().toISOString() }]);

    await openHistory();
    await fireEvent.click(screen.getByText("Clear history"));

    expect(store.clearSearchHistory).toHaveBeenCalled();
  });

  describe("RULE: The panel closes once the search is submitted, and typing brings it back", () => {
    test("EXAMPLE: The search reaching the store closes the panel", async () => {
      const store = renderHistory([{ search: "orders", endpoint: "", at: new Date().toISOString() }]);
      await openHistory();
      expect(panel()).toBeInTheDocument();

      // what the debounced search field does once the user pauses
      store.messageFilterString = "ord";
      await nextTick();

      expect(panel()).not.toBeInTheDocument();
    });

    test("EXAMPLE: Typing again after that reopens the panel", async () => {
      const store = renderHistory([{ search: "orders", endpoint: "", at: new Date().toISOString() }]);
      await openHistory();
      store.messageFilterString = "ord";
      await nextTick();

      await fireEvent.input(searchField(), { target: { value: "orde" } });

      expect(panel()).toBeInTheDocument();
    });

    test("EXAMPLE: Enter submits the search and closes the panel", async () => {
      renderHistory([{ search: "orders", endpoint: "", at: new Date().toISOString() }]);
      await openHistory();

      await fireEvent.keyDown(searchField(), { key: "Enter" });

      expect(panel()).not.toBeInTheDocument();
    });
  });

  describe("RULE: The panel is a combobox: arrows move, Enter picks, Tab and blur leave", () => {
    const entries = () => [
      { search: "orders", endpoint: "", at: new Date().toISOString() },
      { search: "invoices", endpoint: "Billing", at: new Date().toISOString() },
    ];

    test("EXAMPLE: Entries are not tab stops, and Tab closes the panel", async () => {
      renderHistory(entries());
      await openHistory();

      const options = screen.getAllByRole("option");
      expect(options.every((option) => option.getAttribute("tabindex") === "-1")).toBe(true);

      await fireEvent.keyDown(searchField(), { key: "Tab" });
      expect(panel()).not.toBeInTheDocument();
    });

    test("EXAMPLE: Arrow keys move a highlight and Enter reruns the highlighted entry", async () => {
      const store = renderHistory(entries());
      await openHistory();

      await fireEvent.keyDown(searchField(), { key: "ArrowDown" });
      await fireEvent.keyDown(searchField(), { key: "ArrowDown" });
      expect(screen.getAllByRole("option")[1]).toHaveAttribute("aria-selected", "true");

      await fireEvent.keyDown(searchField(), { key: "Enter" });

      expect(store.messageFilterString).toBe("invoices");
      expect(store.selectedEndpointName).toBe("Billing");
      expect(panel()).not.toBeInTheDocument();
    });

    test("EXAMPLE: Arrow Down opens a closed panel", async () => {
      renderHistory(entries());
      await openHistory();
      await fireEvent.keyDown(searchField(), { key: "Escape" });
      expect(panel()).not.toBeInTheDocument();

      await fireEvent.keyDown(searchField(), { key: "ArrowDown" });

      expect(panel()).toBeInTheDocument();
    });

    test("EXAMPLE: The field announces itself as a combobox that controls the list", async () => {
      renderHistory(entries());
      await openHistory();

      const field = searchField();
      expect(field).toHaveAttribute("role", "combobox");
      expect(field).toHaveAttribute("aria-expanded", "true");
      expect(field.getAttribute("aria-controls")).toBe(panel()!.id);

      await fireEvent.keyDown(field, { key: "ArrowDown" });
      expect(field.getAttribute("aria-activedescendant")).toBe(screen.getAllByRole("option")[0].id);
    });

    test("EXAMPLE: Focus leaving the field and the panel closes it", async () => {
      renderHistory(entries());
      const outside = document.createElement("button");
      document.body.appendChild(outside);
      await openHistory();

      await fireEvent.focusOut(searchField(), { relatedTarget: outside });

      expect(panel()).not.toBeInTheDocument();
      outside.remove();
    });
  });
});
