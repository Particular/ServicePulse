import { useFetchFromServiceControl, usePostToServiceControl } from "./serviceServiceControlUrls";

export async function useEmailNotifications() {
  try {
    const emailNotifications = await getEmailNotifications();
    return emailNotifications;
  } catch (err) {
    console.log(err);
  }
}

async function getEmailNotifications() {
  try {
    const response = await useFetchFromServiceControl("notifications/email");
    const data = await response.json();
    return data;
  } catch (err) {
    console.log(err);
    const result = {
      enabled: false,
      enable_tls: false,
    };
    return result;
  }
}

export async function useUpdateEmailNotifications(settings) {
  try {
    const response = await usePostToServiceControl("notifications/email", settings);
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

export async function useTestEmailNotifications() {
  try {
    const response = await usePostToServiceControl("notifications/email/test", {});
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

export async function useToggleEmailNotifications(enabled) {
  try {
    const response = await usePostToServiceControl("notifications/email/toggle", {
      enabled: enabled,
    });
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
