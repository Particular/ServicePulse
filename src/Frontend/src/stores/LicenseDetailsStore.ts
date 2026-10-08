import { acceptHMRUpdate, defineStore } from "pinia";
import logger from "@/logger";
import { ref, watch } from "vue";
import createThroughputClient from "@/views/throughputreport/throughputClient";
import { Endpoint, EndpointSize, type Queue, type LicensedEndpointDetails, type ApiQueue, EndpointClassification } from "@/resources/LicenseDetails";
import serviceControlClient from "@/components/serviceControlClient";
import useIsLicenseDetailsSupported from "@/views/throughputreport/licenseDetails/isLicenseDetailsSupported";

export const useLicenseDetailsStore = defineStore("LicenseDetailsStore", () => {
  const isLicenseDetailsSupported = useIsLicenseDetailsSupported();

  const endpointSizes = ref<EndpointSize[]>([]);
  const endpoints = ref<Endpoint[]>([]);
  const infrastructureQueues = ref<Queue[]>([]);
  const excludedQueues = ref<Queue[]>([]);
  const unassignedQueues = ref<Queue[]>([]);
  const serviceEndDate = ref<Date>();
  const validId = ref<boolean>(true);
  const hasLicenseDetails = ref(false);
  const error = ref<string | null>();

  function reset() {
    endpointSizes.value = [];
    endpoints.value = [];
    infrastructureQueues.value = [];
    excludedQueues.value = [];
    hasLicenseDetails.value = false;
  }

  function excludeQueue(queue: Queue) {
    excludedQueues.value.push(queue);
    unassignedQueues.value = unassignedQueues.value.filter((unassigned) => unassigned !== queue);
  }

  function markQueueAsInfrastructure(queue: Queue) {
    infrastructureQueues.value.push(queue);
    unassignedQueues.value = unassignedQueues.value.filter((unassigned) => unassigned !== queue);
  }

  function createEndpointFromQueue(queue: Queue) {
    //max endpoint name length of 80 - take from the end to reduce chance of clashes
    let name = queue.details.name.substring(queue.details.name.length - 80);
    while (endpoints.value.find((endpoint) => endpoint.name === name)) {
      //NOTE that this could potentially lead to an infinite loop, if it finds more than 40 clashes
      // but the likelihood of this happening is infinitesimal so we're not handling it
      name = `${name}_1`.substring(name.length + 2 - 80);
    }
    const endpoint = new Endpoint(crypto.randomUUID(), name, [], EndpointClassification.Full, null, endpointSizes.value);
    addQueueToEndpoint(queue, endpoint);
    endpoints.value.push(endpoint);
  }

  function addQueueToEndpoint(queue: Queue, endpoint: Endpoint) {
    endpoint.queues.push(queue);
    unassignedQueues.value = unassignedQueues.value.filter((unassigned) => unassigned !== queue);
  }

  async function refresh() {
    if (!isLicenseDetailsSupported) {
      reset();
      return;
    }
    try {
      error.value = null;
      const [, data] = await serviceControlClient.fetchTypedFromServiceControl<LicensedEndpointDetails>("license/details");
      if (!data) {
        reset();
        return;
      }

      hasLicenseDetails.value = true;
      const throughputClient = createThroughputClient();
      const scQueues = await throughputClient.queues();

      const toQueue = (metaQ: ApiQueue) =>
        ({
          nameHash: metaQ.name_hash,
          scopeHash: metaQ.scope_hash,
          isAmended: metaQ.is_amended ?? false,
          details: scQueues.find((scQ) => scQ.name_hash === metaQ.name_hash && ((!metaQ.scope_hash && !scQ.scope_hash) || metaQ.scope_hash === scQ.scope_hash)),
        }) as Queue;

      const sortedProducts = data.products.toSorted((p1, p2) => (p1.monthly_throughput ?? Number.MAX_VALUE) - (p2.monthly_throughput ?? Number.MAX_VALUE));
      const sortedEndpointSizes = sortedProducts.map((product, i) => new EndpointSize(product.product_code, i > 0 ? (sortedProducts[i - 1].monthly_throughput ?? 0) + 1 : 0, product.monthly_throughput));
      endpointSizes.value = sortedEndpointSizes;
      endpoints.value = data.endpoints.map((metaEp) => new Endpoint(crypto.randomUUID(), metaEp.name, metaEp.queues.map(toQueue), metaEp.classification, sortedEndpointSizes.find((es) => es.name === metaEp.endpoint_size)!, sortedEndpointSizes));
      infrastructureQueues.value = data.infrastructure_queues.map(toQueue);
      excludedQueues.value = data.excluded_queues.map(toQueue);
      const assignedQueues = [...endpoints.value.flatMap((endpoint) => endpoint.queues), ...infrastructureQueues.value, ...excludedQueues.value];
      unassignedQueues.value = scQueues
        .filter((scQ) => !assignedQueues.find((queue) => scQ.name_hash === queue.nameHash && ((!queue.scopeHash && !scQ.scope_hash) || queue.scopeHash === scQ.scope_hash)))
        .map((scQ) => ({
          nameHash: scQ.name_hash,
          scopeHash: scQ.scope_hash ?? "",
          isAmended: false, //TODO: this may be true, if it was previously classified in the license metadata and the customer unassigns it
          details: scQ,
        }));
      serviceEndDate.value = new Date(data.service_end_date);
      validId.value = data.valid_id;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      error.value = `Error fetching endpoint metadata: ${err.message ?? err}`;
      logger.error("Error fetching endpoint metadata", err);
    }
  }

  async function uploadEndpointMetadata(file: File) {
    const response = await serviceControlClient.postFileToServiceControl("license/detailsUpload", file);
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Upload Failed: ${response.status} ${response.statusText} - ${text}`);
    }
    await refresh();
  }

  watch(isLicenseDetailsSupported, refresh, { immediate: true });

  return {
    endpoints,
    endpointSizes,
    infrastructureQueues,
    excludedQueues,
    unassignedQueues,
    serviceEndDate,
    validId,
    hasLicenseDetails,
    error,
    uploadEndpointMetadata,
    excludeQueue,
    markQueueAsInfrastructure,
    createEndpointFromQueue,
    addQueueToEndpoint,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useLicenseDetailsStore, import.meta.hot));
}

export type LicenseDetailsStore = ReturnType<typeof useLicenseDetailsStore>;
