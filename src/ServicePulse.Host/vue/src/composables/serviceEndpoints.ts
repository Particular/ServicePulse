import { useTypedFetchFromServiceControl } from "./serviceServiceControlUrls";
import type QueueAddress from "@/resources/QueueAddress";

export class useEndpoints {
  async getQueueNames() {
    const [, data] = await useTypedFetchFromServiceControl<QueueAddress>("errors/queues/addresses");
    return data;
  }
}
