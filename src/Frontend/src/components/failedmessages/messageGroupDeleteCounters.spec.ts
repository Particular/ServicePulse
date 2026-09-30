import { describe, test, expect, beforeEach, vi } from "vitest";
import { render } from "@testing-library/vue";
import { createTestingPinia } from "@pinia/testing";
import { defineComponent, h, nextTick, ref } from "vue";
import { createRouter, createMemoryHistory } from "vue-router";
import type GroupOperation from "@/resources/GroupOperation";
import MessageGroupList, { type IMessageGroupList } from "@/components/failedmessages/MessageGroupList.vue";

// Regression test for https://github.com/Particular/ServicePulse/issues/3126
// While a group delete is in progress, ServiceControl's starting count and the
// running deleted count come from separate queries. If more failures keep
// arriving in the group, the deleted count can overtake the starting count,
// which drives "Messages left to delete" (starting count - deleted count) negative.
const groupBeingDeleted: GroupOperation = {
  id: "group-1",
  title: "SomeException",
  type: "exception-type",
  count: 666677,
  operation_messages_completed_count: 670000,
  comment: "",
  operation_status: "ArchiveProgressing",
  operation_failed: false,
  operation_progress: 0.5,
  operation_remaining_count: -3323,
  need_user_acknowledgement: false,
};

vi.mock("@/components/failedmessages/messageGroupClient", () => ({
  default: () => ({
    getExceptionGroups: vi.fn().mockResolvedValue([groupBeingDeleted]),
    isError: () => false,
  }),
}));

async function renderGroupList() {
  const listRef = ref<IMessageGroupList>();

  const Harness = defineComponent({
    setup() {
      return () => h(MessageGroupList, { ref: listRef, sortFunction: () => 0 });
    },
  });

  const router = createRouter({ history: createMemoryHistory(), routes: [{ path: "/:catchAll(.*)", component: { template: "<div />" } }] });

  const result = render(Harness, {
    global: {
      plugins: [router, createTestingPinia({ stubActions: true })],
    },
  });

  await nextTick();
  await listRef.value?.loadFailedMessageGroups();
  await nextTick();

  return result;
}

describe("failed-message group delete counters", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="modalDisplay"></div>';
  });

  test("Messages left to delete does not go negative when more failures arrive during a delete", async () => {
    const { container } = await renderGroupList();

    const text = container.textContent?.replace(/\s+/g, " ") ?? "";
    const match = text.match(/Messages left to delete:\s*(-?\d+)/);

    expect(match?.[1]).toBe("0");
  });
});
