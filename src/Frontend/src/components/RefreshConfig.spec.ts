import { describe, test, expect } from "vitest";
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

const ListFilterSelectorStub = defineComponent({
  props: { disabled: Boolean },
  template: '<button :data-disabled="String(disabled)" />',
});

// ==================== DSL ====================

function renderRefreshConfig(queryInProgress: boolean) {
  const { rerender, emitted } = render(RefreshConfig, {
    props: { queryInProgress, modelValue: null },
    global: {
      stubs: {
        ActionButton: ActionButtonStub,
        ListFilterSelector: ListFilterSelectorStub,
      },
    },
  });

  function getButton(): HTMLButtonElement {
    return document.querySelector("button[data-loading]") as HTMLButtonElement;
  }

  function getAutoRefreshSelector(): HTMLButtonElement {
    return document.querySelector("button[data-disabled]") as HTMLButtonElement;
  }

  async function setQueryInProgress(value: boolean) {
    await rerender({ queryInProgress: value, modelValue: null });
  }

  async function rerenderWith(props: { queryInProgress: boolean; queryStartedAt?: number | null; nextRefreshAt?: number | null; modelValue?: number | null }) {
    await rerender({ modelValue: null, ...props });
  }

  return {
    setQueryInProgress,
    rerenderWith,
    getButton,
    emitted,
    verify: {
      refreshButtonIsLoading: () => expect(getButton().dataset.loading).toBe("true"),
      refreshButtonIsNotLoading: () => expect(getButton().dataset.loading).toBe("false"),
      refreshButtonIsDisabled: () => expect(getButton()).toBeDisabled(),
      refreshButtonIsEnabled: () => expect(getButton()).toBeEnabled(),
      autoRefreshSelectorIsDisabled: () => expect(getAutoRefreshSelector().dataset.disabled).toBe("true"),
      autoRefreshSelectorIsEnabled: () => expect(getAutoRefreshSelector().dataset.disabled).toBe("false"),
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

    test("EXAMPLE: The cancel button shows the elapsed query time", async () => {
      const { rerenderWith, getButton } = renderRefreshConfig(false);

      await rerenderWith({ queryInProgress: true, queryStartedAt: Date.now() - 2700 });

      expect(getButton().textContent).toMatch(/Cancel · \d+\.\ds/);
    });

    test("EXAMPLE: With auto-refresh armed, the countdown ring sits inside the button", async () => {
      const { rerenderWith, getButton } = renderRefreshConfig(false);

      await rerenderWith({ queryInProgress: false, nextRefreshAt: Date.now() + 3000, modelValue: 5000 });

      expect(getButton().querySelector('[data-testid="auto-refresh-indicator"]')).not.toBeNull();
      expect(getButton().textContent).toContain("Refresh");
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
});
