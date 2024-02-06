import { usePatchToServiceControl, usePostToServiceControl } from "./serviceServiceControlUrls";
import type { Ref } from "vue";

export async function useUnarchiveMessage(ids: string[]) {
  const response = await usePatchToServiceControl("errors/unarchive/", ids);
  if (!response.ok) {
    throw response.statusText;
  }

  return {
    status: response.status,
    statusText: response.statusText,
    data: response,
  };
}

export async function useArchiveMessage(ids: string[]) {
  const response = await usePatchToServiceControl("errors/archive/", ids);
  if (!response.ok) {
    throw response.statusText;
  }

  return {
    status: response.status,
    statusText: response.statusText,
    data: response,
  };
}

export async function useRetryMessages(ids: string[]) {
  await usePostToServiceControl("errors/retry", ids);
}

export async function useRetryEditedMessage(
  id: string,
  editedMessage: Ref<{
    messageBody: string;
    headers: unknown[];
  }>
) {
  const payload = { message_body: editedMessage.value.messageBody, message_headers: editedMessage.value.headers };
  const response = await usePostToServiceControl(`edit/${id}`, payload);
  if (!response.ok) {
    throw response.statusText;
  }

  return response;
}
