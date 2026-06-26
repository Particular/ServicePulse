import { describe, test, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/vue";
import { createTestingPinia } from "@pinia/testing";
import { defineComponent, h, nextTick, ref } from "vue";
import { createRouter, createMemoryHistory } from "vue-router";
import type GroupOperation from "@/resources/GroupOperation";
import MessageGroupList, { type IMessageGroupList } from "@/components/failedmessages/MessageGroupList.vue";
import type { ManifestEntry } from "@/stores/AllowedRoutesStore";
import { ApiRoutes } from "@/composables/apiRoutes";
import { normalizeRouteKey } from "@/composables/routeMatching";

// The group-level Retry/Delete actions are gated on the recoverabilitygroups allowed routes.
// Unlike the per-message buttons (which hide), these stay VISIBLE but DISABLED when the
// route is missing, with a tooltip explaining why, so it's clear the action exists.
const RETRY_ROUTE_KEY = normalizeRouteKey(ApiRoutes.retryGroup.method, ApiRoutes.retryGroup.path);
const DELETE_ROUTE_KEY = normalizeRouteKey(ApiRoutes.deleteGroup.method, ApiRoutes.deleteGroup.path);

const group: GroupOperation = {
  id: "group-1",
  title: "SomeException",
  type: "exception-type",
  count: 2,
  comment: "",
  operation_status: "None",
  operation_progress: 0,
  need_user_acknowledgement: false,
};

vi.mock("@/components/failedmessages/messageGroupClient", () => ({
  default: () => ({
    getExceptionGroups: vi.fn().mockResolvedValue([group]),
    isError: () => false,
  }),
}));

function makeRoutes(keys: string[]): Map<string, ManifestEntry> {
  return new Map(keys.map((k) => [k, { method: "", url_template: "" }]));
}

async function renderGroupList(allowedRouteKeys: string[]) {
  const listRef = ref<IMessageGroupList>();

  const Harness = defineComponent({
    setup() {
      return () => h(MessageGroupList, { ref: listRef, sortFunction: () => 0 });
    },
  });

  const router = createRouter({ history: createMemoryHistory(), routes: [{ path: "/:catchAll(.*)", component: { template: "<div />" } }] });

  render(Harness, {
    global: {
      plugins: [
        router,
        createTestingPinia({
          stubActions: true,
          initialState: {
            auth: { authEnabled: true, isAuthenticated: true },
            AllowedRoutesStore: { routes: makeRoutes(allowedRouteKeys), loaded: true, loadAttempted: true },
          },
        }),
      ],
      directives: { tippy: () => {} },
    },
  });

  await nextTick();
  await listRef.value?.loadFailedMessageGroups();
  await nextTick();
}

function button(text: RegExp): HTMLButtonElement | null {
  return screen.queryByText(text)?.closest("button") ?? null;
}

describe("failed-message group action button permissions", () => {
  beforeEach(() => {
    // Teleport target used by the confirm dialogs the list renders.
    document.body.innerHTML = '<div id="modalDisplay"></div>';
  });

  test("Request retry is enabled when its route is allowed", async () => {
    await renderGroupList([RETRY_ROUTE_KEY, DELETE_ROUTE_KEY]);
    expect(button(/Request retry/i)?.disabled).toBe(false);
  });

  test("Request retry stays visible but disabled when its route is not allowed", async () => {
    await renderGroupList([DELETE_ROUTE_KEY]);
    const retry = button(/Request retry/i);
    expect(retry).not.toBeNull();
    expect(retry?.disabled).toBe(true);
  });

  test("Delete group is enabled when its route is allowed", async () => {
    await renderGroupList([RETRY_ROUTE_KEY, DELETE_ROUTE_KEY]);
    expect(button(/Delete group/i)?.disabled).toBe(false);
  });

  test("Delete group stays visible but disabled when its route is not allowed", async () => {
    await renderGroupList([RETRY_ROUTE_KEY]);
    const del = button(/Delete group/i);
    expect(del).not.toBeNull();
    expect(del?.disabled).toBe(true);
  });
});
