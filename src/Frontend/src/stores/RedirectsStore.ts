import Redirect from "@/resources/Redirect";
import QueueAddress from "@/resources/QueueAddress";
import { acceptHMRUpdate, defineStore } from "pinia";
import { reactive } from "vue";
import serviceControlClient from "@/components/serviceControlClient";
import useEnvironmentAndVersionsAutoRefresh from "@/composables/useEnvironmentAndVersionsAutoRefresh";
import { RetryRedirect } from "@/components/configuration/RetryRedirectEdit.vue";

export interface Redirects {
  data: Redirect[];
  queues: string[];
  total: number;
}

export const useRedirectsStore = defineStore("RedirectsStore", () => {
  const redirects = reactive<Redirects>({
    data: [],
    queues: [],
    total: 0,
  });

  const { store: environmentStore } = useEnvironmentAndVersionsAutoRefresh();
  const hasResponseStatusInHeader = environmentStore.serviceControlIsGreaterThan("5.2.0");

  async function getKnownQueues() {
    const [, data] = await serviceControlClient.fetchTypedFromServiceControl<QueueAddress[]>("errors/queues/addresses");
    redirects.queues = data.map((x) => x.physical_address);
  }

  async function getRedirects() {
    const [response, data] = await serviceControlClient.fetchTypedFromServiceControl<Redirect[]>("redirects");
    redirects.total = parseInt(response.headers.get("Total-Count") || "0");
    redirects.data = data;
  }

  async function refresh() {
    await Promise.all([getRedirects(), getKnownQueues()]);
  }

  async function retryPendingMessagesForQueue(queueName: string) {
    const response = await serviceControlClient.postToServiceControl(`errors/queues/${queueName}/retry`);
    return {
      message: response.ok ? "success" : `error:${response.statusText}`,
      status: response.status,
      statusText: response.statusText,
    };
  }

  async function updateRedirect(redirect: RetryRedirect) {
    return handleResponse(
      await serviceControlClient.putToServiceControl(`redirects/${redirect.redirectId}`, {
        id: redirect.redirectId,
        fromphysicaladdress: redirect.sourceQueue,
        tophysicaladdress: redirect.targetQueue,
      })
    );
  }

  async function createRedirect(redirect: RetryRedirect) {
    return handleResponse(
      await serviceControlClient.postToServiceControl("redirects", {
        fromphysicaladdress: redirect.sourceQueue,
        tophysicaladdress: redirect.targetQueue,
      })
    );
  }

  async function deleteRedirect(redirectId: string) {
    return handleResponse(await serviceControlClient.deleteFromServiceControl(`redirects/${redirectId}`));
  }

  function handleResponse(response: Response) {
    const responseStatusText = hasResponseStatusInHeader.value ? response.headers.get("X-Particular-Reason") : response.statusText;
    return {
      message: response.ok ? "success" : `error:${response.statusText}`,
      status: response.status,
      statusText: responseStatusText,
      data: response,
    };
  }

  return { refresh, redirects, retryPendingMessagesForQueue, createRedirect, updateRedirect, deleteRedirect };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useRedirectsStore, import.meta.hot));
}

export type RedirectsStore = ReturnType<typeof useRedirectsStore>;
