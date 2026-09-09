import { afterEach, describe, test, expect, vi } from "vitest";
import { render } from "@testing-library/vue";
import { defineComponent } from "vue";
import RefreshConfig from "@/components/RefreshConfig.vue";

/**
 * DSL for the RefreshConfig query-in-progress behavior.
 *
 * Tests verify that the refresh controls stay in sync with the page-level query
 * state owned by AuditList.
 *
 * If the loading UI changes (different button component, different attribute), only
 * the helpers below need updating — the tests remain unchanged.
 */

// ==================== Stubs ====================

// Mirrors ActionButton's real disabled semantics (loading disables unless opted out) —
// a stub that diverges here hides exactly the bug this file exists to prevent.
const ActionButtonStub = defineComponent({
  props: { loading: Boolean, disabled: Boolean, disableOnLoading: { type: Boolean, default: true } },
  template: '<button :data-loading="String(loading)" :disabled="disabled || (loading && disableOnLoading)"><slot name="icon" /><slot /></button>',
});

// ==================== DSL ====================

function renderRefreshConfig(queryInProgress: boolean) {
  const { rerender, emitted } = render(RefreshConfig, {
    props: { queryInProgress, modelValue: null },
    global: {
      stubs: {
        ActionButton: ActionButtonStub,
      },
    },
  });

  function getButton(): HTMLButtonElement {
    return document.querySelector("button[data-loading]") as HTMLButtonElement;
  }

  function getIntervalToggle(): HTMLButtonElement {
    return document.querySelector('[data-testid="refresh-interval"]') as HTMLButtonElement;
  }

  async function setQueryInProgress(value: boolean) {
    await rerender({ queryInProgress: value, modelValue: null });
  }

  async function rerenderWith(props: { queryInProgress: boolean; nextRefreshAt?: number | null; modelValue?: number | null }) {
    await rerender({ modelValue: null, ...props });
  }

  return {
    setQueryInProgress,
    rerenderWith,
    getButton,
    getIntervalToggle,
    emitted,
    verify: {
      refreshButtonIsLoading: () => expect(getButton().dataset.loading).toBe("true"),
      refreshButtonIsNotLoading: () => expect(getButton().dataset.loading).toBe("false"),
      refreshButtonIsDisabled: () => expect(getButton()).toBeDisabled(),
      refreshButtonIsEnabled: () => expect(getButton()).toBeEnabled(),
      autoRefreshSelectorIsEnabled: () => expect(getIntervalToggle()).toBeEnabled(),
    },
  };
}

// ==================== Tests ====================

