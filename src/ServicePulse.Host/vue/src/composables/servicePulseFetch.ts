const servicePulseFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const requestInit = init ?? {};
  requestInit.headers = new Headers(requestInit.headers);
  requestInit.headers.set("Particular-ServicePulse-Version", window.defaultConfig.version);

  return await fetch(input, requestInit);
};

export default servicePulseFetch;
