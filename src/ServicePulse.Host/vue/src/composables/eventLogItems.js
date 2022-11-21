export function getEventLogItems(serviceControlUrl) {
  var url = serviceControlUrl.value + "eventlogitems";

  return fetch(url).then((response) => {
    return response.json();
  });
}
