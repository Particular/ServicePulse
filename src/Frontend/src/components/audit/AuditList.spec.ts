import { describe, test, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/vue";
import { createTestingPinia } from "@pinia/testing";
import { createRouter, createMemoryHistory } from "vue-router";
import { ref, shallowReadonly, nextTick, type Ref } from "vue";
import { flushPromises } from "@vue/test-utils";
import AuditList from "@/components/audit/AuditList.vue";
import { useAuditStore } from "@/stores/AuditStore";
import { type default as Message, MessageStatus } from "@/resources/Message";

/**
 * DSL for the Audit Messages Query State feature.
 *
 * This specification focuses on user-visible loading feedback, not
 * implementation details of how fetching is managed internally.
 *
 * If the loading UI changes (overlay becomes skeleton, spinner moves, etc.),
 * only the helper functions below need updating — the tests remain unchanged.
 */

// ==================== Mock Setup ====================

vi.mock("@/composables/autoRefresh");
const auditingStatus = vi.hoisted(() => ({ value: "Available" }));
vi.mock("@/components/platformcapabilities/capabilities/AuditingCapability", () => ({
  useAuditingCapability: () => ({ status: auditingStatus }),
}));
vi.mock("@/components/platformcapabilities/wizards/AuditingWizardPages", () => ({
  getAuditingWizardPages: () => [],
}));

import useFetchWithAutoRefresh from "@/composables/autoRefresh";

// ==================== DSL Interfaces ====================

interface QueryStateAssertions {
  spinnerIsVisible(): void;
  spinnerIsNotVisible(): void;
  overlayIsVisible(): void;
  overlayIsNotVisible(): void;
  messagesAreVisible(): void;
  messagesAreNotVisible(): void;
  refreshControlsKnowQueryIsInProgress(): void;
  refreshControlsKnowQueryIsIdle(): void;
  filtersAreNotBlockedByQuery(): void;
}

interface RenderResult {
  verify: QueryStateAssertions;
  isRefreshing: Ref<boolean>;
  refreshNow: ReturnType<typeof vi.fn>;
  stop: ReturnType<typeof vi.fn>;
  store: ReturnType<typeof useAuditStore>;
  unmount: () => void;
}

// ==================== DOM Query Helpers ====================

function getSpinner(): Element | null {
  const spinners = document.querySelectorAll(".spinner-border");
  for (const el of spinners) {
    if (!el.closest(".loading-overlay")) return el;
  }
  return null;
}

function getLoadingOverlay(): Element | null {
  return document.querySelector(".loading-overlay");
}

function getMessageItems(): HTMLElement[] {
  return screen.queryAllByTestId("message-item");
}

function getFiltersPanel(): HTMLElement {
  return screen.getByTestId("filters-panel");
}

function getRefreshConfig(): HTMLElement {
  return screen.getByTestId("refresh-config");
}

// ==================== Data Helpers ====================

function createMessage(id = "msg-1"): Message {
  return {
    id,
    message_id: id,
    message_type: "TestMessage",
    sending_endpoint: { name: "Sender", host_id: "h1", host: "localhost" },
    receiving_endpoint: { name: "Receiver", host_id: "h2", host: "localhost" },
    time_sent: new Date().toISOString(),
    processed_at: new Date().toISOString(),
    critical_time: "00:00:00",
    processing_time: "00:00:00",
    delivery_time: "00:00:00",
    is_system_message: false,
    conversation_id: "conv-1",
    headers: [],
    status: MessageStatus.Successful,
    message_intent: "send" as never,
    body_url: "",
    body_size: 0,
    instance_id: "instance-1",
  };
}

// ==================== Component Renderer ====================

async function renderAuditList(messages: Message[] = [], options: { neverCompleteFirstQuery?: boolean } = {}): Promise<RenderResult> {
  const isRefreshing = ref(false);
  const refreshNow = vi.fn().mockResolvedValue(undefined);
  if (options.neverCompleteFirstQuery) {
    refreshNow.mockImplementationOnce(() => new Promise(() => {}));
  }
  const stop = vi.fn();

  vi.mocked(useFetchWithAutoRefresh).mockReturnValue({
    refreshNow,
    isRefreshing: shallowReadonly(isRefreshing),
    updateInterval: vi.fn(),
    isActive: ref(false),
    start: vi.fn(),
    stop,
    nextRefreshAt: shallowReadonly(ref<number | null>(null)),
  });

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: "/messages", component: { template: "<div />" } }],
  });
  await router.push("/messages");
  await router.isReady();

  const pinia = createTestingPinia({
    createSpy: vi.fn,
    initialState: {
      AuditStore: { messages, totalCount: messages.length },
      ConfigurationStore: { isMassTransitConnected: false },
    },
  });

  const { unmount } = render(AuditList, {
    global: {
      plugins: [pinia, router],
      stubs: {
        AuditListItem: { template: '<div data-testid="message-item" />' },
        RefreshConfig: {
          template: `<div data-testid="refresh-config" :data-query-in-progress="String(queryInProgress)"><button data-testid="cancel-button" @click="$emit('cancel-query')"></button></div>`,
          props: ["queryInProgress"],
          emits: ["cancel-query", "manual-refresh"],
        },
        FiltersPanel: { template: '<div data-testid="filters-panel" :data-query-in-progress="String(queryInProgress)"><slot name="actions" /></div>', props: ["queryInProgress"] },
        ResultsCount: true,
        WizardDialog: true,
        PageBanner: true,
      },
    },
  });

  const verify: QueryStateAssertions = {
    spinnerIsVisible() {
      expect(getSpinner()).toBeInTheDocument();
    },
    spinnerIsNotVisible() {
      expect(getSpinner()).not.toBeInTheDocument();
    },
    overlayIsVisible() {
      expect(getLoadingOverlay()).toBeInTheDocument();
    },
    overlayIsNotVisible() {
      expect(getLoadingOverlay()).not.toBeInTheDocument();
    },
    messagesAreVisible() {
      expect(getMessageItems().length).toBeGreaterThan(0);
    },
    messagesAreNotVisible() {
      expect(getMessageItems()).toHaveLength(0);
    },
    refreshControlsKnowQueryIsInProgress() {
      expect(getRefreshConfig().dataset.queryInProgress).toBe("true");
    },
    refreshControlsKnowQueryIsIdle() {
      expect(getRefreshConfig().dataset.queryInProgress).toBe("false");
    },
    filtersAreNotBlockedByQuery() {
      // The filters panel is deliberately not told about query progress: entering a new
      // query must always be possible, even while a slow query is still running.
      expect(getFiltersPanel().dataset.queryInProgress).toBe("undefined");
    },
  };

  return { verify, isRefreshing, refreshNow, stop, store: useAuditStore(pinia), unmount };
}

