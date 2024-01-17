import {
  useFetchFromServiceControl,
  useDeleteFromServiceControl,
  usePutToServiceControl,
  usePostToServiceControl,
} from "./serviceServiceControlUrls";

const redirects = {
  data: [],
  queues: [],
  total: 0,
};
export function useRedirects() {
  return getRedirects()
    .then(() => getKnownQueues())
    .then(() => {
      return redirects;
    });
}

function getKnownQueues() {
  return useFetchFromServiceControl(`errors/queues/addresses`)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      if (data) {
        redirects.queues = data.map((x) => x.physical_address);
      }
    })
    .catch((err) => {
      console.log(err);
    });
}

function getRedirects() {
  return useFetchFromServiceControl("redirects")
    .then((response) => {
      redirects.total = parseInt(response.headers.get("Total-Count"));
      return response.json();
    })
    .then((data) => {
      redirects.data = data;
    })
    .catch((err) => {
      console.log(err);
    });
}

export function useRetryPendingMessagesForQueue(queueName) {
  return usePostToServiceControl("errors/queues/" + queueName + "/retry")
    .then((response) => {
      const result = {
        message: response.ok ? "success" : "error:" + response.statusText,
        status: response.status,
        statusText: response.statusText,
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

export function useUpdateRedirects(redirectId, sourceEndpoint, targetEndpoint) {
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

export function useCreateRedirects(sourceEndpoint, targetEndpoint) {
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

export function useDeleteRedirects(redirectId) {
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
