import { render, describe, test, screen, expect, userEvent } from "@component-test-utils";
import { beforeEach, afterEach, vi } from "vitest";
import { createTestingPinia } from "@pinia/testing";
import { TYPE } from "vue-toastification";
import sut from "@/components/failedmessages/DeletedMessageGroups.vue";
import routeLinks from "@/router/routeLinks";
import { useDeletedMessageGroupsStore, type ExtendedFailureGroupView, type Status } from "@/stores/DeletedMessageGroupsStore";

const { showToastSpy, routerPushSpy, updateIntervalSpy } = vi.hoisted(() => ({
  showToastSpy: vi.fn(),
  routerPushSpy: vi.fn(),
  updateIntervalSpy: vi.fn(),
}));

vi.mock("../../composables/toast", () => ({
  useShowToast: showToastSpy,
}));

vi.mock("vue-router", () => ({
  useRouter: () => ({
    push: routerPushSpy,
  }),
}));

vi.mock("../../composables/useAutoRefresh", async () => {
  const { ref } = await import("vue");

  return {
    useStoreAutoRefresh: (_name: string, useStore: () => unknown) => ({
      autoRefresh: () => ({ store: useStore() }),
      isRefreshing: ref(false),
      updateInterval: updateIntervalSpy,
    }),
  };
});

beforeEach(() => {
  vi.clearAllMocks();
  const existing = document.getElementById("modalDisplay");
  if (existing) {
    document.body.removeChild(existing);
  }
  const modalDisplay = document.createElement("div");
  modalDisplay.id = "modalDisplay";
  document.body.appendChild(modalDisplay);
});

afterEach(() => {
  const modalDisplay = document.getElementById("modalDisplay");
  if (modalDisplay) {
    document.body.removeChild(modalDisplay);
  }
});

describe("FEATURE: Deleted Message Groups", () => {
  describe("RULE: Deleted Message Groups view shows grouped deleted messages", () => {
    test("EXAMPLE: There are no deleted message groups", () => {
      const componentDriver = renderComponent({ groups: [] });

      componentDriver.assert.noDataMessageIsVisible();
    });

    test("EXAMPLE: There is at least one deleted message group", () => {
      const componentDriver = renderComponent({
        groups: [buildGroup()],
      });

      componentDriver.assert.groupSummaryIsVisible({ title: "Orders endpoint", count: 3 });
      componentDriver.assert.restoreActionIsVisible();
    });

    test("EXAMPLE: Group displays the first failed time period", () => {
      const componentDriver = renderComponent({
        groups: [buildGroup()],
      });

      componentDriver.assert.firstFailedMetadataIsVisible();
    });

    test("EXAMPLE: Group displays the last failed time period", () => {
      const componentDriver = renderComponent({
        groups: [buildGroup()],
      });

      componentDriver.assert.lastFailedMetadataIsVisible();
    });

    test("EXAMPLE: Group displays the last retried time period", () => {
      const componentDriver = renderComponent({
        groups: [buildGroup()],
      });

      componentDriver.assert.lastRetriedMetadataIsVisible();
    });

    test("EXAMPLE: Group has not been retried", () => {
      const componentDriver = renderComponent({
        groups: [buildGroup({ last_operation_completion_time: "0001-01-01T00:00:00" })],
      });

      componentDriver.assert.lastRetriedShowsNotAvailable();
    });
  });

  describe("RULE: A deleted message group can be restored", () => {
    test("EXAMPLE: User confirms restore for a group", async () => {
      const group = buildGroup();
      const componentDriver = renderComponent({
        groups: [group],
      });

      await componentDriver.actions.requestGroupRestore();
      componentDriver.assert.restoreConfirmationIsVisible();

      await componentDriver.actions.confirmGroupRestore();

      componentDriver.assert.restoreActionWasRequested(group);
      componentDriver.assert.restoreStartToastWasShown();
      componentDriver.assert.pollingWasSetToFastMode();
    });

    test("EXAMPLE: Restore operation fails", async () => {
      const group = buildGroup();
      const componentDriver = renderComponent({
        groups: [group],
        restoreResult: { result: false, errorMessage: "service unavailable" },
      });

      await componentDriver.actions.requestGroupRestore();
      await componentDriver.actions.confirmGroupRestore();

      componentDriver.assert.restoreFailureToastWasShown();
    });
  });

  describe("RULE: Group selection opens deleted group details", () => {
    test("EXAMPLE: User selects a deleted message group row", async () => {
      const group = buildGroup({ id: "group-42", title: "Billing endpoint" });
      const componentDriver = renderComponent({ groups: [group] });

      await componentDriver.actions.selectGroup("Billing endpoint");

      componentDriver.assert.navigatedToDeletedGroup("group-42");
    });

    test("EXAMPLE: Group row indicates it is selectable", () => {
      const componentDriver = renderComponent({
        groups: [buildGroup()],
      });

      // Proxy for the hover/selectable visual cue:
      // jsdom cannot reliably assert CSS hover/cursor rendering, so we assert
      // the selectable row hook class exists.
      componentDriver.assert.groupRowHasSelectableStyling();
    });
  });

  describe("RULE: In-progress restore displays progress state", () => {
    test("EXAMPLE: Group restore is in progress", () => {
      const componentDriver = renderComponent({
        groups: [buildGroup({ workflow_state: { status: "restorestarted" } })],
      });

      componentDriver.assert.restoreProgressIsVisible();
      componentDriver.assert.restoreActionIsNotVisible();
    });
  });
});

