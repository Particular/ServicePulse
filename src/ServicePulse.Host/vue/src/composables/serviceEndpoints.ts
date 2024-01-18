import { useFetchFromServiceControl } from "./serviceServiceControlUrls";

export class useEndpoints {
  getQueueNames() {
    return useFetchFromServiceControl("errors/queues/addresses").then((response) => {
      return response.json();
    });
  }
}
