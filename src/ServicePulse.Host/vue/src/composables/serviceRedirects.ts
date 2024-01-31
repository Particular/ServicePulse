import { useDeleteFromServiceControl, useFetchFromServiceControl2, usePostToServiceControl, usePutToServiceControl } from "./serviceServiceControlUrls";

interface Redirects {
  data: Redirect[];
  queues: string[];
  total: number;
}

const redirects: Redirects = {
  data: [],
  queues: [],
  total: 0,
};

export async function useRedirects() {
  await getRedirects();
  await getKnownQueues();

  return redirects;
}

interface QueueAddress {
  physical_address: string;
  FailedMessageCount: number;
}
async function getKnownQueues() {
  try {
    const [_, data] = await useFetchFromServiceControl2<QueueAddress[]>(`errors/queues/addresses`);
    if (data) {
      redirects.queues = data.map((x) => x.physical_address);
    }
  } catch (err) {
    console.log(err);
  }
}

interface Redirect {
  MessageRedirectId: string;
  FromPhysicalAddress: string;
  ToPhysicalAddress: string;
  LastModified: string;
}

async function getRedirects() {
  try {
    let [response, data] = await useFetchFromServiceControl2<Redirect[]>("redirects");
    redirects.total = parseInt(response.headers.get("Total-Count") || "0");
    redirects.data = data;
  } catch (err) {
    console.log(err);
  }
}

export async function useRetryPendingMessagesForQueue(queueName: string) {
  try {
    let response = await usePostToServiceControl("errors/queues/" + queueName + "/retry");
    const result = {
      message: response.ok ? "success" : "error:" + response.statusText,
      status: response.status,
      statusText: response.statusText,
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

export function useUpdateRedirects(redirectId: string, sourceEndpoint: string, targetEndpoint: string) {
  return usePutToServiceControl("redirects/" + redirectId, {
    id: redirectId,
    fromphysicaladdress: sourceEndpoint,
    tophysicaladdress: targetEndpoint,
  })
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

export function useCreateRedirects(sourceEndpoint: string, targetEndpoint: string) {
  return usePostToServiceControl("redirects", {
    fromphysicaladdress: sourceEndpoint,
    tophysicaladdress: targetEndpoint,
  })
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

export function useDeleteRedirects(redirectId: string) {
  return useDeleteFromServiceControl("redirects/" + redirectId)
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
