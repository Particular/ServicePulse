import { acceptHMRUpdate, defineStore } from "pinia";
import logger from "@/logger";
import { ref, watch } from "vue";
import createThroughputClient from "@/views/throughputreport/throughputClient";
import { Endpoint, EndpointSize, type Queue } from "@/resources/LicenseDetails";
import serviceControlClient from "@/components/serviceControlClient";
import type { LicensedEndpointDetails } from "@/resources/LicenseDetails";
import useIsLicenseDetailsSupported from "@/views/throughputreport/licenseDetails/isLicenseDetailsSupported";

export const useLicenseDetailsStore = defineStore("LicenseDetailsStore", () => {
  const endpointSizes = ref<EndpointSize[]>([]);
  const endpoints = ref<Endpoint[]>([]);
  const infrastructureQueues = ref<Queue[]>([]);
  const excludedQueues = ref<Queue[]>([]);
  const serviceEndDate = ref<Date>();
  const validId = ref<boolean>(false);
  const hasLicenseDetails = ref(false);
  const error = ref<string | null>();

  async function refresh() {
    try {
      error.value = null;
      const [, data] = await serviceControlClient.fetchTypedFromServiceControl<LicensedEndpointDetails>("license/details");
      if (!data) return;

      hasLicenseDetails.value = true;
      const throughputClient = createThroughputClient();
      const scQueues = await throughputClient.queues();

      const toQueue = (metaQ: any) =>
        ({
          nameHash: metaQ.nameHash,
          scope: metaQ.scope,
          details: scQueues.find((scQ) => scQ.name_hash === metaQ.name_hash),
        }) as Queue;

      const sortedProducts = data.products.toSorted((p1, p2) => (p1.monthly_throughput ?? Number.MAX_VALUE) - (p2.monthly_throughput ?? Number.MAX_VALUE));
      const sortedEndpointSizes = sortedProducts.map((product, i) => new EndpointSize(product.product_code, i > 0 ? (sortedProducts[i - 1].monthly_throughput ?? 0) : 0, product.monthly_throughput));
      endpointSizes.value = sortedEndpointSizes;
      endpoints.value = data.endpoints.map((metaEp: any) => new Endpoint(crypto.randomUUID(), metaEp.name, metaEp.queues.map(toQueue), metaEp.classification, sortedEndpointSizes.find((es) => es.name === metaEp.endpoint_size)!, sortedEndpointSizes));
      infrastructureQueues.value = data.infrastructure_queues.map(toQueue);
      excludedQueues.value = data.excluded_queues.map(toQueue);
      serviceEndDate.value = new Date(data.service_end_date);
      validId.value = data.valid_id;
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

  const isLicenseDetailsSupported = useIsLicenseDetailsSupported();
  watch(isLicenseDetailsSupported, (supported: boolean) => supported && refresh());

  return {
    endpoints,
    endpointSizes,
    infrastructureQueues,
    excludedQueues,
    serviceEndDate,
    validId,
    hasLicenseDetails,
    error,
    uploadEndpointMetadata,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useLicenseDetailsStore, import.meta.hot));
}

export type LicenseDetailsStore = ReturnType<typeof useLicenseDetailsStore>;
