import { beforeEach, describe, expect, test, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/vue";
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

  test("EXAMPLE: Entries show the time range they ran with", async () => {
    renderHistory([{ search: "orders", endpoint: "", from: "now-1h", to: "now", at: new Date().toISOString() }]);

    await openHistory();

    expect(screen.getByText("now-1h → now")).toBeInTheDocument();
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
});
