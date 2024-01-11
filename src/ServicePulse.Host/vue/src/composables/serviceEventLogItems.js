import { useFetchFromServiceControl } from "./serviceServiceControlUrls";

export function useGetEventLogItems() {
  return useFetchFromServiceControl("eventlogitems")
    .then((response) => {
      return response.json();
    })
    .catch((err) => {
      console.log(err);
      var result = {
        message: "error"
      };
      return result;
    });
}