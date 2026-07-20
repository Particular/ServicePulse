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

const ActionButtonStub = defineComponent({
  props: { loading: Boolean, disabled: Boolean },
  template: '<button :data-loading="String(loading)" :disabled="disabled"><slot /></button>',
});

const ListFilterSelectorStub = defineComponent({
  props: { disabled: Boolean },
  template: '<button :data-disabled="String(disabled)" />',
});

// ==================== DSL ====================

function renderRefreshConfig(queryInProgress: boolean) {
  const { rerender } = render(RefreshConfig, {
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

  return {
    setQueryInProgress,
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
  describe("RULE: Refresh controls are disabled while a query is in progress", () => {
    test("EXAMPLE: Refresh controls reflect queryInProgress changes", async () => {
      const { setQueryInProgress, verify } = renderRefreshConfig(false);

      verify.refreshButtonIsNotLoading();
      verify.refreshButtonIsEnabled();
      verify.autoRefreshSelectorIsEnabled();

      await setQueryInProgress(true);

      verify.refreshButtonIsLoading();
      verify.refreshButtonIsDisabled();
      verify.autoRefreshSelectorIsDisabled();

      await setQueryInProgress(false);

      verify.refreshButtonIsNotLoading();
      verify.refreshButtonIsEnabled();
      verify.autoRefreshSelectorIsEnabled();
    });
  });
});