describe("FEATURE: Refresh Controls Query State", () => {
  describe("RULE: The refresh button becomes a cancel button while a query runs", () => {
    test("EXAMPLE: Idle shows Refresh; in-flight shows an enabled Cancel; everything stays usable", async () => {
      const { setQueryInProgress, verify, getButton } = renderRefreshConfig(false);

      verify.refreshButtonIsNotLoading();
      verify.refreshButtonIsEnabled();
      verify.autoRefreshSelectorIsEnabled();
      expect(getButton().textContent).toContain("Refresh");

      await setQueryInProgress(true);

      verify.refreshButtonIsLoading();
      // The button must stay enabled: it is now the escape hatch for a slow query
      verify.refreshButtonIsEnabled();
      expect(getButton().textContent).toContain("Cancel");
      // The selector must stay usable so auto-refresh can be turned off during a slow query
      verify.autoRefreshSelectorIsEnabled();

      await setQueryInProgress(false);

      verify.refreshButtonIsNotLoading();
      verify.refreshButtonIsEnabled();
      expect(getButton().textContent).toContain("Refresh");
    });

    test("EXAMPLE: The action segment keeps one width in both states, so the group does not jump", async () => {
      const { rerenderWith, getButton } = renderRefreshConfig(false);

      expect(getButton()).toHaveClass("refresh-action");
      expect(getButton().textContent!.trim()).toBe("Refresh");

      await rerenderWith({ queryInProgress: true });

      expect(getButton()).toHaveClass("refresh-action");
      // no clock in the label: the width must not depend on how long the query runs
      expect(getButton().textContent!.trim()).toBe("Cancel");
    });

    test("EXAMPLE: With auto-refresh armed, the countdown ring sits inside the button", async () => {
      const { rerenderWith, getButton } = renderRefreshConfig(false);

      await rerenderWith({ queryInProgress: false, nextRefreshAt: Date.now() + 3000, modelValue: 5000 });

      expect(getButton().querySelector('[data-testid="auto-refresh-indicator"]')).not.toBeNull();
      expect(getButton().textContent).toContain("Refresh");
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    test("EXAMPLE: The countdown reaches assistive tech as text describing the button, while the ring itself is decorative", async () => {
      // Frozen clock: the component's own 250 ms ticker and the test see the same "now"
      vi.useFakeTimers();
      const { rerenderWith, getButton } = renderRefreshConfig(false);

      await rerenderWith({ queryInProgress: false, nextRefreshAt: Date.now() + 3000, modelValue: 5000 });
      await vi.advanceTimersByTimeAsync(0);

      const button = getButton();
      // The ring is a visual: a screen reader must neither read SVG nor a label that changes every second as the button's name
      expect(button.querySelector('[data-testid="auto-refresh-indicator"]')).toHaveAttribute("aria-hidden", "true");
      expect(button).toHaveAccessibleName("Refresh");
      // The countdown is available as plain text that describes the button
      const timer = document.getElementById(button.getAttribute("aria-describedby")!);
      expect(timer).toHaveAttribute("role", "timer");
      expect(timer!.textContent).toMatch(/^Next auto refresh in \d+ seconds$/);

      await rerenderWith({ queryInProgress: false, nextRefreshAt: Date.now() + 800, modelValue: 5000 });
      await vi.advanceTimersByTimeAsync(0);
      expect(document.getElementById(button.getAttribute("aria-describedby")!)!.textContent).toBe("Next auto refresh in 1 second");
    });

    test("EXAMPLE: Without auto-refresh there is no countdown text either", async () => {
      const { rerenderWith, getButton } = renderRefreshConfig(false);

      await rerenderWith({ queryInProgress: false, nextRefreshAt: null, modelValue: null });

      expect(getButton()).not.toHaveAttribute("aria-describedby");
      expect(document.querySelector('[role="timer"]')).toBeNull();
    });

    test("EXAMPLE: Without auto-refresh there is no ring", async () => {
      const { rerenderWith, getButton } = renderRefreshConfig(false);

      await rerenderWith({ queryInProgress: false, nextRefreshAt: null, modelValue: null });

      expect(getButton().querySelector('[data-testid="auto-refresh-indicator"]')).toBeNull();
    });

    test("EXAMPLE: Clicking during a query emits cancelQuery, not manualRefresh", async () => {
      const { setQueryInProgress, getButton, emitted } = renderRefreshConfig(false);

      await setQueryInProgress(true);
      getButton().click();
      await Promise.resolve();

      expect(emitted().cancelQuery).toBeTruthy();
      expect(emitted().manualRefresh).toBeFalsy();
    });

    test("EXAMPLE: Clicking while idle emits manualRefresh", async () => {
      const { getButton, emitted } = renderRefreshConfig(false);

      getButton().click();
      await Promise.resolve();

      expect(emitted().manualRefresh).toBeTruthy();
      expect(emitted().cancelQuery).toBeFalsy();
    });
  });

  describe("RULE: The interval sits in the button as a short label, the way Grafana shows it", () => {
    test("EXAMPLE: The segment reads Off, 5s, 1m or 1h for the active interval", async () => {
      const { rerenderWith, getIntervalToggle } = renderRefreshConfig(false);

      expect(getIntervalToggle().textContent!.trim()).toBe("Off");

      await rerenderWith({ queryInProgress: false, modelValue: 5000 });
      expect(getIntervalToggle().textContent!.trim()).toBe("5s");

      await rerenderWith({ queryInProgress: false, modelValue: 60000 });
      expect(getIntervalToggle().textContent!.trim()).toBe("1m");

      await rerenderWith({ queryInProgress: false, modelValue: 3600000 });
      expect(getIntervalToggle().textContent!.trim()).toBe("1h");
    });

    test("EXAMPLE: The segment names the interval in full for assistive tech", async () => {
      const { rerenderWith, getIntervalToggle } = renderRefreshConfig(false);

      await rerenderWith({ queryInProgress: false, modelValue: 60000 });

      expect(getIntervalToggle()).toHaveAccessibleName("Auto-refresh: Every minute");
    });

    test("EXAMPLE: Choosing an interval from the menu sets it; choosing Off turns auto-refresh off", async () => {
      const { emitted } = renderRefreshConfig(false);

      const items = document.querySelectorAll<HTMLButtonElement>(".interval-menu .dropdown-item");
      const byShort = (short: string) => [...items].find((item) => item.textContent!.trim().startsWith(short))!;

      byShort("1m").click();
      await Promise.resolve();
      expect(emitted()["update:modelValue"]).toEqual([[60000]]);

      byShort("Off").click();
      await Promise.resolve();
      expect(emitted()["update:modelValue"]).toEqual([[60000], [null]]);
    });
  });
});
