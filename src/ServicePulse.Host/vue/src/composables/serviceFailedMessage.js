import { usePatchToServiceControl, usePostToServiceControl } from "./serviceServiceControlUrls";

export function useUnarchiveMessage(ids) {
  return usePatchToServiceControl("errors/unarchive/", ids)
    .then(async (response) => {
      if (response.ok === false) {
        throw response.statusText;
      }
      var result = {
        status: response.status,
        statusText: response.statusText,
        data: response,
      };
      return result;
    })
    .catch((error) => {
      console.error("There was an error trying to unarchive messages with the provided id(s): ", ids, "\n", error);
      return;
    });
}

export function useArchiveMessage(ids) {
  return usePatchToServiceControl("errors/archive/", ids)
    .then(async (response) => {
      if (response.ok === false) {
        throw response.statusText;
      }
      var result = {
        status: response.status,
        statusText: response.statusText,
        data: response,
      };
      return result;
    })
    .catch((error) => {
      console.error("There was an error trying to unarchive messages with the provided id(s): ", ids, "\n", error);
      return;
    });
}

export function useRetryMessages(ids) {
  return usePostToServiceControl("errors/retry", ids).catch((error) => {
    console.error("There was an error trying to retry messages with the provided id(s): ", ids, "\n", error);
    return;
  });
}

export function useRetryEditedMessage(ids, editedMessage) {
  var payload = { message_body: editedMessage.value.messageBody, message_headers: editedMessage.value.headers };
  return usePostToServiceControl("edit/" + ids, payload)
    .then(async (response) => {
      if (response.ok === false) {
        throw response.statusText;
      }
      return response;
    })
    .catch((error) => {
      console.error("There was an error trying to retry message with the provided id: ", ids, "\n", error);
      throw error;
    });
}
