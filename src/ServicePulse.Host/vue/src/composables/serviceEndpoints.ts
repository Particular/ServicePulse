import { useFetchFromServiceControl } from "./serviceServiceControlUrls";

export class useEndpoints {
  async getQueueNames() {
    const response = await useFetchFromServiceControl("errors/queues/addresses");
    return response.json();
  }
}
