import { acceptHMRUpdate, defineStore } from "pinia";
import { ref } from "vue";
import { RemoteInstance, RemoteInstanceType, RemoteInstanceStatus } from "@/resources/RemoteInstance";
import serviceControlClient from "@/components/serviceControlClient";

const INSTANCE_TYPE_CACHE_KEY = "servicepulse-remote-instance-types";

/**
 * Determines the instance type based on configuration data retention settings
 */
function determineInstanceType(instance: RemoteInstance): RemoteInstanceType {
  if (instance.configuration?.data_retention?.audit_retention_period !== undefined) {
    return RemoteInstanceType.Audit;
  }
  if (instance.configuration?.data_retention?.error_retention_period !== undefined) {
    return RemoteInstanceType.Error;
  }
  return RemoteInstanceType.Unknown;
}

/**
 * Load instance type cache from localStorage
 */
function loadInstanceTypeCache(): Map<string, RemoteInstanceType> {
  try {
    const cached = localStorage.getItem(INSTANCE_TYPE_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached) as Record<string, RemoteInstanceType>;
      return new Map(Object.entries(parsed));
    }
  } catch {
    // Ignore parse errors, start with empty cache
  }
  return new Map();
}

/**
 * Save instance type cache to localStorage
 */
function saveInstanceTypeCache(cache: Map<string, RemoteInstanceType>): void {
  try {
    const obj = Object.fromEntries(cache);
    localStorage.setItem(INSTANCE_TYPE_CACHE_KEY, JSON.stringify(obj));
  } catch {
    // Ignore storage errors
  }
}

export const useRemoteInstancesStore = defineStore("RemoteInstancesStore", () => {
  const remoteInstances = ref<RemoteInstance[] | null>(null);

  // Cache to store instance types by api_uri - persists in localStorage across page refreshes
  const instanceTypeCache = loadInstanceTypeCache();

  async function refresh() {
    const response = await serviceControlClient.fetchFromServiceControl("configuration/remotes");
    const instances: RemoteInstance[] = await response.json();

    let cacheUpdated = false;

    // Process each instance to determine and cache its type
    for (const instance of instances) {
      // If the instance is online, determine its type from configuration
      if (instance.status === RemoteInstanceStatus.Online) {
        const instanceType = determineInstanceType(instance);
        if (instanceType !== RemoteInstanceType.Unknown) {
          const existingType = instanceTypeCache.get(instance.api_uri);
          if (existingType !== instanceType) {
            instanceTypeCache.set(instance.api_uri, instanceType);
            cacheUpdated = true;
          }
        }
      }

      // Apply cached type to the instance (whether online or offline)
      const cachedType = instanceTypeCache.get(instance.api_uri);
      if (cachedType) {
        instance.cachedInstanceType = cachedType;
      } else {
        // If no cached type and instance is online, try to determine it now
        instance.cachedInstanceType = determineInstanceType(instance);
      }
    }

    // Persist cache to localStorage if it was updated
    if (cacheUpdated) {
      saveInstanceTypeCache(instanceTypeCache);
    }

    remoteInstances.value = instances;
  }

  refresh();

  return {
    remoteInstances,
    refresh,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useRemoteInstancesStore, import.meta.hot));
}

export type RemoteInstancesStore = ReturnType<typeof useRemoteInstancesStore>;
