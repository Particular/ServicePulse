import { usePatchToServiceControl, usePostToServiceControl } from "./serviceServiceControlUrls";

export async function useUnarchiveMessage(ids) {
  try {
    const response = await usePatchToServiceControl("errors/unarchive/", ids);
    if (response.ok === false) {
      throw response.statusText;
    }
    const result = {
      status: response.status,
      statusText: response.statusText,
      data: response,
    };
    return result;
  } catch (error) {
    console.error("There was an error trying to unarchive messages with the provided id(s): ", ids, "\n", error);
    return;
  }
}

export async function useArchiveMessage(ids) {
  try {
    const response = await usePatchToServiceControl("errors/archive/", ids);
    if (response.ok === false) {
      throw response.statusText;
    }
    const result = {
      status: response.status,
      statusText: response.statusText,
      data: response,
    };
    return result;
  } catch (error) {
    console.error("There was an error trying to unarchive messages with the provided id(s): ", ids, "\n", error);
    return;
  }
}

export async function useRetryMessages(ids) {
  try {
    await usePostToServiceControl("errors/retry", ids);
  } catch (error) {
    console.error("There was an error trying to retry messages with the provided id(s): ", ids, "\n", error);
  }
}

export async function useRetryEditedMessage(ids, editedMessage) {
  const payload = { message_body: editedMessage.value.messageBody, message_headers: editedMessage.value.headers };
  try {
    const response = await usePostToServiceControl("edit/" + ids, payload);
    if (!response.ok) {
      throw response.statusText;
    }
    return response;
  } catch (error) {
    console.error("There was an error trying to retry message with the provided id: ", ids, "\n", error);
    throw error;
  }
}
