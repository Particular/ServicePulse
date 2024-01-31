import { useDeleteFromServiceControl, usePostToServiceControl, useFetchFromServiceControl } from "./serviceServiceControlUrls.js";

export async function useGetExceptionGroups(classifier) {
  try {
    const response = await useFetchFromServiceControl(`recoverability/groups/${classifier ? classifier : ""}`);
    const data = await response.json();
    return data;
  } catch (err) {
    console.log(err);
    var result = {
      message: "error",
    };
    return result;
  }
}

//get all deleted message groups
export async function useGetArchiveGroups(classifier) {
  try {
    const response = await useFetchFromServiceControl(`errors/groups/${classifier ? classifier : ""}`);
    const data = await response.json();
    return data;
  } catch (err) {
    console.log(err);
    var result = {
      message: "error",
    };
    return result;
  }
}
//delete note by group id
export async function useDeleteNote(groupId) {
  try {
    const response = await useDeleteFromServiceControl("recoverability/groups/" + groupId + "/comment");
    const result = {
      message: response.ok ? "success" : "error:" + response.statusText,
      status: response.status,
      statusText: response.statusText,
      data: response,
    };
    return result;
  } catch (err) {
    console.log(err);
    const result = {
      message: "error",
    };
    return result;
  }
}

//edit or create note by group id
export async function useEditOrCreateNote(groupId, comment) {
  try {
    const response = await usePostToServiceControl("recoverability/groups/" + groupId + "/comment?comment=" + comment);
    const result = {
      message: response.ok ? "success" : "error:" + response.statusText,
      status: response.status,
      statusText: response.statusText,
      data: response,
    };
    return result;
  } catch (err) {
    console.log(err);
    const result = {
      message: "error",
    };
    return result;
  }
}
//archive exception group by group id
//archiveGroup
export async function useArchiveExceptionGroup(groupId) {
  try {
    const response = await usePostToServiceControl("recoverability/groups/" + groupId + "/errors/archive");
    const result = {
      message: response.ok ? "success" : "error:" + response.statusText,
      status: response.status,
      statusText: response.statusText,
      data: response,
    };
    return result;
  } catch (err) {
    console.log(err);
    const result = {
      message: "error",
    };
    return result;
  }
}

//restore group by group id
export async function useRestoreGroup(groupId) {
  try {
    const response = await usePostToServiceControl("recoverability/groups/" + groupId + "/errors/unarchive");
    const result = {
      message: response.ok ? "success" : "error:" + response.statusText,
      status: response.status,
      statusText: response.statusText,
      data: response,
    };
    return result;
  } catch (err) {
    console.log(err);
    const result = {
      message: "error",
    };
    return result;
  }
}

//retry exception group by group id
//retryGroup
export async function useRetryExceptionGroup(groupId) {
  try {
    const response = await usePostToServiceControl("recoverability/groups/" + groupId + "/errors/retry");
    const result = {
      message: response.ok ? "success" : "error:" + response.statusText,
      status: response.status,
      statusText: response.statusText,
      data: response,
    };
    return result;
  } catch (err) {
    console.log(err);
    const result = {
      message: "error",
    };
    return result;
  }
}

//acknowledge archive exception group by group id
export async function useAcknowledgeArchiveGroup(groupId) {
  try {
    const response = await useDeleteFromServiceControl("recoverability/unacknowledgedgroups/" + groupId);
    const result = {
      message: response.ok ? "success" : "error:" + response.statusText,
      status: response.status,
      statusText: response.statusText,
      data: response,
    };
    return result;
  } catch (err) {
    console.log(err);
    const result = {
      message: "error",
    };
    return result;
  }
}
