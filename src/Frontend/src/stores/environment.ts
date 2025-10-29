interface Param {
  name: string;
  value: string;
}

//TODO we probbly should use https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams#parsing_window.location
export function getParams() {
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

export function getParameter(params: Param[], key: string) {
  return params.find((param) => {
    return param.name === key;
  });
}
