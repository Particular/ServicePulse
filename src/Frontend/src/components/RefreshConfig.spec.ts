import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/vue";
import { defineComponent, nextTick } from "vue";
import RefreshConfig from "@/components/RefreshConfig.vue";

/**
 * DSL for the RefreshConfig spinner timing behavior.
 *
 * Tests verify that the refresh button's loading state stays in sync with the
 * isLoading prop for the full duration of the HTTP call, with a minimum display
 * time to prevent rapid re-clicks.
 *
 * If the loading UI changes (different button component, different attribute), only
 * the helpers below need updating — the tests remain unchanged.
 */

// ==================== Stubs ====================

const ActionButtonStub = defineComponent({
  props: { loading: Boolean },
  template: '<button :data-loading="String(loading)"><slot /></button>',
});

// ==================== DSL ====================

function renderRefreshConfig(isLoading: boolean) {
  const { rerender } = render(RefreshConfig, {
    props: { isLoading, modelValue: null },
    global: {
      stubs: {
        ActionButton: ActionButtonStub,
        ListFilterSelector: true,
      },
    },
  });

  function getButton(): HTMLButtonElement {
    return document.querySelector("button[data-loading]") as HTMLButtonElement;
  }

  async function setIsLoading(value: boolean) {
    await rerender({ isLoading: value, modelValue: null });
  }

  return {
    setIsLoading,
    verify: {
      isSpinning: () => expect(getButton().dataset.loading).toBe("true"),
      isNotSpinning: () => expect(getButton().dataset.loading).toBe("false"),
    },
  };
}

// ==================== Tests ====================

describe("FEATURE: Refresh Button Loading State", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("RULE: Spinner shows immediately when a fetch starts", () => {
    test("EXAMPLE: Spinner is visible when isLoading becomes true", async () => {
      const { setIsLoading, verify } = renderRefreshConfig(false);

      await setIsLoading(true);

      verify.isSpinning();
    });
  });

  describe("RULE: Spinner stays on for the full duration of the fetch", () => {
    test("EXAMPLE: Spinner stays on while isLoading is still true past 1s", async () => {
      const { setIsLoading, verify } = renderRefreshConfig(false);
      await setIsLoading(true);

      vi.advanceTimersByTime(1500);
      await nextTick();

      verify.isSpinning();
    });
  });

  describe("RULE: Spinner stays on for a minimum duration to prevent rapid re-clicks", () => {
    test("EXAMPLE: Spinner turns off only after loading ends and minimum duration elapses", async () => {
      const { setIsLoading, verify } = renderRefreshConfig(false);
      await setIsLoading(true);

      // fetch completes after 400ms (under the 1000ms minimum)
      vi.advanceTimersByTime(400);
      await setIsLoading(false);

      // 600ms remaining — not yet
      vi.advanceTimersByTime(599);
      await nextTick();
      verify.isSpinning();

      // minimum elapsed — spinner clears
      vi.advanceTimersByTime(1);
      await nextTick();
      verify.isNotSpinning();
    });
  });
});
