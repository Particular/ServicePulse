import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/vue";
import AutoRefreshIndicator from "@/components/AutoRefreshIndicator.vue";

describe("FEATURE: Auto refresh indicator", () => {
  test("EXAMPLE: Nothing is rendered while auto refresh is off", () => {
    render(AutoRefreshIndicator, { props: { nextRefreshAt: null, intervalMs: 5000, refreshing: false } });

    expect(screen.queryByTestId("auto-refresh-indicator")).not.toBeInTheDocument();
  });

  test("EXAMPLE: A countdown bar is shown while waiting for the next refresh", () => {
    render(AutoRefreshIndicator, { props: { nextRefreshAt: Date.now() + 2500, intervalMs: 5000, refreshing: false } });

    expect(screen.getByTestId("auto-refresh-indicator")).toBeInTheDocument();
    const bar = screen.getByTestId("auto-refresh-countdown");
    const width = parseFloat(bar.style.width);
    expect(width).toBeGreaterThan(25);
    expect(width).toBeLessThan(75);
  });

  test("EXAMPLE: A waiting state is shown when the refresh is due but the query is still running", () => {
    render(AutoRefreshIndicator, { props: { nextRefreshAt: Date.now(), intervalMs: 5000, refreshing: true } });

    expect(screen.getByTestId("auto-refresh-waiting")).toBeInTheDocument();
    expect(screen.queryByTestId("auto-refresh-countdown")).not.toBeInTheDocument();
  });
});
