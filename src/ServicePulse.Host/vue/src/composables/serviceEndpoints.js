import { useFetchFromServiceControl } from "./serviceServiceControlUrls";

export class useEndpoints {
  async getQueueNames() {
    const response = await useFetchFromServiceControl("errors/queues/addresses");
    const data = await response.json();
    return data;
  }
}
