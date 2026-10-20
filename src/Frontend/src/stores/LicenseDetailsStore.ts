import { acceptHMRUpdate, defineStore } from "pinia";
import logger from "@/logger";
import { computed, ref, watch } from "vue";
import createThroughputClient from "@/views/throughputreport/throughputClient";
import { Endpoint, EndpointSize, type Queue, type LicensedEndpointDetails, type ApiQueue, EndpointClassification } from "@/resources/LicenseDetails";
import serviceControlClient from "@/components/serviceControlClient";
import useIsLicenseDetailsSupported from "@/views/throughputreport/licenseDetails/isLicenseDetailsSupported";
import { useShowToast } from "@/composables/toast";
import { TYPE } from "vue-toastification";

export const useLicenseDetailsStore = defineStore("LicenseDetailsStore", () => {
  const isLicenseDetailsSupported = useIsLicenseDetailsSupported();

  const endpointSizes = ref<EndpointSize[]>([]);
  const endpoints = ref<Endpoint[]>([]);
  const infrastructureQueues = ref<Queue[]>([]);
  const excludedQueues = ref<Queue[]>([]);
  const unassignedQueues = ref<Queue[]>([]);
  /** stores queues that have no mapped details (so we don't want them in unassigned), but were previously assigned */
  const unmappedQueues = ref<Queue[]>([]);
  const serviceEndDate = ref<Date>();
  const validId = ref<boolean>(true);
  const hasLicenseDetails = ref(false);
  const hasChanges = ref(false);
  const removedEndpoints = ref<string[]>([]);
  const saving = ref(false);
  const error = ref<string | null>();

  function reset() {
    endpointSizes.value = [];
    endpoints.value = [];
    infrastructureQueues.value = [];
    excludedQueues.value = [];
    unassignedQueues.value = [];
    unmappedQueues.value = [];
    hasLicenseDetails.value = false;
    hasChanges.value = false;
    removedEndpoints.value = [];
    serviceEndDate.value = undefined;
    validId.value = true;
    error.value = null;
  }

  function excludeQueue(queue: Queue) {
    excludedQueues.value.push(queue);
    unassignedQueues.value = unassignedQueues.value.filter((unassigned) => unassigned !== queue);
    hasChanges.value = true;
  }

  function unexcludeQueue(queue: Queue) {
    excludedQueues.value = excludedQueues.value.filter((assigned) => assigned !== queue);
    returnToUnassigned(queue);
    hasChanges.value = true;
  }

  function markQueueAsInfrastructure(queue: Queue) {
    infrastructureQueues.value.push(queue);
    unassignedQueues.value = unassignedQueues.value.filter((unassigned) => unassigned !== queue);
    hasChanges.value = true;
  }

  function unmarkQueueAsInfrastructure(queue: Queue) {
    infrastructureQueues.value = infrastructureQueues.value.filter((assigned) => assigned !== queue);
    returnToUnassigned(queue);
    hasChanges.value = true;
  }

  function returnToUnassigned(queue: Queue) {
    if (queue.details) unassignedQueues.value.push(queue);
    else unmappedQueues.value.push(queue);
    hasChanges.value = true;
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
    hasChanges.value = true;
  }

  function removeQueueFromEndpoint(queue: Queue, endpoint: Endpoint) {
    endpoint.queues = endpoint.queues.filter((assigned) => assigned !== queue);
    //TODO
    //endpoint.excludeThroughput = endpoint.excludeThroughput.filter((et) => !queue.matches(et));
    returnToUnassigned(queue);
  }

  function removeEndpoint(endpoint: Endpoint) {
    endpoints.value = endpoints.value.filter((e) => e !== endpoint);
    endpoint.queues.forEach((queue) => returnToUnassigned(queue));
    removedEndpoints.value.push(endpoint.clientId);
  }

  function renameEndpoint(endpoint: Endpoint, name: string) {
    endpoint.name = name;
    endpoint.amended = true;
    hasChanges.value = true;
  }

  function reclassifyEndpoint(endpoint: Endpoint, classification: EndpointClassification) {
    endpoint.classification = classification;
    endpoint.amended = true;
    hasChanges.value = true;
  }

  async function refresh() {
    if (!isLicenseDetailsSupported.value) {
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
          originalLocation: metaQ.original_location,
          details: scQueues.find((scQ) => scQ.name_hash === metaQ.name_hash && ((!metaQ.scope_hash && !scQ.scope_hash) || metaQ.scope_hash === scQ.scope_hash)),
        }) as Queue;

      const sortedProducts = data.products.toSorted((p1, p2) => (p1.monthly_throughput ?? Number.MAX_VALUE) - (p2.monthly_throughput ?? Number.MAX_VALUE));
      const sortedEndpointSizes = sortedProducts.map((product, i) => new EndpointSize(product.product_code, i > 0 ? (sortedProducts[i - 1].monthly_throughput ?? 0) + 1 : 0, product.monthly_throughput));
      endpointSizes.value = sortedEndpointSizes;
      endpoints.value = data.endpoints.map((metaEp) => new Endpoint(metaEp.client_id, metaEp.name, metaEp.queues.map(toQueue), metaEp.classification, sortedEndpointSizes.find((es) => es.name === metaEp.endpoint_size)!, sortedEndpointSizes));
      infrastructureQueues.value = data.infrastructure_queues.map(toQueue);
      excludedQueues.value = data.excluded_queues.map(toQueue);
      /* only used for save, not load */
      unmappedQueues.value = [];
      removedEndpoints.value = [];
      const initialUnassignedQueues = data.unassigned_queues.map(toQueue);
      const assignedQueues = [...endpoints.value.flatMap((endpoint) => endpoint.queues), ...infrastructureQueues.value, ...excludedQueues.value, ...initialUnassignedQueues];
      unassignedQueues.value = [
        ...initialUnassignedQueues,
        ...scQueues
          .filter((scQ) => !assignedQueues.find((queue) => scQ.name_hash === queue.nameHash && ((!queue.scopeHash && !scQ.scope_hash) || queue.scopeHash === scQ.scope_hash)))
          .map(
            (scQ) =>
              ({
                nameHash: scQ.name_hash,
                scopeHash: scQ.scope_hash ?? "",
                details: scQ,
              }) as Queue
          ),
      ];
      serviceEndDate.value = new Date(data.service_end_date);
      validId.value = data.valid_id;
      hasChanges.value = false;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      error.value = `Error fetching endpoint metadata: ${err.message ?? err}`;
      logger.error("Error fetching endpoint metadata", err);
      throw err;
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

  async function discardChanges() {
    saving.value = true;
    try {
      await refresh();
    } finally {
      saving.value = false;
    }
  }

  async function saveChanges() {
    saving.value = true;
    function toApiQueue(queue: Queue) {
      return { name_hash: queue.nameHash, scope_hash: queue.scopeHash, original_location: queue.originalLocation };
    }
    try {
      const response = await serviceControlClient.postToServiceControl("license/amendDetails", {
        endpoints: endpoints.value
          .filter((endpoint) => endpoint.amended || endpoint.queues.some((queue) => queue.originalLocation !== endpoint.clientId))
          .map((endpoint) => ({
            client_id: endpoint.clientId,
            name: endpoint.name,
            classification: endpoint.classification,
            amended_queues: endpoint.queues.filter((queue) => queue.originalLocation !== endpoint.clientId).map(toApiQueue),
          })),
        removed_endpoint_ids: removedEndpoints.value,
        infrastructure_queues: infrastructureQueues.value.filter((queue) => queue.originalLocation !== "infrastructure").map(toApiQueue),
        excluded_queues: excludedQueues.value.filter((queue) => queue.originalLocation !== "excluded").map(toApiQueue),
        unassigned_queues: unassignedQueues.value.filter((queue) => queue.originalLocation != null).map(toApiQueue),
        unmapped_queues: unmappedQueues.value.map(toApiQueue),
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Save Failed: ${response.status} ${response.statusText} - ${text}`);
      }
      await refresh();
      useShowToast(TYPE.SUCCESS, "Saved", "", false, { timeout: 1000 });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      useShowToast(TYPE.ERROR, "Error", "Failed to save changes to endpoint metadata");
      logger.error("Failed to save changes to endpoint metadata.", err);
    } finally {
      saving.value = false;
    }
  }

  async function removeAmendments() {
    saving.value = true;
    try {
      const response = await serviceControlClient.postToServiceControl("license/removeAmendments");
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Remove Amendments Failed: ${response.status} ${response.statusText} - ${text}`);
      }
      await refresh();
      useShowToast(TYPE.SUCCESS, "Amendments Removed", "", false, { timeout: 1000 });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      useShowToast(TYPE.ERROR, "Error", "Failed to remove endpoint metadata amendments");
      logger.error("Failed to remove endpoint metadata amendments.", err);
    } finally {
      saving.value = false;
    }
  }

  const compare = (q1: Queue, q2: Queue) => {
    const name1 = q1.details?.name;
    const name2 = q2.details?.name;

    if (name1 == null && name2 == null) return 0;
    if (name1 == null) return 1;
    if (name2 == null) return -1;

    return name1.toLocaleLowerCase().localeCompare(name2.toLocaleLowerCase());
  };

  watch(isLicenseDetailsSupported, refresh, { immediate: true });

  return {
    endpoints,
    endpointSizes,
    infrastructureQueues: computed(() => infrastructureQueues.value.toSorted(compare)),
    excludedQueues: computed(() => excludedQueues.value.toSorted(compare)),
    unassignedQueues: computed(() => unassignedQueues.value.toSorted(compare)),
    serviceEndDate,
    validId,
    hasLicenseDetails,
    hasChanges,
    hasAmendments: computed(
      () =>
        !hasChanges.value &&
        (endpoints.value.some((endpoint) => endpoint.queues.some((queue) => queue.originalLocation !== endpoint.clientId)) ||
          infrastructureQueues.value.some((queue) => queue.originalLocation !== "infrastructure") ||
          excludedQueues.value.some((queue) => queue.originalLocation !== "excluded") ||
          unassignedQueues.value.some((queue) => queue.originalLocation != null))
    ),
    saving,
    error,
    uploadEndpointMetadata,
    excludeQueue,
    unexcludeQueue,
    markQueueAsInfrastructure,
    unmarkQueueAsInfrastructure,
    createEndpointFromQueue,
    addQueueToEndpoint,
    removeQueueFromEndpoint,
    removeEndpoint,
    renameEndpoint,
    reclassifyEndpoint,
    discardChanges,
    saveChanges,
    removeAmendments,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useLicenseDetailsStore, import.meta.hot));
}

export type LicenseDetailsStore = ReturnType<typeof useLicenseDetailsStore>;
