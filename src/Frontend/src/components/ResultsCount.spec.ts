import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/vue";
import ResultsCount from "@/components/ResultsCount.vue";

describe("FEATURE: Results count", () => {
  test("EXAMPLE: Large counts are formatted in the user's locale", () => {
    render(ResultsCount, { props: { displayed: 100, total: 158736340 } });

    const expected = `Showing ${(100).toLocaleString()} of ${(158736340).toLocaleString()} result(s)`;
    expect(screen.getByText(expected)).toBeInTheDocument();
  });

  test("EXAMPLE: Zero results render plainly", () => {
    render(ResultsCount, { props: { displayed: 0, total: 0 } });

    expect(screen.getByText("Showing 0 of 0 result(s)")).toBeInTheDocument();
  });
});
