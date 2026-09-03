import { afterEach, describe, expect, test } from "vitest";
import { nextTick } from "vue";
import { useTimestampZone } from "@/composables/timestampZone";

describe("FEATURE: Local/UTC timestamp zone preference", () => {
  afterEach(() => {
    useTimestampZone().zone.value = "local";
    localStorage.clear();
  });

  test("EXAMPLE: Toggling flips between local and UTC", () => {
    const { zone, toggle } = useTimestampZone();

    expect(zone.value).toBe("local");
    toggle();
    expect(zone.value).toBe("utc");
    toggle();
    expect(zone.value).toBe("local");
  });

  test("EXAMPLE: Every consumer sees the same choice", () => {
    const first = useTimestampZone();
    const second = useTimestampZone();

    first.toggle();

    expect(second.zone.value).toBe("utc");
  });

  test("EXAMPLE: The choice is persisted in this browser", async () => {
    const { toggle } = useTimestampZone();

    toggle();
    await nextTick();

    expect(localStorage.getItem("timestampZone")).toBe("utc");
  });
});
