import { useDeleteFromServiceControl, usePostToServiceControl, usePutToServiceControl, useTypedFetchFromServiceControl } from "./serviceServiceControlUrls";

interface Redirect {
  message_redirect_id: string;
  from_physical_address: string;
  to_physical_address: string;
  last_modified: string;
}

interface Redirects {
  data: Redirect[];
  queues: string[];
  total: number;
}

interface QueueAddress {
  physical_address: string;
  failed_message_count: number;
}

export async function useRedirects() {
  const redirects: Redirects = {
    data: [],
    queues: [],
    total: 0,
  };

  async function getKnownQueues() {
    const [, data] = await useTypedFetchFromServiceControl<QueueAddress[]>("errors/queues/addresses");
    redirects.queues = data.map((x) => x.physical_address);
  }

  async function getRedirects() {
    const [response, data] = await useTypedFetchFromServiceControl<Redirect[]>("redirects");
    redirects.total = parseInt(response.headers.get("Total-Count") || "0");
    redirects.data = data;
  }

  await Promise.all([getRedirects(), getKnownQueues()]);

  return redirects;
}

export async function useRetryPendingMessagesForQueue(queueName: string) {
  const response = await usePostToServiceControl(`errors/queues/${queueName}/retry`);
  return {
    message: response.ok ? "success" : `error:${response.statusText}`,
    status: response.status,
    statusText: response.statusText,
  };
}

export async function useUpdateRedirects(redirectId: string, sourceEndpoint: string, targetEndpoint: string) {
  const response = await usePutToServiceControl(`redirects/${redirectId}`, {
    id: redirectId,
    fromphysicaladdress: sourceEndpoint,
    tophysicaladdress: targetEndpoint,
  });
  return {
    message: response.ok ? "success" : `error:${response.statusText}`,
    status: response.status,
    statusText: response.statusText,
    data: response,
  };
}

export async function useCreateRedirects(sourceEndpoint: string, targetEndpoint: string) {
  const response = await usePostToServiceControl("redirects", {
    fromphysicaladdress: sourceEndpoint,
    tophysicaladdress: targetEndpoint,
  });
  return {
    message: response.ok ? "success" : `error:${response.statusText}`,
    status: response.status,
    statusText: response.statusText,
  };
}

export async function useDeleteRedirects(redirectId: string) {
  const response = await useDeleteFromServiceControl(`redirects/${redirectId}`);
  return {
    message: response.ok ? "success" : `error:${response.statusText}`,
    status: response.status,
    statusText: response.statusText,
    data: response,
  };
}
