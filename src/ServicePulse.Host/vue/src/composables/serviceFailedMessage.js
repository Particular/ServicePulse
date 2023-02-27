import { usePatchToServiceControl } from "./serviceServiceControlUrls";

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