interface ComponentDSL {
  actions: {
    requestGroupRestore(): Promise<void>;
    confirmGroupRestore(): Promise<void>;
    selectGroup(title: string): Promise<void>;
  };
  assert: {
    noDataMessageIsVisible(): void;
    groupSummaryIsVisible(args: { title: string; count: number }): void;
    restoreActionIsVisible(): void;
    restoreActionIsNotVisible(): void;
    firstFailedMetadataIsVisible(): void;
    lastFailedMetadataIsVisible(): void;
    lastRetriedMetadataIsVisible(): void;
    lastRetriedShowsNotAvailable(): void;
    groupRowHasSelectableStyling(): void;
    restoreConfirmationIsVisible(): void;
    restoreProgressIsVisible(): void;
    restoreActionWasRequested(group: ExtendedFailureGroupView): void;
    restoreStartToastWasShown(): void;
    restoreFailureToastWasShown(): void;
    pollingWasSetToFastMode(): void;
    navigatedToDeletedGroup(groupId: string): void;
  };
}

function renderComponent({ groups, restoreResult = { result: true } }: { groups: ExtendedFailureGroupView[]; restoreResult?: { result: boolean; errorMessage?: string } }): ComponentDSL {
  const user = userEvent.setup();

  render(sut, {
    global: {
      plugins: [
        createTestingPinia({
          initialState: {
            DeletedMessageGroupsStore: {
              archiveGroups: groups,
              classifiers: ["Endpoint Name"],
              selectedClassifier: "Endpoint Name",
            },
          },
          createSpy: vi.fn,
          stubActions: true,
        }),
      ],
      stubs: {
        ServiceControlAvailable: {
          template: "<div><slot /></div>",
        },
        LicenseNotExpired: {
          template: "<div><slot /></div>",
        },
        RouterLink: true,
      },
      directives: {
        tippy: () => {},
      },
    },
  });

  const store = useDeletedMessageGroupsStore();
  vi.mocked(store.restoreGroup).mockResolvedValue(restoreResult);

  return {
    actions: {
      async requestGroupRestore() {
        await user.click(screen.getByRole("button", { name: /restore group/i }));
      },
      async confirmGroupRestore() {
        await user.click(screen.getByRole("button", { name: /yes/i }));
      },
      async selectGroup(title: string) {
        await user.click(screen.getByText(title));
      },
    },
    assert: {
      noDataMessageIsVisible() {
        expect(screen.getByText(/there are currently no grouped message failures/i)).toBeInTheDocument();
      },
      groupSummaryIsVisible({ title, count }) {
        expect(screen.getByText(title)).toBeInTheDocument();
        expect(screen.getByText(new RegExp(`${count} message`, "i"))).toBeInTheDocument();
      },
      restoreActionIsVisible() {
        expect(screen.getByRole("button", { name: /restore group/i })).toBeInTheDocument();
      },
      restoreActionIsNotVisible() {
        expect(screen.queryByRole("button", { name: /restore group/i })).not.toBeInTheDocument();
      },
      firstFailedMetadataIsVisible() {
        expect(screen.getByText(/first failed:/i)).toBeInTheDocument();
      },
      lastFailedMetadataIsVisible() {
        expect(screen.getByText(/last failed:/i)).toBeInTheDocument();
      },
      lastRetriedMetadataIsVisible() {
        expect(screen.getByText(/last retried:/i)).toBeInTheDocument();
      },
      lastRetriedShowsNotAvailable() {
        expect(screen.getByText(/last retried:/i)).toBeInTheDocument();
        expect(screen.getByText(/n\/a/i)).toBeInTheDocument();
      },
      groupRowHasSelectableStyling() {
        expect(document.querySelector(".deleted-message-group")).toBeInTheDocument();
      },
      restoreConfirmationIsVisible() {
        expect(screen.getByRole("dialog", { name: /are you sure you want to restore this group\?/i })).toBeInTheDocument();
      },
      restoreProgressIsVisible() {
        expect(screen.getByText(/restore request in progress/i)).toBeInTheDocument();
      },
      restoreActionWasRequested(group: ExtendedFailureGroupView) {
        expect(store.restoreGroup).toHaveBeenCalledWith(group);
      },
      restoreStartToastWasShown() {
        expect(showToastSpy).toHaveBeenCalledWith(TYPE.INFO, "Info", "Group restore started...");
      },
      restoreFailureToastWasShown() {
        expect(showToastSpy).toHaveBeenCalledWith(TYPE.ERROR, "Error", expect.stringMatching(/failed to restore the group/i));
      },
      pollingWasSetToFastMode() {
        expect(updateIntervalSpy).toHaveBeenCalledWith(1000);
      },
      navigatedToDeletedGroup(groupId: string) {
        expect(routerPushSpy).toHaveBeenCalledWith(routeLinks.failedMessage.deletedGroup.link(groupId));
      },
    },
  };
}

function buildGroup({
  id = "group-1",
  title = "Orders endpoint",
  count = 3,
  workflow_state = { status: "none" as Status },
  last_operation_completion_time = "2026-03-08T12:30:00.000Z",
}: Partial<ExtendedFailureGroupView> = {}): ExtendedFailureGroupView {
  return {
    id,
    title,
    type: "Endpoint Name",
    count,
    comment: "",
    first: "2026-03-08T10:00:00.000Z",
    last: "2026-03-08T12:00:00.000Z",
    index: 1,
    workflow_state,
    last_operation_completion_time,
  };
}
