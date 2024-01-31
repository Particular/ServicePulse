import { usePatchToServiceControl, usePostToServiceControl } from "./serviceServiceControlUrls";
import type { Ref } from "vue";

export async function useUnarchiveMessage(ids: string[]) {
  try {
    let response = await usePatchToServiceControl("errors/unarchive/", ids);
    if (!response.ok) {
      throw response.statusText;
    }
    return {
      status: response.status,
      statusText: response.statusText,
      data: response,
    };
  } catch (error) {
    console.error("There was an error trying to unarchive messages with the provided id(s): ", ids, "\n", error);
    return;
  }
}

export async function useArchiveMessage(ids: string[]) {
  try {
    let response = await usePatchToServiceControl("errors/archive/", ids);
    if (!response.ok) {
      throw response.statusText;
    }
    return {
      status: response.status,
      statusText: response.statusText,
      data: response,
    };
  } catch (error) {
    console.error("There was an error trying to unarchive messages with the provided id(s): ", ids, "\n", error);
    return;
  }
}

export async function useRetryMessages(ids: string[]) {
  try {
    return await usePostToServiceControl("errors/retry", ids);
  } catch (error) {
    console.error("There was an error trying to retry messages with the provided id(s): ", ids, "\n", error);
    return;
  }
}

export async function useRetryEditedMessage(
  id: string,
  editedMessage: Ref<{
    messageBody: string;
    headers: unknown[];
  }>
) {
  const payload = {
    message_body: editedMessage.value.messageBody,
    message_headers: editedMessage.value.headers,
  };
  try {
    let response = await usePostToServiceControl("edit/" + id, payload);
    if (!response.ok) {
      throw response.statusText;
    }
    return response;
  } catch (error) {
    console.error("There was an error trying to retry message with the provided id: ", id, "\n", error);
    throw error;
  }
}
