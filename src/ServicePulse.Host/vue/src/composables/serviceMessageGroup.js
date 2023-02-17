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
    })
    .catch((err) => {
      console.log(err);
      var result = {
        message: "error",
      };
      return result;
    });
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
  return usePostToServiceControl("recoverability/groups/" + groupId + "/comment?comment=" + comment)
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
//archive exception group by group id
//archiveGroup
export function useArchiveExceptionGroup(groupId) {
    return usePostToServiceControl(
        "recoverability/groups/" + groupId + "/errors/archive"
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


//restore exception group by group id
//restoreGroup
export function useRestoreExceptionGroup(groupId) {
    return usePostToServiceControl(
        "recoverability/groups/" + groupId + "/errors/unarchive"
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

//retry exception group by group id
//retryGroup
export function useRetryExceptionGroup(groupId) {
    return usePostToServiceControl(
        "recoverability/groups/" + groupId + "/errors/retry"
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

//acknowledge archive exception group by group id
export function useAcknowledgeArchiveGroup(groupId) {
    return useDeleteFromServiceControl(
        "recoverability/unacknowledgedgroups/" + groupId
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