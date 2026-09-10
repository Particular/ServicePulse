import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/vue";
import AdaptiveTimestamp from "@/components/AdaptiveTimestamp.vue";
import { useTimestampZone } from "@/composables/timestampZone";

const NOW = new Date("2026-09-03T15:00:00");

function renderAt(date: Date) {
  cleanup();
  render(AdaptiveTimestamp, { props: { dateUtc: date.toISOString() } });
  return {
    absolute: screen.getByTestId("adaptive-absolute").textContent!,
    relative: screen.getByTestId("adaptive-relative").textContent!,
  };
}

describe("FEATURE: Age-adaptive timestamps", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
    useTimestampZone().zone.value = "local";
  });

  test("EXAMPLE: Today shows the time only", () => {
    const date = new Date("2026-09-03T13:00:00");
    const { absolute, relative } = renderAt(date);

    expect(absolute).toBe(date.toLocaleTimeString());
    expect(relative).toContain("2 hours ago");
  });

  test("EXAMPLE: Yesterday is labeled yesterday", () => {
    const date = new Date("2026-09-02T13:00:00");
    const { absolute, relative } = renderAt(date);

    expect(absolute).toBe(`yesterday ${date.toLocaleTimeString()}`);
    expect(relative).toContain("1 day ago");
  });

  test("EXAMPLE: Within the past week the weekday is named", () => {
    const date = new Date("2026-08-31T13:00:00"); // Monday
    const { absolute, relative } = renderAt(date);

    expect(absolute).toBe(`${date.toLocaleDateString(undefined, { weekday: "long" })} ${date.toLocaleTimeString()}`);
    expect(relative).toContain("3 days ago");
  });

  test("EXAMPLE: Older dates keep the regular browser format", () => {
    const date = new Date("2026-08-20T13:00:00");
    const { absolute, relative } = renderAt(date);

    expect(absolute).toBe(date.toLocaleString());
    expect(relative).toContain("2 weeks ago");
  });

  test("EXAMPLE: The part prop renders only one half, for split layouts", () => {
    cleanup();
    render(AdaptiveTimestamp, { props: { dateUtc: new Date("2026-09-03T13:00:00").toISOString(), part: "relative" } });
    expect(screen.queryByTestId("adaptive-absolute")).not.toBeInTheDocument();
    expect(screen.getByTestId("adaptive-relative").textContent).toBe("2 hours ago");

    cleanup();
    render(AdaptiveTimestamp, { props: { dateUtc: new Date("2026-09-03T13:00:00").toISOString(), part: "absolute" } });
    expect(screen.queryByTestId("adaptive-relative")).not.toBeInTheDocument();
    expect(screen.getByTestId("adaptive-absolute")).toBeInTheDocument();
  });

  test("EXAMPLE: In UTC mode the wall-clock time is UTC", () => {
    const { zone } = useTimestampZone();
    zone.value = "utc";

    const date = new Date("2026-09-03T13:00:00");
    const utcWall = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());

    // toContain: near the UTC midnight boundary the day prefix may differ from local mode
    expect(renderAt(date).absolute).toContain(utcWall.toLocaleTimeString());
  });

  test("EXAMPLE: The coarse relative label covers moments to years", () => {
    expect(renderAt(new Date("2026-09-03T14:59:50")).relative).toContain("moments ago");
    expect(renderAt(new Date("2026-09-03T14:30:00")).relative).toContain("30 minutes ago");
    expect(renderAt(new Date("2026-06-03T15:00:00")).relative).toContain("3 months ago");
    expect(renderAt(new Date("2024-09-03T15:00:00")).relative).toContain("2 years ago");
  });
});
