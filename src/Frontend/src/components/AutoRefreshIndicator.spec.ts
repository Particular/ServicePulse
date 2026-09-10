import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/vue";
import AutoRefreshIndicator from "@/components/AutoRefreshIndicator.vue";

describe("FEATURE: Auto refresh indicator", () => {
  test("EXAMPLE: Nothing is rendered while auto refresh is off", () => {
    render(AutoRefreshIndicator, { props: { nextRefreshAt: null, intervalMs: 5000, refreshing: false } });

    expect(screen.queryByTestId("auto-refresh-indicator")).not.toBeInTheDocument();
  });

  test("EXAMPLE: A countdown ring is shown while waiting for the next refresh", () => {
    render(AutoRefreshIndicator, { props: { nextRefreshAt: Date.now() + 2500, intervalMs: 5000, refreshing: false } });

    const indicator = screen.getByTestId("auto-refresh-indicator");
    expect(indicator.dataset.state).toBe("countdown");
    const ring = screen.getByTestId("auto-refresh-countdown");
    // roughly half depleted: dash offset strictly between empty (0) and full circumference
    const offset = parseFloat(ring.getAttribute("stroke-dashoffset")!);
    const circumference = 2 * Math.PI * 6;
    expect(offset).toBeGreaterThan(circumference * 0.25);
    expect(offset).toBeLessThan(circumference * 0.75);
  });

  test("EXAMPLE: A waiting spinner ring is shown when the refresh is due but the query is still running", () => {
    render(AutoRefreshIndicator, { props: { nextRefreshAt: Date.now(), intervalMs: 5000, refreshing: true } });

    expect(screen.getByTestId("auto-refresh-indicator").dataset.state).toBe("waiting");
    expect(screen.getByTestId("auto-refresh-waiting")).toBeInTheDocument();
    expect(screen.queryByTestId("auto-refresh-countdown")).not.toBeInTheDocument();
  });
});
