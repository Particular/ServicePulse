import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/vue";
import { createTestingPinia } from "@pinia/testing";
import { createRouter, createMemoryHistory } from "vue-router";
import { ref, shallowReadonly, nextTick, type Ref } from "vue";
import { flushPromises } from "@vue/test-utils";
import AuditList from "@/components/audit/AuditList.vue";
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
vi.mock("@/components/platformcapabilities/capabilities/AuditingCapability", () => ({
  useAuditingCapability: () => ({ status: { value: "Available" } }),
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
  filtersKnowQueryIsInProgress(): void;
  filtersKnowQueryIsIdle(): void;
}

interface RenderResult {
  verify: QueryStateAssertions;
  isRefreshing: Ref<boolean>;
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

async function renderAuditList(messages: Message[] = []): Promise<RenderResult> {
  const isRefreshing = ref(false);

  vi.mocked(useFetchWithAutoRefresh).mockReturnValue({
    refreshNow: vi.fn().mockResolvedValue(undefined),
    isRefreshing: shallowReadonly(isRefreshing),
    updateInterval: vi.fn(),
    isActive: ref(false),
    start: vi.fn(),
    stop: vi.fn(),
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
    },
  });

  render(AuditList, {
    global: {
      plugins: [pinia, router],
      stubs: {
        AuditListItem: { template: '<div data-testid="message-item" />' },
        RefreshConfig: { template: '<div data-testid="refresh-config" :data-query-in-progress="String(queryInProgress)" />', props: ["queryInProgress"] },
        FiltersPanel: { template: '<div data-testid="filters-panel" :data-query-in-progress="String(queryInProgress)" />', props: ["queryInProgress"] },
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
    filtersKnowQueryIsInProgress() {
      expect(getFiltersPanel().dataset.queryInProgress).toBe("true");
    },
    filtersKnowQueryIsIdle() {
      expect(getFiltersPanel().dataset.queryInProgress).toBe("false");
    },
  };

  return { verify, isRefreshing };
}

async function waitForFirstLoadToComplete() {
  await new Promise((r) => setTimeout(r, 0));
  await flushPromises();
}

// ==================== Tests ====================

describe("FEATURE: Audit Messages Query State", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("RULE: A spinner is shown during the initial page load", () => {
    test("EXAMPLE: Spinner is visible before the first fetch completes", async () => {
      const { verify } = await renderAuditList();

      verify.spinnerIsVisible();
      verify.messagesAreNotVisible();
      verify.refreshControlsKnowQueryIsInProgress();
      verify.filtersKnowQueryIsInProgress();
    });

    test("EXAMPLE: Spinner is hidden after the first fetch completes", async () => {
      const { verify } = await renderAuditList([createMessage()]);

      await waitForFirstLoadToComplete();

      await waitFor(() => verify.spinnerIsNotVisible());
      verify.overlayIsNotVisible();
      verify.refreshControlsKnowQueryIsIdle();
      verify.filtersKnowQueryIsIdle();
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

  describe("RULE: Query controls are disabled during a fetch", () => {
    test("EXAMPLE: Query controls are disabled when a re-fetch is in-flight", async () => {
      const { verify, isRefreshing } = await renderAuditList([]);

      await waitForFirstLoadToComplete();

      isRefreshing.value = true;
      await nextTick();

      verify.refreshControlsKnowQueryIsInProgress();
      verify.filtersKnowQueryIsInProgress();
    });

    test("EXAMPLE: Query controls are re-enabled after the fetch completes", async () => {
      const { verify, isRefreshing } = await renderAuditList([]);

      await waitForFirstLoadToComplete();

      isRefreshing.value = true;
      await nextTick();

      isRefreshing.value = false;
      await nextTick();

      verify.refreshControlsKnowQueryIsIdle();
      verify.filtersKnowQueryIsIdle();
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
});
