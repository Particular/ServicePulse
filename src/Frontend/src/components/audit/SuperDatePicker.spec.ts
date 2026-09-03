import { beforeEach, describe, expect, test, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/vue";
import { createTestingPinia } from "@pinia/testing";
import SuperDatePicker from "@/components/audit/SuperDatePicker.vue";
import { useAuditStore } from "@/stores/AuditStore";

function renderPicker(range?: { from: string; to: string }) {
  const pinia = createTestingPinia({ createSpy: vi.fn, initialState: range ? { AuditStore: { timeRangeFrom: range.from, timeRangeTo: range.to } } : undefined });
  render(SuperDatePicker, { global: { plugins: [pinia] } });
  return useAuditStore(pinia);
}

const chip = () => screen.getByRole("button", { name: /Time range/ }) as HTMLButtonElement;
const openPicker = () => fireEvent.click(chip());
const fromInput = () => screen.getByLabelText("Time range start") as HTMLInputElement;
const toInput = () => screen.getByLabelText("Time range end") as HTMLInputElement;
const applyButton = () => screen.getByRole("button", { name: "Apply time range" }) as HTMLButtonElement;
const nativePickers = () => document.querySelectorAll('input[type="date"]') as NodeListOf<HTMLInputElement>;
const calendarButton = (bound: "start" | "end") => screen.getByRole("button", { name: new RegExp(`calendar.*${bound}`, "i") }) as HTMLButtonElement;

describe("FEATURE: Super date picker", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("EXAMPLE: The collapsed chip shows the default range's preset label", () => {
    renderPicker();

    expect(chip().textContent).toContain("Last 6 hours");
  });

  test("EXAMPLE: Opening the picker shows the applied range in the editor", async () => {
    renderPicker();

    await openPicker();

    expect(fromInput().value).toBe("now-6h");
    expect(toInput().value).toBe("now");
  });

  test("EXAMPLE: Typing an RFC 3339 timestamp and applying commits it to the store", async () => {
    const store = renderPicker();

    await openPicker();
    await fireEvent.update(fromInput(), "2026-09-01 08:00:00Z");
    await fireEvent.click(applyButton());

    expect(store.timeRangeFrom).toBe("2026-09-01 08:00:00Z");
    expect(store.timeRangeTo).toBe("now");
  });

  test("EXAMPLE: Invalid input disables Apply and explains itself", async () => {
    renderPicker();

    await openPicker();
    await fireEvent.update(fromInput(), "next tuesday");

    expect(applyButton().disabled).toBe(true);
    expect(document.querySelector(".echo.bad")!.textContent).toContain("RFC 3339");
  });

  test("EXAMPLE: A valid range shows no diagnostics line, only an invalid one gets feedback", async () => {
    renderPicker();

    await openPicker();

    expect(document.querySelector(".echo")).toBeNull();
  });

  test("EXAMPLE: Pasting an ISO 8601 interval fills both bounds", async () => {
    renderPicker();

    await openPicker();
    const paste = new Event("paste", { bubbles: true, cancelable: true }) as ClipboardEvent;
    Object.defineProperty(paste, "clipboardData", {
      value: { getData: () => "2026-09-01T00:00:00Z/2026-09-01T12:00:00Z" },
    });
    fromInput().dispatchEvent(paste);
    await Promise.resolve();

    expect(fromInput().value).toBe("2026-09-01T00:00:00Z");
    expect(toInput().value).toBe("2026-09-01T12:00:00Z");
  });

  test("EXAMPLE: A quick preset applies immediately and the chip shows its label", async () => {
    const store = renderPicker();

    await openPicker();
    await fireEvent.click(screen.getByRole("button", { name: "Last 24 hours" }));

    expect(store.timeRangeFrom).toBe("now-24h");
    expect(store.timeRangeTo).toBe("now");
    expect(chip().textContent).toContain("Last 24 hours");
  });

  test("EXAMPLE: The current range can be saved as the user's default", async () => {
    const store = renderPicker();
    store.timeRangeFrom = "now-24h";
    store.timeRangeTo = "now";

    await openPicker();
    await fireEvent.click(screen.getByRole("button", { name: "Save current range as default" }));

    expect(JSON.parse(localStorage.getItem("audit.defaultTimeRange")!)).toEqual({ from: "now-24h", to: "now" });
    expect(screen.getByText("✓ Saved in this browser")).toBeInTheDocument();
  });

  test("EXAMPLE: When the applied range already is the default, there is nothing to save", async () => {
    renderPicker();

    await openPicker();

    expect(screen.queryByRole("button", { name: "Save current range as default" })).toBeNull();
    expect(screen.getByText("current range is the default")).toBeInTheDocument();
  });

  describe("RULE: Bounds read as 'from to to'; a range ending now is just its start", () => {
    test("EXAMPLE: The editor puts From and To on their own rows, with the quick ranges listed beside them", async () => {
      renderPicker();
      await openPicker();

      expect(screen.getByText("From")).toBeInTheDocument();
      expect(screen.getByText("To")).toBeInTheDocument();
      expect(document.body.textContent).not.toContain("→");
      // every quick range is one entry of the list next to the editor
      const quick = document.querySelector(".quick")!;
      for (const label of ["Last 15 minutes", "Last hour", "Last 6 hours", "Last 24 hours", "Last 7 days"]) {
        expect(quick.textContent).toContain(label);
      }
      expect(quick.textContent).toContain("No time filter");
    });

    test("EXAMPLE: A custom last-N range shows only its start on the chip", () => {
      renderPicker({ from: "now-90m", to: "now" });

      expect(chip().textContent!.trim()).toBe("now-90m");
    });

    test("EXAMPLE: An absolute start running to now shows both bounds on the chip", () => {
      renderPicker({ from: "2026-09-01 08:00", to: "now" });

      expect(chip().textContent!.trim()).toBe("2026-09-01 08:00 to now");
    });

    test("EXAMPLE: The default line drops 'to now' as well", async () => {
      renderPicker();
      await openPicker();

      const line = document.querySelector(".default-config")!;
      expect(line.textContent).toContain("now-6h");
      expect(line.textContent).not.toMatch(/now-6h\s*(→|to)\s*now/);
    });
  });

  describe("RULE: The editor tells the user what to type", () => {
    test("EXAMPLE: The hint covers relative expressions, the date format, and Z or an offset for the zone", async () => {
      renderPicker();
      await openPicker();

      const hint = document.querySelector(".hint")!;
      expect(hint).not.toBeNull();
      expect(hint.textContent).toContain("now-6h");
      expect(hint.textContent).toMatch(/YYYY-MM-DD HH:mm/);
      expect(hint.textContent).toMatch(/\bZ\b/);
      expect(hint.textContent).toContain("+02:00");
      expect(hint.textContent).toMatch(/local/i);
    });
  });

  describe("RULE: Each bound has a calendar for the day; the time stays what the field says", () => {
    beforeEach(() => {
      HTMLInputElement.prototype.showPicker = vi.fn();
    });

    test("EXAMPLE: A day picked for the start replaces the date and keeps the field's time", async () => {
      renderPicker();
      await openPicker();
      await fireEvent.update(fromInput(), "2026-09-01 08:05");

      const [startPicker] = nativePickers();
      await fireEvent.update(startPicker, "2026-09-03");

      expect(fromInput().value).toBe("2026-09-03 08:05");
    });

    test("EXAMPLE: A UTC-marked time survives a day pick unchanged", async () => {
      renderPicker();
      await openPicker();
      await fireEvent.update(toInput(), "2026-09-01T12:00Z");

      const [, endPicker] = nativePickers();
      await fireEvent.update(endPicker, "2026-09-03");

      expect(toInput().value).toBe("2026-09-03T12:00Z");
    });

    test("EXAMPLE: A field without an absolute time gets the start of the day for From and the end of it for To", async () => {
      renderPicker({ from: "now-6h", to: "now" });
      await openPicker();

      const [startPicker, endPicker] = nativePickers();
      await fireEvent.update(startPicker, "2026-09-03");
      await fireEvent.update(endPicker, "2026-09-03");

      expect(fromInput().value).toBe("2026-09-03 00:00:00");
      expect(toInput().value).toBe("2026-09-03 23:59:59");
    });

    test("EXAMPLE: The calendar opens on the field's current day", async () => {
      renderPicker();
      await openPicker();
      await fireEvent.update(fromInput(), "2026-09-01 08:05");

      await fireEvent.click(calendarButton("start"));

      const [startPicker] = nativePickers();
      expect(startPicker.value).toBe("2026-09-01");
      expect(startPicker.showPicker).toHaveBeenCalled();
    });

    test("EXAMPLE: A relative bound opens the calendar on the day it resolves to", async () => {
      renderPicker({ from: "now-6h", to: "now" });
      await openPicker();

      await fireEvent.click(calendarButton("end"));

      const [, endPicker] = nativePickers();
      expect(endPicker.value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });
});
