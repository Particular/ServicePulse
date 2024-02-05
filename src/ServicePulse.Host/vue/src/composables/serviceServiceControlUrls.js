import { ref } from "vue";

export const serviceControlUrl = ref(null);
export const monitoringUrl = ref(null);

export function useIsMonitoringDisabled() {
  return monitoringUrl.value === null || monitoringUrl.value === "" || monitoringUrl.value === "!";
}

export function useIsMonitoringEnabled() {
  return !useIsMonitoringDisabled();
}

export function useFetchFromServiceControl(suffix) {
  return fetch(serviceControlUrl.value + suffix);
}

export function useFetchFromMonitoring(suffix) {
  if (useIsMonitoringDisabled()) {
    return Promise.resolve(null);
  }
  return fetch(monitoringUrl.value + suffix);
}

export function usePostToServiceControl(suffix, payload) {
  const requestOptions = {
    method: "POST",
  };
  if (payload !== undefined) {
    requestOptions.headers = { "Content-Type": "application/json" };
    requestOptions.body = JSON.stringify(payload);
  }
  return fetch(serviceControlUrl.value + suffix, requestOptions);
}

export function usePutToServiceControl(suffix, payload) {
  const requestOptions = {
    method: "PUT",
  };
  if (payload !== undefined) {
    requestOptions.headers = { "Content-Type": "application/json" };
    requestOptions.body = JSON.stringify(payload);
  }
  return fetch(serviceControlUrl.value + suffix, requestOptions);
}

export function useDeleteFromServiceControl(suffix) {
  const requestOptions = {
    method: "DELETE",
  };
  return fetch(serviceControlUrl.value + suffix, requestOptions);
}

export function usePatchToServiceControl(suffix, payload) {
  const requestOptions = {
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
    serviceControlUrl.value = window.localStorage.getItem("scu");
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
    monitoringUrl.value = window.localStorage.getItem("mu");
    console.debug(`Monitoring Url, not in QS, found in local storage: ${monitoringUrl.value}`);
  } else if (window.defaultConfig && window.defaultConfig.monitoring_urls && window.defaultConfig.monitoring_urls.length) {
    monitoringUrl.value = window.defaultConfig.monitoring_urls[0];
    console.debug(`setting Monitoring Url to its default value: ${window.defaultConfig.monitoring_urls[0]}`);
  } else {
    console.warn("Monitoring Url is not defined.");
  }

  return { serviceControlUrl, monitoringUrl };
}

export function updateServiceControlUrls(newServiceControlUrl, newMonitoringUrl) {
  if (!newServiceControlUrl.value) {
    throw "ServiceControl URL is mandatory";
  } else if (!newServiceControlUrl.value.endsWith("/")) {
    newServiceControlUrl.value += "/";
  }

  if (!newMonitoringUrl.value) {
    newMonitoringUrl.value = "!"; //disabled
  } else if (!newMonitoringUrl.value.endsWith("/") && newMonitoringUrl.value !== "!") {
    newMonitoringUrl.value += "/";
  }

  //values have changed. They'll be reset after page reloads
  window.localStorage.removeItem("scu");
  window.localStorage.removeItem("mu");

  const newSearch = "?scu=" + newServiceControlUrl.value + "&mu=" + newMonitoringUrl.value;
  console.debug("updateConnections - new query string: ", newSearch);
  window.location.search = newSearch;
}

function getParams() {
  if (!window.location.search) return params;

  const searchParams = window.location.search.split("&");
  var params = [];
  searchParams.forEach((p) => {
    p = p.startsWith("?") ? p.substring(1, p.length) : p;
    const singleParam = p.split("=");
    params.push({ name: singleParam[0], value: singleParam[1] });
  });
  return params;
}

function getParameter(params, key) {
  if (params) {
    return params.find((param) => {
      return param.name === key;
    });
  }

  return undefined;
}
