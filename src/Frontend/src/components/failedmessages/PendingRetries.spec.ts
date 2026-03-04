import { describe, test, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/vue";
import { createTestingPinia } from "@pinia/testing";
import { createRouter, createMemoryHistory } from "vue-router";
import FailedMessagesView from "@/views/FailedMessagesView.vue";

/**
 * DSL for the Pending Retries Tab Visibility feature.
 *
 * This specification focuses on user capabilities and business outcomes,
 * not UI implementation details.
 *
 * If the UI changes (tabs become dropdowns, etc.), only helper
 * functions need updating—the tests remain unchanged.
 */

// ==================== DSL Interfaces ====================
interface PendingRetriesAssertions {
  pendingRetriesTabIsVisible(): void;
  pendingRetriesTabIsNotVisible(): void;
}

interface RenderResult {
  verify: PendingRetriesAssertions;
}

// ==================== Mock Setup ====================
vi.mock("@/composables/useConnectionsAndStatsAutoRefresh", () => ({
  default: () => ({
    store: {
      requiresFullFailureDetails: vi.fn(),
      connectionState: {
        connected: true,
        connectedRecently: true,
      },
      failedMessageCount: 0,
      archivedMessageCount: 0,
      pendingRetriesMessageCount: 0,
    },
  }),
}));

// ==================== DOM Query Helpers ====================
function getPendingRetriesTab(): HTMLElement | null {
  return screen.queryByRole("link", { name: /pending retries/i });
}

// ==================== Window Config Helper ====================
function setupWindowConfig(showPendingRetry?: boolean): void {
  window.defaultConfig = {
    ...window.defaultConfig,
    showPendingRetry,
  } as typeof window.defaultConfig;
}

// ==================== Component Renderer ====================
interface RenderOptions {
  showPendingRetry?: boolean | undefined;
}

async function renderComponent(options: RenderOptions = {}): Promise<RenderResult> {
  const { showPendingRetry } = options;

  setupWindowConfig(showPendingRetry);

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: "/",
        redirect: "/failed-messages/groups",
      },
      {
        path: "/failed-messages",
        name: "failed-messages",
        component: FailedMessagesView,
        children: [
          {
            path: "groups",
            name: "failed-messages-groups",
            component: { template: "<div>Groups</div>" },
          },
          {
            path: "all",
            name: "failed-messages-all",
            component: { template: "<div>All Messages</div>" },
          },
          {
            path: "deleted-groups",
            name: "failed-messages-deleted-groups",
            component: { template: "<div>Deleted Groups</div>" },
          },
          {
            path: "deleted",
            name: "failed-messages-deleted",
            component: { template: "<div>Deleted</div>" },
          },
          {
            path: "pending-retries",
            name: "failed-messages-pending-retries",
            component: { template: "<div>Pending Retries</div>" },
          },
        ],
      },
    ],
  });

  const pinia = createTestingPinia({
    createSpy: vi.fn,
    stubActions: true,
  });

  await router.push("/failed-messages/groups");
  await router.isReady();

  render(FailedMessagesView, {
    global: {
      plugins: [pinia, router],
      stubs: {
        LicenseNotExpired: {
          template: "<div><slot /></div>",
        },
        RouterView: true,
      },
    },
  });

  const verify: PendingRetriesAssertions = {
    pendingRetriesTabIsVisible(): void {
      const tab = getPendingRetriesTab();
      expect(tab).toBeInTheDocument();
    },
    pendingRetriesTabIsNotVisible(): void {
      const tab = getPendingRetriesTab();
      expect(tab).not.toBeInTheDocument();
    },
  };

  return { verify };
}

// ==================== Tests ====================
describe("FEATURE: Pending Retries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("RULE: Pending Retries tab visibility is conditional on config value", () => {
    test("EXAMPLE: showPendingRetry is explicitly set to false", async () => {
      const { verify } = await renderComponent({
        showPendingRetry: false,
      });

      verify.pendingRetriesTabIsNotVisible();
    });

    test("EXAMPLE:showPendingRetry is explicitly set to true", async () => {
      const { verify } = await renderComponent({
        showPendingRetry: true,
      });

      verify.pendingRetriesTabIsVisible();
    });

    test("EXAMPLE: showPendingRetry is not configured (undefined)", async () => {
      const { verify } = await renderComponent({
        showPendingRetry: undefined,
      });

      verify.pendingRetriesTabIsNotVisible();
    });
  });
});
