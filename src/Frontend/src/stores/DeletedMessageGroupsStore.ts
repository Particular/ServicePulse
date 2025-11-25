import { acceptHMRUpdate, defineStore } from "pinia";
import { readonly, ref } from "vue";
import { useServiceControlStore } from "./ServiceControlStore";
import { useCookies } from "vue3-cookies";
import FailureGroupView from "@/resources/FailureGroupView";
import { MessageGroupClient } from "@/components/failedmessages/messageGroupClient";

export const statusesForRestoreOperation = ["restorestarted", "restoreprogressing", "restorefinalizing", "restorecompleted"] as const;
type RestoreOperationStatus = (typeof statusesForRestoreOperation)[number];
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const otherStatuses = ["none", "working"] as const;
export type Status = RestoreOperationStatus | (typeof otherStatuses)[number];
interface WorkflowState {
  status: Status;
  total?: number;
  failed?: boolean;
  message?: string;
}
export interface ExtendedFailureGroupView extends FailureGroupView {
  index: number;
  need_user_acknowledgement?: boolean;
  workflow_state: WorkflowState;
  operation_remaining_count?: number;
  operation_start_time?: string;
  last_operation_completion_time?: string;
}

export const useDeletedMessageGroupsStore = defineStore("DeletedMessageGroupsStore", () => {
  const classifiers = ref<string[]>([]);
  const selectedClassifier = ref<string | null>(null);
  const archiveGroups = ref<ExtendedFailureGroupView[]>([]);
  let undismissedRestoreGroups: ExtendedFailureGroupView[] = [];

  const serviceControlStore = useServiceControlStore();
  const messageGroupClient = new MessageGroupClient(serviceControlStore);

  const cookies = useCookies();

  async function refresh() {
    if (!selectedClassifier.value) {
      await getGroupingClassifiers();
      selectedClassifier.value = getGrouping() ?? classifiers.value[0];
    }
    //get all deleted message groups
    const [, result] = await serviceControlStore.fetchTypedFromServiceControl<FailureGroupView[]>(`errors/groups/${selectedClassifier.value ?? getGrouping()}`);

    if (result.length === 0 && undismissedRestoreGroups.length > 0) {
      undismissedRestoreGroups.forEach((deletedGroup) => {
        deletedGroup.need_user_acknowledgement = true;
        deletedGroup.workflow_state.status = "restorecompleted";
      });
    }

    undismissedRestoreGroups.forEach((deletedGroup) => {
      if (!result.find((group) => group.id === deletedGroup.id)) {
        deletedGroup.need_user_acknowledgement = true;
        deletedGroup.workflow_state.status = "restorecompleted";
      }
    });

    // need a map in some ui state for controlling animations <-- TODO: work out what this comment means
    const mappedResults = result
      .filter((group) => !undismissedRestoreGroups.find((deletedGroup) => deletedGroup.id === group.id))
      .map(
        (group) =>
          ({
            index: 0,
            workflow_state: {
              status: "none" as Status,
              total: 0,
              failed: false,
            },
            ...group,
          }) as ExtendedFailureGroupView
      )
      .concat(undismissedRestoreGroups);

    let maxIndex = archiveGroups.value.reduce((currentMax, currentGroup) => Math.max(currentMax, currentGroup.index), 0);

    mappedResults.forEach((serverGroup) => {
      const previousGroup = archiveGroups.value.find((oldGroup) => oldGroup.id === serverGroup.id);

      if (previousGroup) {
        serverGroup.index = previousGroup.index;
      } else {
        serverGroup.index = ++maxIndex;
      }
    });

    archiveGroups.value = mappedResults.sort((group1, group2) => {
      return group1.index - group2.index;
    });
  }

  async function getGroupingClassifiers() {
    const [, data] = await serviceControlStore.fetchTypedFromServiceControl<string[]>("recoverability/classifiers");
    classifiers.value = data;
  }

  function getGrouping() {
    return cookies.cookies.get("archived_groups_classification") || null;
  }

  function setGrouping(classifier: string) {
    cookies.cookies.set("archived_groups_classification", classifier);
  }

  async function restoreGroup(group: ExtendedFailureGroupView) {
    undismissedRestoreGroups.push(group);

    group.workflow_state = { status: "restorestarted", message: "Restore request initiated..." };
    group.operation_start_time = new Date().toUTCString();

    const result = await messageGroupClient.restoreGroup(group.id);
    if (messageGroupClient.isError(result)) {
      return { result: false, errorMessage: result.message };
    }
    return { result: true };
  }

  function acknowledgeGroup(dismissedGroup: FailureGroupView) {
    undismissedRestoreGroups = undismissedRestoreGroups.filter((group) => group.id !== dismissedGroup.id);
    archiveGroups.value = archiveGroups.value.filter((group) => group.id !== dismissedGroup.id);
  }

  return {
    refresh,
    classifiers: readonly(classifiers),
    selectedClassifier,
    archiveGroups,
    getGrouping,
    setGrouping,
    restoreGroup,
    acknowledgeGroup,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useDeletedMessageGroupsStore, import.meta.hot));
}

export type DeletedMessageGroupsStore = ReturnType<typeof useDeletedMessageGroupsStore>;
