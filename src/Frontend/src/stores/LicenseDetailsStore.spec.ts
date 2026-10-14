import { beforeEach, describe, expect, test, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import type QueueThroughputSummary from "@/resources/QueueThroughputSummary";
import { EndpointClassification, type LicensedEndpointDetails } from "@/resources/LicenseDetails";

const mocks = vi.hoisted(() => ({
  isSupported: false,
  fetchTypedFromServiceControl: vi.fn(),
  postToServiceControl: vi.fn(),
  postFileToServiceControl: vi.fn(),
  queues: vi.fn(),
  showToast: vi.fn(),
}));

vi.mock("@/views/throughputreport/licenseDetails/isLicenseDetailsSupported", async () => {
  const { ref } = await import("vue");
  return { default: () => ref(mocks.isSupported) };
});

vi.mock("@/components/serviceControlClient", () => ({
  default: {
    fetchTypedFromServiceControl: mocks.fetchTypedFromServiceControl,
    postToServiceControl: mocks.postToServiceControl,
    postFileToServiceControl: mocks.postFileToServiceControl,
  },
}));

vi.mock("@/views/throughputreport/throughputClient", () => ({
  default: () => ({ queues: mocks.queues }),
}));

vi.mock("@/composables/toast", () => ({
  useShowToast: mocks.showToast,
}));

vi.mock("@/logger", () => ({
  default: {
    error: vi.fn(),
  },
}));

import { TYPE } from "vue-toastification";
import { useLicenseDetailsStore } from "@/stores/LicenseDetailsStore";

describe("LicenseDetailsStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());

    mocks.isSupported = false;
    mocks.fetchTypedFromServiceControl.mockReset();
    mocks.postToServiceControl.mockReset();
    mocks.postFileToServiceControl.mockReset();
    mocks.queues.mockReset();
    mocks.showToast.mockReset();

    mocks.postToServiceControl.mockResolvedValue(new Response(null, { status: 200 }));
    mocks.postFileToServiceControl.mockResolvedValue(new Response(null, { status: 200 }));
  });

  test("creates an endpoint from a queue", async () => {
    const {
      store,
      queues: [queue],
    } = await createQueue({ name: "Sales", nameHash: "sales-hash" });

    store.createEndpointFromQueue(queue);

    expect(store.endpoints).toHaveLength(1);
    expect(store.endpoints[0]).toMatchObject({
      name: "Sales",
      classification: EndpointClassification.Full,
      queues: [queue],
    });
    expect(store.unassignedQueues).toEqual([]);
    expect(store.hasChanges).toBe(true);
  });

  test("moves an unassigned queue to an endpoint", async () => {
    const {
      store,
      queues: [queue],
    } = await createQueue({
      name: "Sales",
      nameHash: "sales-hash",
    });

    expect(store.unassignedQueues).toEqual([queue]);

    store.createEndpointFromQueue(queue);

    expect(store.endpoints).toHaveLength(1);
    expect(store.endpoints[0].queues).toEqual([queue]);
    expect(store.unassignedQueues).toEqual([]);
    expect(store.hasChanges).toBe(true);
  });

  test("moves a queue between unassigned and infrastructure collections", async () => {
    const {
      store,
      queues: [queue],
    } = await createQueue({
      name: "Sales",
      nameHash: "sales-hash",
    });

    store.markQueueAsInfrastructure(queue);

    expect(store.infrastructureQueues).toEqual([queue]);
    expect(store.unassignedQueues).toEqual([]);

    store.unmarkQueueAsInfrastructure(queue);

    expect(store.infrastructureQueues).toEqual([]);
    expect(store.unassignedQueues).toEqual([queue]);
    expect(store.hasChanges).toBe(true);
  });

  test("moves a queue between unassigned and excluded collections", async () => {
    const {
      store,
      queues: [queue],
    } = await createQueue({
      name: "Sales",
      nameHash: "sales-hash",
    });

    store.excludeQueue(queue);

    expect(store.excludedQueues).toEqual([queue]);
    expect(store.unassignedQueues).toEqual([]);

    store.unexcludeQueue(queue);

    expect(store.excludedQueues).toEqual([]);
    expect(store.unassignedQueues).toEqual([queue]);
    expect(store.hasChanges).toBe(true);
  });

  test("returns a queue to unassigned when removed from an endpoint", async () => {
    const {
      store,
      queues: [queue],
    } = await createQueue({
      name: "Sales",
      nameHash: "sales-hash",
    });

    store.createEndpointFromQueue(queue);
    const endpoint = store.endpoints[0];

    store.removeQueueFromEndpoint(queue, endpoint);

    expect(endpoint.queues).toEqual([]);
    expect(store.unassignedQueues).toEqual([queue]);
    expect(store.hasChanges).toBe(true);
  });

  test("renames and reclassifies an endpoint", async () => {
    const {
      store,
      queues: [queue],
    } = await createQueue({ name: "Sales", nameHash: "sales-hash" });

    store.createEndpointFromQueue(queue);
    const endpoint = store.endpoints[0];

    store.renameEndpoint(endpoint, "Sales Senders");
    store.reclassifyEndpoint(endpoint, EndpointClassification.SendOnly);

    expect(endpoint.name).toBe("Sales Senders");
    expect(endpoint.classification).toBe(EndpointClassification.SendOnly);
    expect(endpoint.amended).toBe(true);
    expect(store.hasChanges).toBe(true);
  });

  test("sorts queue collections by queue name without changing insertion order", async () => {
    const {
      store,
      queues: [zebra, alpha],
    } = await createQueue({ name: "Zebra", nameHash: "zebra-hash" }, { name: "alpha", nameHash: "alpha-hash" });

    store.excludeQueue(zebra);
    store.excludeQueue(alpha);

    expect(store.excludedQueues.map((queue) => queue.details.name)).toEqual(["alpha", "Zebra"]);
  });

  test("loads license details and adds newly discovered queues to unassigned", async () => {
    mocks.isSupported = true;

    const details: LicensedEndpointDetails = {
      endpoints: [
        {
          client_id: "endpoint-1",
          name: "Sales",
          classification: EndpointClassification.Full,
          endpoint_size: "large",
          queues: [{ name_hash: "sales-hash", scope_hash: "", original_location: "endpoint-1" }],
        },
      ],
      infrastructure_queues: [],
      excluded_queues: [],
      unassigned_queues: [],
      service_end_date: "2026-12-31T00:00:00Z",
      valid_id: true,
      products: [
        { product_code: "large", monthly_throughput: 1_000 },
        { product_code: "small", monthly_throughput: 100 },
      ],
    };

    mocks.fetchTypedFromServiceControl.mockResolvedValue([new Response(), details]);
    mocks.queues.mockResolvedValue([createQueueDetails("Sales", "sales-hash"), createQueueDetails("Shipping", "shipping-hash")]);

    const store = useLicenseDetailsStore();

    await vi.waitFor(() => expect(store.hasLicenseDetails).toBe(true));

    expect(store.endpointSizes.map((size) => size.name)).toEqual(["small", "large"]);
    expect(store.endpointSizes[1].throughputMin).toBe(101);
    expect(store.endpoints[0].queues[0].details.name).toBe("Sales");
    expect(store.unassignedQueues.map((queue) => queue.details.name)).toEqual(["Shipping"]);
    expect(store.serviceEndDate).toEqual(new Date("2026-12-31T00:00:00Z"));
    expect(store.validId).toBe(true);
    expect(store.hasChanges).toBe(false);
  });

  test("saves amended endpoints and newly assigned queues", async () => {
    const {
      store,
      queues: [endpointQueue, infrastructureQueue, excludedQueue],
    } = await createQueue(
      {
        name: "Sales",
        nameHash: "sales-hash",
        originalLocation: "previous-endpoint",
      },
      {
        name: "Audit",
        nameHash: "audit-hash",
        originalLocation: "previous-location",
      },
      {
        name: "Error",
        nameHash: "error-hash",
        originalLocation: "previous-location",
      }
    );

    store.createEndpointFromQueue(endpointQueue);
    const endpoint = store.endpoints[0];
    store.renameEndpoint(endpoint, "Sales Endpoint");
    store.markQueueAsInfrastructure(infrastructureQueue);
    store.excludeQueue(excludedQueue);

    await store.saveChanges();

    expect(mocks.postToServiceControl).toHaveBeenCalledWith("license/amendDetails", {
      endpoints: [
        {
          client_id: endpoint.clientId,
          name: "Sales Endpoint",
          classification: EndpointClassification.Full,
          amended_queues: [
            {
              name_hash: "sales-hash",
              scope_hash: "",
              original_location: "previous-endpoint",
            },
          ],
        },
      ],
      removed_endpoint_ids: [],
      infrastructure_queues: [
        {
          name_hash: "audit-hash",
          scope_hash: "",
          original_location: "previous-location",
        },
      ],
      excluded_queues: [
        {
          name_hash: "error-hash",
          scope_hash: "",
          original_location: "previous-location",
        },
      ],
      unassigned_queues: [],
      unmapped_queues: [],
    });
    expect(mocks.showToast).toHaveBeenCalledWith(TYPE.SUCCESS, "Saved", "", false, { timeout: 1000 });
    expect(store.saving).toBe(false);
  });

  test("reports upload failures with the response details", async () => {
    mocks.postFileToServiceControl.mockResolvedValue(
      new Response("Invalid metadata", {
        status: 400,
        statusText: "Bad Request",
      })
    );

    const store = useLicenseDetailsStore();
    const file = new File(["{}"], "license.json", { type: "application/json" });

    await expect(store.uploadEndpointMetadata(file)).rejects.toThrow("Upload Failed: 400 Bad Request - Invalid metadata");
  });
});

