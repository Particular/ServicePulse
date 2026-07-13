import { acceptHMRUpdate, defineStore } from "pinia";
import { ref } from "vue";
import createThroughputClient from "@/views/throughputreport/throughputClient";
import { Endpoint, EndpointSize, type Queue } from "@/views/throughputreport/licenseDetails/types";

//TODO: get from the metadata file
const endpointSizes = [
  new EndpointSize("4", 0, 4),
  new EndpointSize("16", 4, 16),
  new EndpointSize("64", 16, 64),
  new EndpointSize("256", 64, 256),
  new EndpointSize("1024", 256, 1_024),
  new EndpointSize("4K", 1_024, 4_096),
  new EndpointSize("16K", 4_096, 16_384),
  new EndpointSize("64K", 16_384, 65_536),
  new EndpointSize("256K", 65_536, 262_144),
  new EndpointSize("1024K", 262_144, 1_048_576),
  new EndpointSize("4M", 1_048_576, 4_194_304),
  new EndpointSize("16M", 4_194_304, 16_777_216),
  new EndpointSize("64M", 16_777_216, 67_108_864),
  new EndpointSize("256M", 67_108_864, 268_435_456),
  new EndpointSize("1024M", 268_435_456, 1_073_741_824),
  new EndpointSize("U", 1_073_741_824, null),
];

export const useLicenseDetailsStore = defineStore("LicenseDetailsStore", () => {
  const endpoints = ref<Endpoint[]>([]);
  const infrastructureQueues = ref<Queue[]>([]);
  const excludedQueues = ref<Queue[]>([]);

  async function refresh() {
    const sample: any = await import("@/views/throughputreport/licenseDetails/sample.json");
    const throughputClient = createThroughputClient();
    const scQueues = await throughputClient.queues();

    const toQueue = (metaQ: any) =>
      ({
        nameHash: metaQ.nameHash,
        scope: metaQ.scope,
        details: scQueues.find((scQ) => scQ.name_hash === metaQ.nameHash),
      }) as Queue;

    endpoints.value = sample.endpoints.map((metaEp: any) => new Endpoint(crypto.randomUUID(), metaEp.name, metaEp.queues.map(toQueue), metaEp.classification, endpointSizes.find((es) => es.name === metaEp.endpointSize)!, endpointSizes));
    infrastructureQueues.value = sample.infrastructureQueues.map(toQueue);
    excludedQueues.value = sample.excludedQueues.map(toQueue);
  }
  refresh();

  return {
    endpoints,
    endpointSizes,
    infrastructureQueues,
    excludedQueues,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useLicenseDetailsStore, import.meta.hot));
}

export type LicenseDetailsStore = ReturnType<typeof useLicenseDetailsStore>;
