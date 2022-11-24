import {
  fetchFromServiceControl,
  deleteFromServiceControl,
  putToServiceControl,
  postToServiceControl,
} from "./serviceServiceControlUrls.js";

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
  return fetchFromServiceControl(`errors/queues/addresses`)
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
  return fetchFromServiceControl("redirects")
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

export function retryPendingMessagesForQueue(queueName) {
  return postToServiceControl("errors/queues/" + queueName + "/retry")
    .then((response) => {
      var result = {
        message: response.ok ? "success" : "error:" + response.statusText,
        status: response.status,
        statusText: response.statusText,
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

export function useUpdateRedirects(redirectId, sourceEndpoint, targetEndpoint) {
  return putToServiceControl("redirects/" + redirectId, {
    id: redirectId,
    fromphysicaladdress: sourceEndpoint,
    tophysicaladdress: targetEndpoint,
  })
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

export function useCreateRedirects(sourceEndpoint, targetEndpoint) {
  return postToServiceControl("redirects", {
    fromphysicaladdress: sourceEndpoint,
    tophysicaladdress: targetEndpoint,
  })
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

export function useDeleteRedirects(redirectId) {
  return deleteFromServiceControl("redirects/" + redirectId)
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