interface QueueDefinition {
  name: string;
  nameHash: string;
  scopeHash?: string;
  originalLocation?: string;
}

async function createQueue(...definitions: QueueDefinition[]) {
  mocks.isSupported = true;

  const details: LicensedEndpointDetails = {
    endpoints: [],
    infrastructure_queues: [],
    excluded_queues: [],
    unassigned_queues: definitions.map((definition) => ({
      name_hash: definition.nameHash,
      scope_hash: definition.scopeHash ?? "",
      original_location: definition.originalLocation ?? "unassigned",
    })),
    service_end_date: "2026-12-31T00:00:00Z",
    valid_id: true,
    products: [],
  };

  mocks.fetchTypedFromServiceControl.mockResolvedValue([new Response(), details]);
  mocks.queues.mockResolvedValue(definitions.map((definition) => createQueueDetails(definition.name, definition.nameHash, definition.scopeHash)));

  const store = useLicenseDetailsStore();

  await vi.waitFor(() => {
    expect(mocks.fetchTypedFromServiceControl).toHaveBeenCalledWith("license/details");
    expect(store.unassignedQueues).toHaveLength(definitions.length);
  });

  const queues = definitions.map((definition) => {
    const queue = store.unassignedQueues.find((candidate) => candidate.nameHash === definition.nameHash && candidate.scopeHash === (definition.scopeHash ?? ""));

    expect(queue).toBeDefined();
    return queue!;
  });

  return { store, queues };
}

function createQueueDetails(name: string, nameHash: string, scopeHash = ""): QueueThroughputSummary {
  return {
    name,
    name_hash: nameHash,
    scope_hash: scopeHash,
    is_known_endpoint: true,
    user_indicator: "",
    max_daily_throughput: 0,
    average_monthly_throughput: 0,
  };
}
