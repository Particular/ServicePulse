import {
  useDeleteFromServiceControl,
  usePostToServiceControl,
  useFetchFromServiceControl,
} from "./serviceServiceControlUrls.js";


export function useGetExceptionGroups() {
    //todo - add sort, page and classifers
    return useFetchFromServiceControl("recoverability/groups")
        .then((response) => {
            return response.json();
            //var result = {
            //    message: response.ok ? "success" : "error:" + response.statusText,
            //    status: response.status,
            //    statusText: response.statusText,
            //    data: response.json(),
            //};
            //return response.json();
        })
        .catch((err) => {
            var result = {
                message: "error",
            };
            return result;
        });
}



//get Exception groups count
function getExceptionGroupsCount(groupId, sortBy, page) {
    var url =
        "/recoverability/groups" +
        groupId +
        "errors?page=" +
        page +
        "&sort=" +
        sortBy +
        "&status=unresolved";
    return fetchWithErrorHandling(
        () => useFetchFromServiceControl(url),
        connectionState,
        (response) => parseInt(response.headers.get("Total-Count"))
    );
}


//delete note by group id
export function useDeleteNote(groupId) {
  return useDeleteFromServiceControl(
    "recoverability/groups/" + groupId + "/comment"
  )
    .then((response) => {
      var result = {
        message: response.ok ? "success" : "error:" + response.statusText,
        status: response.status,
        statusText: response.statusText,
        data: response,
      };
      return result;
    })
    .catch((err) => {
      console.log(err);
      var result = {
        message: "error",
      };
      return result;
    });
}

//edit or create note by group id
export function useEditOrCreateNote(groupId, comment) {
  return usePostToServiceControl(
    "recoverability/groups/" + groupId + "/comment?comment=" + comment
  )
    .then((response) => {
      var result = {
        message: response.ok ? "success" : "error:" + response.statusText,
        status: response.status,
        statusText: response.statusText,
        data: response,
      };
      return result;
    })
    .catch((err) => {
      console.log(err);
      var result = {
        message: "error",
      };
      return result;
    });
}
