import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/vue";
import ResultsCount from "@/components/ResultsCount.vue";

describe("FEATURE: Results count", () => {
  test("EXAMPLE: Large counts are formatted in the user's locale", () => {
    render(ResultsCount, { props: { displayed: 100, total: 158736340 } });

    const expected = `Showing ${(100).toLocaleString()} of ${(158736340).toLocaleString()} result(s)`;
    expect(screen.getByText(expected)).toBeInTheDocument();
  });

  test("EXAMPLE: The query duration is shown when known", () => {
    render(ResultsCount, { props: { displayed: 100, total: 500, durationMs: 2700 } });

    const expected = `Showing ${(100).toLocaleString()} of ${(500).toLocaleString()} result(s) · took ${(2.7).toLocaleString(undefined, { maximumFractionDigits: 1 })} s`;
    expect(screen.getByText(expected)).toBeInTheDocument();
  });

  test("EXAMPLE: Sub-second queries show milliseconds", () => {
    render(ResultsCount, { props: { displayed: 10, total: 10, durationMs: 320 } });

    expect(screen.getByText("Showing 10 of 10 result(s) · took 320 ms")).toBeInTheDocument();
  });

  test("EXAMPLE: When the query ran is shown relatively with the timestamp as tooltip", () => {
    const completedAt = new Date(Date.now() - 3 * 60 * 1000).toISOString();
    render(ResultsCount, { props: { displayed: 10, total: 10, durationMs: 320, completedAt } });

    const ran = screen.getByTestId("ran-ago");
    expect(ran.textContent).toContain("minutes ago");
    expect(ran.getAttribute("title")).toContain("(UTC)");
  });

  test("EXAMPLE: Zero results render plainly", () => {
    render(ResultsCount, { props: { displayed: 0, total: 0 } });

    expect(screen.getByText("Showing 0 of 0 result(s)")).toBeInTheDocument();
  });
});
