import { ref } from "vue";

export function useEmailNotifications(serviceControlUrl) {
  const emailNotificationResults = getEmailNotifications(serviceControlUrl);

  return Promise.all([emailNotificationResults])
    .then(([emailNotifications]) => {
      return emailNotifications;
    })
    .catch((err) => {
      console.log(err);
    });
}

function getEmailNotifications(serviceControlUrl) {
  return fetch(serviceControlUrl + "notifications/email")
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      console.log(err);
      var result = {
        enabled: false,
        enable_tls: false,
      };
      return result;
    });
}

export function useUpdateEmailNotifications(serviceControlUrl, settings) {
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  };

  return fetch(serviceControlUrl + "notifications/email", requestOptions)
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

export function useTestEmailNotifications(serviceControlUrl) {
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  };

  return fetch(serviceControlUrl + "notifications/email/test", requestOptions)
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

export function useToggleEmailNotifications(serviceControlUrl, enabled) {
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ enabled: enabled }),
  };

  return fetch(serviceControlUrl + "notifications/email/toggle", requestOptions)
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
