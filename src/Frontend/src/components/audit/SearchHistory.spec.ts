import { beforeEach, describe, expect, test, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/vue";
import { createTestingPinia } from "@pinia/testing";
import SearchHistory from "@/components/audit/SearchHistory.vue";
import { useAuditStore } from "@/stores/AuditStore";

function renderHistory(entries: { search: string; endpoint: string; from?: string; to?: string; at: string }[]) {
  const pinia = createTestingPinia({ createSpy: vi.fn, initialState: { AuditStore: { searchHistory: entries } } });
  render(SearchHistory, { global: { plugins: [pinia] } });
  return useAuditStore(pinia);
}

const openHistory = () => fireEvent.click(screen.getByRole("button", { name: "Search history" }));

describe("FEATURE: Search history dropdown", () => {
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

  test("EXAMPLE: An empty history explains itself", async () => {
    renderHistory([]);

    await openHistory();

    expect(screen.getByText(/No searches yet/)).toBeInTheDocument();
  });

  test("EXAMPLE: Clear history goes through the store", async () => {
    const store = renderHistory([{ search: "orders", endpoint: "", at: new Date().toISOString() }]);

    await openHistory();
    await fireEvent.click(screen.getByText("Clear history"));

    expect(store.clearSearchHistory).toHaveBeenCalled();
  });
});
