import { beforeEach, describe, expect, test } from "vitest";
import { clearSearchHistory, loadSearchHistory, recordSearch, searchHistoryLimit } from "@/components/audit/searchHistory";

const at = (iso: string) => () => new Date(iso);
const last6h = { from: "now-6h", to: "now" };
const lastHour = { from: "now-1h", to: "now" };

describe("FEATURE: Audit search history", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("EXAMPLE: The most recent search is listed first", () => {
    recordSearch("orders", "", last6h, at("2026-09-03T10:00:00Z"));
    recordSearch("", "Sales.Endpoint", last6h, at("2026-09-03T11:00:00Z"));

    const history = loadSearchHistory();
    expect(history.map((e) => e.search)).toEqual(["", "orders"]);
    expect(history[0].endpoint).toBe("Sales.Endpoint");
  });

  test("EXAMPLE: The time range the search ran with is captured", () => {
    recordSearch("orders", "", lastHour, at("2026-09-03T10:00:00Z"));

    expect(loadSearchHistory()[0]).toMatchObject({ search: "orders", from: "now-1h", to: "now" });
  });

  test("EXAMPLE: Re-running a search bumps it to the front instead of duplicating", () => {
    recordSearch("orders", "", last6h, at("2026-09-03T10:00:00Z"));
    recordSearch("invoices", "", last6h, at("2026-09-03T11:00:00Z"));
    const history = recordSearch("orders", "", last6h, at("2026-09-03T12:00:00Z"));

    expect(history).toHaveLength(2);
    expect(history[0]).toMatchObject({ search: "orders", at: "2026-09-03T12:00:00.000Z" });
  });

  test("EXAMPLE: The same text on a different endpoint is a different search", () => {
    recordSearch("orders", "A", last6h, at("2026-09-03T10:00:00Z"));
    const history = recordSearch("orders", "B", last6h, at("2026-09-03T11:00:00Z"));

    expect(history).toHaveLength(2);
  });

  test("EXAMPLE: The same text over a different time range is a different search", () => {
    recordSearch("orders", "", last6h, at("2026-09-03T10:00:00Z"));
    const history = recordSearch("orders", "", lastHour, at("2026-09-03T11:00:00Z"));

    expect(history).toHaveLength(2);
    expect(history[0].from).toBe("now-1h");
  });

  test("EXAMPLE: Entries recorded before ranges were captured still load", () => {
    localStorage.setItem("audit.searchHistory", JSON.stringify([{ search: "orders", endpoint: "", at: "2026-09-03T10:00:00.000Z" }]));

    const history = loadSearchHistory();
    expect(history).toHaveLength(1);
    expect(history[0].from).toBeUndefined();
  });

  test("EXAMPLE: The least recently used entry falls off when the list is full", () => {
    for (let i = 0; i < searchHistoryLimit + 1; i++) {
      recordSearch(`term-${i}`, "", last6h, at(`2026-09-03T10:${String(i).padStart(2, "0")}:00Z`));
    }

    const history = loadSearchHistory();
    expect(history).toHaveLength(searchHistoryLimit);
    expect(history.some((e) => e.search === "term-0")).toBe(false);
    expect(history[0].search).toBe(`term-${searchHistoryLimit}`);
  });

  test("EXAMPLE: Queries without search text or endpoint are not recorded", () => {
    recordSearch("  ", "", last6h, at("2026-09-03T10:00:00Z"));

    expect(loadSearchHistory()).toHaveLength(0);
  });

  test("EXAMPLE: Corrupt storage yields an empty history", () => {
    localStorage.setItem("audit.searchHistory", "{nonsense");

    expect(loadSearchHistory()).toEqual([]);
  });

  test("EXAMPLE: Clearing empties the history", () => {
    recordSearch("orders", "", last6h, at("2026-09-03T10:00:00Z"));

    expect(clearSearchHistory()).toEqual([]);
    expect(loadSearchHistory()).toEqual([]);
  });
});
