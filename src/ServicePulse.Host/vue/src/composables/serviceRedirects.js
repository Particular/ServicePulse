//import { ref } from "vue";
import moment from "moment";

const redirects = {
  data: [],
  queues: [],
  total: 0,
};
export function useRedirects(serviceControlUrl) {
  return getRedirects(serviceControlUrl)
    .then(() => getKnownQueues(serviceControlUrl))
    .then(() => {
      if (redirects.data)
        redirects.data.forEach(function (item) {
          item.last_modified = moment
            .utc(item.last_modified)
            .local()
            .format("YYYY-MM-DDTHH:mm:ss");
        });
      return redirects;
    });
}

function getKnownQueues(serviceControlUrl) {
  return fetch(serviceControlUrl + `errors/queues/addresses`)
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

function getRedirects(serviceControlUrl) {
  return fetch(serviceControlUrl + "redirects")
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

export function retryPendingMessagesForQueue(serviceControlUrl, queueName) {
  const requestOptions = {
    method: "POST",
  };
  return fetch(
    serviceControlUrl + "errors/queues/" + queueName + "/retry",
    requestOptions
  )
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

export function useUpdateRedirects(
  serviceControlUrl,
  redirectId,
  sourceEndpoint,
  targetEndpoint
) {
  const requestOptions = {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: redirectId,
      fromphysicaladdress: sourceEndpoint,
      tophysicaladdress: targetEndpoint,
    }),
  };

  return fetch(serviceControlUrl + "redirects/" + redirectId, requestOptions)
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

export function useCreateRedirects(
  serviceControlUrl,
  sourceEndpoint,
  targetEndpoint
) {
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fromphysicaladdress: sourceEndpoint,
      tophysicaladdress: targetEndpoint,
    }),
  };

  return fetch(serviceControlUrl + "redirects", requestOptions)
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

export function useDeleteRedirects(serviceControlUrl, redirectId) {
  const requestOptions = {
    method: "DELETE",
  };

  return fetch(serviceControlUrl + "redirects/" + redirectId, requestOptions)
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
