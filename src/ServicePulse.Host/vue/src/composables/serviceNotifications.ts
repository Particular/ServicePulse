import { useFetchFromServiceControl, usePostToServiceControl } from "./serviceServiceControlUrls";

export function useEmailNotifications() {
  const emailNotificationResults = getEmailNotifications();

  return Promise.all([emailNotificationResults])
    .then(([emailNotifications]) => {
      return emailNotifications;
    })
    .catch((err) => {
      console.log(err);
    });
}

function getEmailNotifications() {
  return useFetchFromServiceControl("notifications/email")
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      console.log(err);
      const result = {
        enabled: false,
        enable_tls: false,
      };
      return result;
    });
}

export function useUpdateEmailNotifications(settings: object) {
  return usePostToServiceControl("notifications/email", settings)
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

export function useTestEmailNotifications() {
  return usePostToServiceControl("notifications/email/test", {})
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

export function useToggleEmailNotifications(enabled: boolean) {
  return usePostToServiceControl("notifications/email/toggle", {
    enabled: enabled,
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
