import { ref } from "vue";

export const serviceControlUrl = ref<string>();
export const monitoringUrl = ref<string>();

export function useIsMonitoringDisabled() {
  return monitoringUrl.value === undefined || monitoringUrl.value === "" || monitoringUrl.value === "!";
}

export function useIsMonitoringEnabled() {
  return !useIsMonitoringDisabled();
}

export function useFetchFromServiceControl(suffix: string) {
  return fetch(serviceControlUrl.value + suffix);
}

export async function useFetchFromServiceControl2<T>(suffix: string): Promise<[Response, T]> {
  const response = await fetch(serviceControlUrl.value + suffix);
  const data = await response.json();

  return [response, data];
}

export function useFetchFromMonitoring(suffix: string) {
  if (useIsMonitoringDisabled()) {
    return Promise.resolve(undefined);
  }
  return fetch(monitoringUrl.value + suffix);
}

export function usePostToServiceControl(suffix: string, payload: object | undefined = undefined) {
  const requestOptions: RequestInit = {
    method: "POST",
  };
  if (payload !== undefined) {
    requestOptions.headers = { "Content-Type": "application/json" };
    requestOptions.body = JSON.stringify(payload);
  }
  return fetch(serviceControlUrl.value + suffix, requestOptions);
}

export function usePutToServiceControl(suffix: string, payload: object) {
  const requestOptions: RequestInit = {
    method: "PUT",
  };
  if (payload !== undefined) {
    requestOptions.headers = { "Content-Type": "application/json" };
    requestOptions.body = JSON.stringify(payload);
  }
  return fetch(serviceControlUrl.value + suffix, requestOptions);
}

export function useDeleteFromServiceControl(suffix: string) {
  const requestOptions: RequestInit = {
    method: "DELETE",
  };
  return fetch(serviceControlUrl.value + suffix, requestOptions);
}

export function usePatchToServiceControl(suffix: string, payload: object) {
  const requestOptions: RequestInit = {
    method: "PATCH",
  };
  if (payload !== undefined) {
    requestOptions.headers = { "Content-Type": "application/json" };
    requestOptions.body = JSON.stringify(payload);
  }
  return fetch(serviceControlUrl.value + suffix, requestOptions);
}

export function useServiceControlUrls() {
  const params = getParams();
  const scu = getParameter(params, "scu");
  const mu = getParameter(params, "mu");

  if (scu) {
    serviceControlUrl.value = scu.value;
    window.localStorage.setItem("scu", serviceControlUrl.value);
    console.debug(`ServiceControl Url found in QS and stored in local storage: ${serviceControlUrl.value}`);
  } else if (window.localStorage.getItem("scu")) {
    serviceControlUrl.value = window.localStorage.getItem("scu") || undefined;
    console.debug(`ServiceControl Url, not in QS, found in local storage: ${serviceControlUrl.value}`);
  } else if (window.defaultConfig && window.defaultConfig.service_control_url) {
    serviceControlUrl.value = window.defaultConfig.service_control_url;
    console.debug(`setting ServiceControl Url to its default value: ${window.defaultConfig.service_control_url}`);
  } else {
    console.warn("ServiceControl Url is not defined.");
  }

  if (mu) {
    monitoringUrl.value = mu.value;
    window.localStorage.setItem("mu", monitoringUrl.value);
    console.debug(`Monitoring Url found in QS and stored in local storage: ${monitoringUrl.value}`);
  } else if (window.localStorage.getItem("mu")) {
    monitoringUrl.value = window.localStorage.getItem("mu") || undefined;
    console.debug(`Monitoring Url, not in QS, found in local storage: ${monitoringUrl.value}`);
  } else if (window.defaultConfig && window.defaultConfig.monitoring_urls && window.defaultConfig.monitoring_urls.length) {
    monitoringUrl.value = window.defaultConfig.monitoring_urls[0];
    console.debug(`setting Monitoring Url to its default value: ${window.defaultConfig.monitoring_urls[0]}`);
  } else {
    console.warn("Monitoring Url is not defined.");
  }

  return { serviceControlUrl, monitoringUrl };
}

interface Param {
  name: string;
  value: string;
}

function getParams() {
  const params: Param[] = [];

  if (!window.location.search) return params;

  const searchParams = window.location.search.split("&");

  searchParams.forEach((p) => {
    p = p.startsWith("?") ? p.substring(1, p.length) : p;
    const singleParam = p.split("=");
    params.push({ name: singleParam[0], value: singleParam[1] });
  });
  return params;
}

function getParameter(params: Param[], key: string) {
  if (params) {
    return params.find((param) => {
      return param.name === key;
    });
  }

  return undefined;
}
