import { usePatchToServiceControl, usePostToServiceControl } from "./serviceServiceControlUrls";
import type { Ref } from "vue";

export async function useUnarchiveMessage(ids: string[]) {
  const response = await usePatchToServiceControl("errors/unarchive/", ids);
  if (!response.ok) {
    throw new Error(response.statusText);
  }
}

export async function useArchiveMessage(ids: string[]) {
  const response = await usePatchToServiceControl("errors/archive/", ids);
  if (!response.ok) {
    throw new Error(response.statusText);
  }
}

export async function useRetryMessages(ids: string[]) {
  await usePostToServiceControl("errors/retry", ids);
}

export async function useRetryEditedMessage(
  id: string,
  editedMessage: Ref<{
    messageBody: string;
    headers: any[];
  }>
) {
  let editedHeaders: { [key: string]: string } = {};
  for (let index = 0; index < editedMessage.value.headers.length; index++) {
    const header = editedMessage.value.headers[index];
    editedHeaders[header.key] = header.value;
  }
  const payload = { message_body: editedMessage.value.messageBody, message_headers: editedHeaders };
  const response = await usePostToServiceControl(`edit/${id}`, payload);
  if (!response.ok) {
    throw new Error(response.statusText);
  }
}
