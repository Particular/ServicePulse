import { useDeleteFromServiceControl, usePostToServiceControl, useTypedFetchFromServiceControl } from "./serviceServiceControlUrls";
import type GroupOperation from "@/resources/GroupOperation";
import type FailureGroupView from "@/resources/FailureGroupView";

export async function useGetExceptionGroups(classifier: string = "") {
  const [, data] = await useTypedFetchFromServiceControl<GroupOperation[]>(`recoverability/groups/${classifier}`);
  return data;
}

//get all deleted message groups
export async function useGetArchiveGroups(classifier: string = "") {
  const [, data] = await useTypedFetchFromServiceControl<FailureGroupView[]>(`errors/groups/${classifier}`);
  return data;
}

//delete note by group id
export async function useDeleteNote(groupId: string) {
  const response = await useDeleteFromServiceControl(`recoverability/groups/${groupId}/comment`);
  return {
    message: response.ok ? "success" : `error:${response.statusText}`,
  };
}

//edit or create note by group id
export async function useEditOrCreateNote(groupId: string, comment: string) {
  const response = await usePostToServiceControl(`recoverability/groups/${groupId}/comment?comment=${comment}`);
  return {
    message: response.ok ? "success" : `error:${response.statusText}`,
  };
}

//archive exception group by group id
//archiveGroup
export async function useArchiveExceptionGroup(groupId: string) {
  const response = await usePostToServiceControl(`recoverability/groups/${groupId}/errors/archive`);
  return {
    message: response.ok ? "success" : `error:${response.statusText}`,
  };
}

//restore group by group id
export async function useRestoreGroup(groupId: string) {
  const response = await usePostToServiceControl(`recoverability/groups/${groupId}/errors/unarchive`);
  return {
    message: response.ok ? "success" : `error:${response.statusText}`,
  };
}

//retry exception group by group id
//retryGroup
export async function useRetryExceptionGroup(groupId: string) {
  const response = await usePostToServiceControl(`recoverability/groups/${groupId}/errors/retry`);
  return {
    message: response.ok ? "success" : `error:${response.statusText}`,
  };
}

//acknowledge archive exception group by group id
export async function useAcknowledgeArchiveGroup(groupId: string) {
  const response = await useDeleteFromServiceControl(`recoverability/unacknowledgedgroups/${groupId}`);
  return {
    message: response.ok ? "success" : `error:${response.statusText}`,
  };
}
