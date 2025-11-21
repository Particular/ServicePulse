import { acceptHMRUpdate, defineStore } from "pinia";
import { ref } from "vue";

export const useServiceControlStore = defineStore("ServiceControlStore", () => {
  const serviceControlUrl = ref<string | null>();

  function getServiceControlUrl() {
    if (!serviceControlUrl.value) {
      refresh();
    }
    if (!serviceControlUrl.value) {
      throw new Error("Service Control URL is not configured");
    }
    return serviceControlUrl.value;
  }

  function refresh() {
    const searchParams = new URLSearchParams(window.location.search);
    const scu = searchParams.get("scu");

    if (scu) {
      serviceControlUrl.value = scu;
      window.localStorage.setItem("scu", serviceControlUrl.value);
      console.debug(`ServiceControl Url found in QS and stored in local storage: ${serviceControlUrl.value}`);
    } else if (window.localStorage.getItem("scu")) {
      serviceControlUrl.value = window.localStorage.getItem("scu");
      console.debug(`ServiceControl Url, not in QS, found in local storage: ${serviceControlUrl.value}`);
    } else if (window.defaultConfig && window.defaultConfig.service_control_url) {
      serviceControlUrl.value = window.defaultConfig.service_control_url;
      console.debug(`setting ServiceControl Url to its default value: ${window.defaultConfig.service_control_url}`);
    } else {
      console.warn("ServiceControl Url is not defined.");
    }
  }

  async function fetchFromServiceControl(suffix: string, options?: { cache?: RequestCache }) {
    const requestOptions: RequestInit = {
      method: "GET",
      cache: options?.cache ?? "default", // Default  if not specified
      headers: {
        Accept: "application/json",
      },
    };
    return await fetch(`${getServiceControlUrl()}${suffix}`, requestOptions);
  }

  async function fetchTypedFromServiceControl<T>(suffix: string): Promise<[Response, T]> {
    const response = await fetch(`${getServiceControlUrl()}${suffix}`);
    if (!response.ok) throw new Error(response.statusText ?? "No response");
    const data = await response.json();

    return [response, data];
  }

  async function postToServiceControl(suffix: string, payload: object | null = null) {
    const requestOptions: RequestInit = {
      method: "POST",
    };
    if (payload != null) {
      requestOptions.headers = { "Content-Type": "application/json" };
      requestOptions.body = JSON.stringify(payload);
    }
    return await fetch(`${getServiceControlUrl()}${suffix}`, requestOptions);
  }

  async function putToServiceControl(suffix: string, payload: object | null) {
    const requestOptions: RequestInit = {
      method: "PUT",
    };
    if (payload != null) {
      requestOptions.headers = { "Content-Type": "application/json" };
      requestOptions.body = JSON.stringify(payload);
    }
    return await fetch(`${getServiceControlUrl()}${suffix}`, requestOptions);
  }

  async function deleteFromServiceControl(suffix: string) {
    const requestOptions: RequestInit = {
      method: "DELETE",
    };
    return await fetch(`${getServiceControlUrl()}${suffix}`, requestOptions);
  }

  async function patchToServiceControl(suffix: string, payload: object | null) {
    const requestOptions: RequestInit = {
      method: "PATCH",
    };
    if (payload != null) {
      requestOptions.headers = { "Content-Type": "application/json" };
      requestOptions.body = JSON.stringify(payload);
    }
    return await fetch(`${getServiceControlUrl()}${suffix}`, requestOptions);
  }

  return {
    refresh,
    serviceControlUrl,
    fetchFromServiceControl,
    fetchTypedFromServiceControl,
    putToServiceControl,
    postToServiceControl,
    patchToServiceControl,
    deleteFromServiceControl,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useServiceControlStore, import.meta.hot));
}

export type ServiceControlStore = ReturnType<typeof useServiceControlStore>;
