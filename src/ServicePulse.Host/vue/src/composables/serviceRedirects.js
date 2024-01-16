import { useFetchFromServiceControl, useDeleteFromServiceControl, usePutToServiceControl, usePostToServiceControl } from "./serviceServiceControlUrls.js";

const redirects = {
  data: [],
  queues: [],
  total: 0,
};
export async function useRedirects() {
  await getRedirects();
  await getKnownQueues();
  return redirects;
}

async function getKnownQueues() {
  try {
    const response = await useFetchFromServiceControl(`errors/queues/addresses`);
    const data = await response.json();
    if (data) {
      redirects.queues = data.map((x) => x.physical_address);
    }
  } catch (err) {
    console.log(err);
  }
}

async function getRedirects() {
  try {
    const response = await useFetchFromServiceControl("redirects");
    redirects.total = parseInt(response.headers.get("Total-Count"));
    const data = await response.json();
    redirects.data = data;
  } catch (err) {
    console.log(err);
  }
}

export async function useRetryPendingMessagesForQueue(queueName) {
  try {
    const response = await usePostToServiceControl("errors/queues/" + queueName + "/retry");
    var result = {
      message: response.ok ? "success" : "error:" + response.statusText,
      status: response.status,
      statusText: response.statusText,
    };
    return result;
  } catch (err) {
    console.log(err);
    var result_1 = {
      message: "error",
    };
    return result_1;
  }
}

export async function useUpdateRedirects(redirectId, sourceEndpoint, targetEndpoint) {
  try {
    const response = await usePutToServiceControl("redirects/" + redirectId, {
      id: redirectId,
      fromphysicaladdress: sourceEndpoint,
      tophysicaladdress: targetEndpoint,
    });
    var result = {
      message: response.ok ? "success" : "error:" + response.statusText,
      status: response.status,
      statusText: response.statusText,
      data: response,
    };
    return result;
  } catch (err) {
    console.log(err);
    var result_1 = {
      message: "error",
    };
    return result_1;
  }
}

export async function useCreateRedirects(sourceEndpoint, targetEndpoint) {
  try {
    const response = await usePostToServiceControl("redirects", {
      fromphysicaladdress: sourceEndpoint,
      tophysicaladdress: targetEndpoint,
    });
    var result = {
      message: response.ok ? "success" : "error:" + response.statusText,
      status: response.status,
      statusText: response.statusText,
      data: response,
    };
    return result;
  } catch (err) {
    console.log(err);
    var result_1 = {
      message: "error",
    };
    return result_1;
  }
}

export async function useDeleteRedirects(redirectId) {
  try {
    const response = await useDeleteFromServiceControl("redirects/" + redirectId);
    var result = {
      message: response.ok ? "success" : "error:" + response.statusText,
      status: response.status,
      statusText: response.statusText,
      data: response,
    };
    return result;
  } catch (err) {
    console.log(err);
    var result_1 = {
      message: "error",
    };
    return result_1;
  }
}