// A control change reaches the fetch via two async hops (controls watcher -> router.push -> route watcher),
// so settle the microtask queue a few times before counting queries.
async function waitForRouteDrivenQuery() {
  await flushPromises();
  await nextTick();
  await flushPromises();
  await nextTick();
  await flushPromises();
  await nextTick();
}

async function waitForFirstLoadToComplete() {
  await new Promise((r) => setTimeout(r, 0));
  await flushPromises();
}

// ==================== Tests ====================

describe("FEATURE: Audit Messages Query State", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auditingStatus.value = "Available";
    localStorage.clear();
  });

  describe("RULE: A spinner is shown during the initial page load", () => {
    test("EXAMPLE: Spinner is visible before the first fetch completes", async () => {
      const { verify } = await renderAuditList();

      verify.spinnerIsVisible();
      verify.messagesAreNotVisible();
      verify.refreshControlsKnowQueryIsInProgress();
      verify.filtersAreNotBlockedByQuery();
    });

    test("EXAMPLE: Spinner is hidden after the first fetch completes", async () => {
      const { verify } = await renderAuditList([createMessage()]);

      await waitForFirstLoadToComplete();

      await waitFor(() => verify.spinnerIsNotVisible());
      verify.overlayIsNotVisible();
      verify.refreshControlsKnowQueryIsIdle();
      verify.filtersAreNotBlockedByQuery();
    });
  });

  describe("RULE: A spinner is shown when re-fetching with no existing results", () => {
    test("EXAMPLE: Spinner is shown when a new fetch starts with an empty message list", async () => {
      const { verify, isRefreshing } = await renderAuditList([]);

      await waitForFirstLoadToComplete();

      isRefreshing.value = true;
      await nextTick();

      verify.spinnerIsVisible();
      verify.messagesAreNotVisible();
    });

    test("EXAMPLE: Spinner is hidden after the re-fetch completes", async () => {
      const { verify, isRefreshing } = await renderAuditList([]);

      await waitForFirstLoadToComplete();

      isRefreshing.value = true;
      await nextTick();
      verify.spinnerIsVisible();

      isRefreshing.value = false;
      await nextTick();
      verify.spinnerIsNotVisible();
    });
  });

  describe("RULE: Filters stay usable while a query is running", () => {
    test("EXAMPLE: The filters are not blocked when a re-fetch is in-flight", async () => {
      const { verify, isRefreshing } = await renderAuditList([]);

      await waitForFirstLoadToComplete();

      isRefreshing.value = true;
      await nextTick();

      verify.refreshControlsKnowQueryIsInProgress();
      verify.filtersAreNotBlockedByQuery();
    });

    test("EXAMPLE: The refresh action is re-enabled after the fetch completes", async () => {
      const { verify, isRefreshing } = await renderAuditList([]);

      await waitForFirstLoadToComplete();

      isRefreshing.value = true;
      await nextTick();

      isRefreshing.value = false;
      await nextTick();

      verify.refreshControlsKnowQueryIsIdle();
      verify.filtersAreNotBlockedByQuery();
    });
  });

  describe("RULE: A loading overlay is shown when re-fetching with existing results", () => {
    test("EXAMPLE: Overlay appears over existing messages while a re-fetch is in-flight", async () => {
      const { verify, isRefreshing } = await renderAuditList([createMessage()]);

      await waitForFirstLoadToComplete();
      await waitFor(() => verify.messagesAreVisible());

      isRefreshing.value = true;
      await nextTick();

      verify.overlayIsVisible();
      verify.messagesAreVisible();
    });

    test("EXAMPLE: Overlay disappears after the re-fetch completes", async () => {
      const { verify, isRefreshing } = await renderAuditList([createMessage()]);

      await waitForFirstLoadToComplete();

      isRefreshing.value = true;
      await nextTick();
      verify.overlayIsVisible();

      isRefreshing.value = false;
      await nextTick();
      verify.overlayIsNotVisible();
    });
  });

  describe("RULE: Onboarding prompts render only after the capability probe has answered", () => {
    test("EXAMPLE: No banner while the successful-messages probe is still checking", async () => {
      auditingStatus.value = "Checking";
      await renderAuditList([]);

      await waitForFirstLoadToComplete();

      expect(document.querySelector("page-banner-stub")).toBeNull();
    });

    test("EXAMPLE: The banner appears once a completed probe found no messages", async () => {
      auditingStatus.value = "Endpoints Not Configured";
      await renderAuditList([]);

      await waitForFirstLoadToComplete();

      expect(document.querySelector("page-banner-stub")).not.toBeNull();
    });
  });

  describe("RULE: A failed query tells the user what happened and what to try", () => {
    test("EXAMPLE: The error banner is shown after a failed query", async () => {
      const { store } = await renderAuditList([]);

      await waitForFirstLoadToComplete();

      store.queryFailed = true;
      await nextTick();

      expect(screen.getByTestId("query-error")).toBeInTheDocument();
    });

    test("EXAMPLE: The error banner is not shown while a retry is in flight", async () => {
      const { store, isRefreshing } = await renderAuditList([]);

      await waitForFirstLoadToComplete();

      store.queryFailed = true;
      isRefreshing.value = true;
      await nextTick();

      expect(screen.queryByTestId("query-error")).not.toBeInTheDocument();
    });

    test("EXAMPLE: The error banner is not shown when queries succeed", async () => {
      const { verify } = await renderAuditList([createMessage()]);

      await waitForFirstLoadToComplete();

      verify.messagesAreVisible();
      expect(screen.queryByTestId("query-error")).not.toBeInTheDocument();
    });
  });

  describe("RULE: A query-control change results in exactly one query", () => {
    test("EXAMPLE: Changing the filter text fires a single query", async () => {
      const { refreshNow, store } = await renderAuditList([createMessage()]);

      await waitForFirstLoadToComplete();
      const queriesAfterFirstLoad = refreshNow.mock.calls.length;

      store.messageFilterString = "orders";
      await waitForRouteDrivenQuery();

      expect(refreshNow.mock.calls.length - queriesAfterFirstLoad).toBe(1);
    });

    test("EXAMPLE: Typing a search during the slow initial query still starts the new query", async () => {
      const { refreshNow, store } = await renderAuditList([], { neverCompleteFirstQuery: true });

      await waitForFirstLoadToComplete();
      expect(refreshNow).toHaveBeenCalledTimes(1); // the initial query, still running

      store.messageFilterString = "orders";
      await waitForRouteDrivenQuery();

      // The new query must not be swallowed just because the first one never finished
      expect(refreshNow).toHaveBeenCalledTimes(2);
    });

    test("EXAMPLE: Changing the endpoint fires a single query", async () => {
      const { refreshNow, store } = await renderAuditList([createMessage()]);

      await waitForFirstLoadToComplete();
      const queriesAfterFirstLoad = refreshNow.mock.calls.length;

      store.selectedEndpointName = "Sales.Endpoint";
      await waitForRouteDrivenQuery();

      expect(refreshNow.mock.calls.length - queriesAfterFirstLoad).toBe(1);
    });
  });

  describe("RULE: The saved default range drives the first query", () => {
    test("EXAMPLE: Opening the view without URL params applies the browser's saved default", async () => {
      localStorage.setItem("audit.defaultTimeRange", JSON.stringify({ from: "now-24h", to: "now" }));

      const { store, refreshNow } = await renderAuditList([]);
      await waitForFirstLoadToComplete();

      expect(store.timeRangeFrom).toBe("now-24h");
      expect(store.timeRangeTo).toBe("now");
      expect(refreshNow).toHaveBeenCalled();
    });
  });

  describe("RULE: The refresh button cancels the running query", () => {
    test("EXAMPLE: The cancel action aborts via the store", async () => {
      const { store } = await renderAuditList([], { neverCompleteFirstQuery: true });

      await waitForFirstLoadToComplete();

      await fireEvent.click(screen.getByTestId("cancel-button"));

      expect(store.cancelQuery).toHaveBeenCalled();
    });
  });

  describe("RULE: Leaving the view stops its activity", () => {
    test("EXAMPLE: Unmounting aborts the in-flight query and releases the auto-refresh", async () => {
      const { stop, store, unmount } = await renderAuditList([createMessage()], { neverCompleteFirstQuery: true });

      await waitForFirstLoadToComplete();

      unmount();

      expect(store.cancelQuery).toHaveBeenCalled();
      expect(stop).toHaveBeenCalled();
    });
  });
});
