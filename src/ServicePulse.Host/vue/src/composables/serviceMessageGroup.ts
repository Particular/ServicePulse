import {
  useDeleteFromServiceControl,
  usePostToServiceControl,
  useFetchFromServiceControl,
} from "./serviceServiceControlUrls";

export function useGetExceptionGroups(classifier) {
  return useFetchFromServiceControl(
    `recoverability/groups/${classifier ? classifier : ""}`,
  )
    .then((response) => {
      return response.json();
    })
    .catch((err) => {
      console.log(err);
      const result = {
        message: "error",
      };
      return result;
    });
}

//get all deleted message groups
export function useGetArchiveGroups(classifier) {
  return useFetchFromServiceControl(
    `errors/groups/${classifier ? classifier : ""}`,
  )
    .then((response) => {
      return response.json();
    })
    .catch((err) => {
      console.log(err);
      const result = {
        message: "error",
      };
      return result;
    });
}
//delete note by group id
export function useDeleteNote(groupId) {
  return useDeleteFromServiceControl(
    "recoverability/groups/" + groupId + "/comment",
  )
    .then((response) => {
      const result = {
        message: response.ok ? "success" : "error:" + response.statusText,
        status: response.status,
        statusText: response.statusText,
        data: response,
      };
      return result;
    })
    .catch((err) => {
      console.log(err);
      const result = {
        message: "error",
      };
      return result;
    });
}

//edit or create note by group id
export function useEditOrCreateNote(groupId, comment) {
  return usePostToServiceControl(
    "recoverability/groups/" + groupId + "/comment?comment=" + comment,
  )
    .then((response) => {
      const result = {
        message: response.ok ? "success" : "error:" + response.statusText,
        status: response.status,
        statusText: response.statusText,
        data: response,
      };
      return result;
    })
    .catch((err) => {
      console.log(err);
      const result = {
        message: "error",
      };
      return result;
    });
}
//archive exception group by group id
//archiveGroup
export function useArchiveExceptionGroup(groupId) {
  return usePostToServiceControl(
    "recoverability/groups/" + groupId + "/errors/archive",
  )
    .then((response) => {
      const result = {
        message: response.ok ? "success" : "error:" + response.statusText,
        status: response.status,
        statusText: response.statusText,
        data: response,
      };
      return result;
    })
    .catch((err) => {
      console.log(err);
      const result = {
        message: "error",
      };
      return result;
    });
}

//restore group by group id
export function useRestoreGroup(groupId) {
  return usePostToServiceControl(
    "recoverability/groups/" + groupId + "/errors/unarchive",
  )
    .then((response) => {
      const result = {
        message: response.ok ? "success" : "error:" + response.statusText,
        status: response.status,
        statusText: response.statusText,
        data: response,
      };
      return result;
    })
    .catch((err) => {
      console.log(err);
      const result = {
        message: "error",
      };
      return result;
    });
}

//retry exception group by group id
//retryGroup
export function useRetryExceptionGroup(groupId) {
  return usePostToServiceControl(
    "recoverability/groups/" + groupId + "/errors/retry",
  )
    .then((response) => {
      const result = {
        message: response.ok ? "success" : "error:" + response.statusText,
        status: response.status,
        statusText: response.statusText,
        data: response,
      };
      return result;
    })
    .catch((err) => {
      console.log(err);
      const result = {
        message: "error",
      };
      return result;
    });
}

//acknowledge archive exception group by group id
export function useAcknowledgeArchiveGroup(groupId) {
  return useDeleteFromServiceControl(
    "recoverability/unacknowledgedgroups/" + groupId,
  )
    .then((response) => {
      const result = {
        message: response.ok ? "success" : "error:" + response.statusText,
        status: response.status,
        statusText: response.statusText,
        data: response,
      };
      return result;
    })
    .catch((err) => {
      console.log(err);
      const result = {
        message: "error",
      };
      return result;
    });
}
