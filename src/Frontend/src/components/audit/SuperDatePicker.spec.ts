import { beforeEach, describe, expect, test, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/vue";
import { createTestingPinia } from "@pinia/testing";
import SuperDatePicker from "@/components/audit/SuperDatePicker.vue";
import { useAuditStore } from "@/stores/AuditStore";

function renderPicker() {
  const pinia = createTestingPinia({ createSpy: vi.fn });
  render(SuperDatePicker, { global: { plugins: [pinia] } });
  return useAuditStore(pinia);
}

const chip = () => screen.getByRole("button", { name: /Time range/ }) as HTMLButtonElement;
const openPicker = () => fireEvent.click(chip());
const fromInput = () => screen.getByLabelText("Time range start") as HTMLInputElement;
const toInput = () => screen.getByLabelText("Time range end") as HTMLInputElement;
const applyButton = () => screen.getByRole("button", { name: "Apply" }) as HTMLButtonElement;

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
});
