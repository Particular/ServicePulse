import { usePatchToServiceControl, useFetchFromServiceControl } from "./serviceServiceControlUrls";

export function useUnarchiveMessage(ids) {
  return usePatchToServiceControl("errors/unarchive/", ids)
    .then(async (response) => {
      return JSON.stringify(response);
    })
    .then(() => {
      return checkMessageArchiveStatus(ids);
    })
    .catch((error) => {
      console.error("There was an error!", error);
    });
}

function checkMessageArchiveStatus(ids) {
  return useFetchFromServiceControl("errors/last/" + ids[0])
    .then((response) => {
      if (response.status === 404) {
        return false;
      } else if (response.status !== 200) {
        return false;
      }
      return response.json();
    })
    .then((data) => {
      var message = data;
      if (message.status !== "archived" && message.status !== undefined) {
        return true;
      }
      return false;
    })
    .catch((err) => {
      console.log(err);
      return false;
    });
}
