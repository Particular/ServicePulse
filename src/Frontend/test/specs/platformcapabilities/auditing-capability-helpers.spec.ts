import { describe, it, expect } from "vitest";
import { isAuditInstance, filterAuditInstances, allAuditInstancesUnavailable, hasUnavailableAuditInstances, hasAvailableAuditInstances, hasPartiallyUnavailableAuditInstances } from "@/components/platformcapabilities/capabilities/AuditingCapability";
import { RemoteInstanceStatus, RemoteInstanceType, type RemoteInstance } from "@/resources/RemoteInstance";

// Test fixture factories
function createAuditInstance(status: RemoteInstanceStatus = RemoteInstanceStatus.Online): RemoteInstance {
  return {
    api_uri: "http://localhost:44444/api",
    version: "5.0.0",
    status,
    cachedInstanceType: RemoteInstanceType.Audit,
  };
}

function createErrorInstance(status: RemoteInstanceStatus = RemoteInstanceStatus.Online): RemoteInstance {
  return {
    api_uri: "http://localhost:33333/api",
    version: "5.0.0",
    status,
    cachedInstanceType: RemoteInstanceType.Error,
  };
}

function createUnknownInstance(status: RemoteInstanceStatus = RemoteInstanceStatus.Online): RemoteInstance {
  return {
    api_uri: "http://localhost:55555/api",
    version: "5.0.0",
    status,
    cachedInstanceType: RemoteInstanceType.Unknown,
  };
}

describe("AuditingCapability helper functions", () => {
  describe("isAuditInstance", () => {
    it("returns true for audit instance type", () => {
      const instance = createAuditInstance();
      expect(isAuditInstance(instance)).toBe(true);
    });

    it("returns false for error instance type", () => {
      const instance = createErrorInstance();
      expect(isAuditInstance(instance)).toBe(false);
    });

    it("returns false for unknown instance type", () => {
      const instance = createUnknownInstance();
      expect(isAuditInstance(instance)).toBe(false);
    });

    it("returns false when cachedInstanceType is undefined", () => {
      const instance: RemoteInstance = {
        api_uri: "http://localhost:44444/api",
        version: "5.0.0",
        status: RemoteInstanceStatus.Online,
      };
      expect(isAuditInstance(instance)).toBe(false);
    });
  });

  describe("filterAuditInstances", () => {
    it("returns empty array for null input", () => {
      expect(filterAuditInstances(null)).toEqual([]);
    });

    it("returns empty array for undefined input", () => {
      expect(filterAuditInstances(undefined)).toEqual([]);
    });

    it("returns empty array when no instances provided", () => {
      expect(filterAuditInstances([])).toEqual([]);
    });

    it("returns only audit instances from mixed array", () => {
      const instances = [createAuditInstance(), createErrorInstance(), createAuditInstance(), createUnknownInstance()];

      const result = filterAuditInstances(instances);

      expect(result).toHaveLength(2);
      expect(result.every((i) => i.cachedInstanceType === RemoteInstanceType.Audit)).toBe(true);
    });

    it("returns empty array when no audit instances exist", () => {
      const instances = [createErrorInstance(), createUnknownInstance()];

      const result = filterAuditInstances(instances);

      expect(result).toEqual([]);
    });

    it("returns all instances when all are audit instances", () => {
      const instances = [createAuditInstance(), createAuditInstance()];

      const result = filterAuditInstances(instances);

      expect(result).toHaveLength(2);
    });
  });

  describe("allAuditInstancesUnavailable", () => {
    it("returns false for null input", () => {
      expect(allAuditInstancesUnavailable(null)).toBe(false);
    });

    it("returns false for undefined input", () => {
      expect(allAuditInstancesUnavailable(undefined)).toBe(false);
    });

    it("returns false for empty array", () => {
      expect(allAuditInstancesUnavailable([])).toBe(false);
    });

    it("returns true when all instances are unavailable", () => {
      const instances = [createAuditInstance(RemoteInstanceStatus.Unavailable), createAuditInstance(RemoteInstanceStatus.Unavailable)];

      expect(allAuditInstancesUnavailable(instances)).toBe(true);
    });

    it("returns false when all instances are online", () => {
      const instances = [createAuditInstance(RemoteInstanceStatus.Online), createAuditInstance(RemoteInstanceStatus.Online)];

      expect(allAuditInstancesUnavailable(instances)).toBe(false);
    });

    it("returns false when some instances are online and some unavailable", () => {
      const instances = [createAuditInstance(RemoteInstanceStatus.Online), createAuditInstance(RemoteInstanceStatus.Unavailable)];

      expect(allAuditInstancesUnavailable(instances)).toBe(false);
    });

    it("returns true for single unavailable instance", () => {
      const instances = [createAuditInstance(RemoteInstanceStatus.Unavailable)];

      expect(allAuditInstancesUnavailable(instances)).toBe(true);
    });

    it("returns false for single online instance", () => {
      const instances = [createAuditInstance(RemoteInstanceStatus.Online)];

      expect(allAuditInstancesUnavailable(instances)).toBe(false);
    });
  });

  describe("hasUnavailableAuditInstances", () => {
    it("returns false for null input", () => {
      expect(hasUnavailableAuditInstances(null)).toBe(false);
    });

    it("returns false for undefined input", () => {
      expect(hasUnavailableAuditInstances(undefined)).toBe(false);
    });

    it("returns false for empty array", () => {
      expect(hasUnavailableAuditInstances([])).toBe(false);
    });

    it("returns true when at least one instance is unavailable", () => {
      const instances = [createAuditInstance(RemoteInstanceStatus.Online), createAuditInstance(RemoteInstanceStatus.Unavailable)];

      expect(hasUnavailableAuditInstances(instances)).toBe(true);
    });

    it("returns true when all instances are unavailable", () => {
      const instances = [createAuditInstance(RemoteInstanceStatus.Unavailable), createAuditInstance(RemoteInstanceStatus.Unavailable)];

      expect(hasUnavailableAuditInstances(instances)).toBe(true);
    });

    it("returns false when all instances are online", () => {
      const instances = [createAuditInstance(RemoteInstanceStatus.Online), createAuditInstance(RemoteInstanceStatus.Online)];

      expect(hasUnavailableAuditInstances(instances)).toBe(false);
    });
  });

  describe("hasAvailableAuditInstances", () => {
    it("returns false for null input", () => {
      expect(hasAvailableAuditInstances(null)).toBe(false);
    });

    it("returns false for undefined input", () => {
      expect(hasAvailableAuditInstances(undefined)).toBe(false);
    });

    it("returns false for empty array", () => {
      expect(hasAvailableAuditInstances([])).toBe(false);
    });

    it("returns true when at least one instance is online", () => {
      const instances = [createAuditInstance(RemoteInstanceStatus.Unavailable), createAuditInstance(RemoteInstanceStatus.Online)];

      expect(hasAvailableAuditInstances(instances)).toBe(true);
    });

    it("returns true when all instances are online", () => {
      const instances = [createAuditInstance(RemoteInstanceStatus.Online), createAuditInstance(RemoteInstanceStatus.Online)];

      expect(hasAvailableAuditInstances(instances)).toBe(true);
    });

    it("returns false when all instances are unavailable", () => {
      const instances = [createAuditInstance(RemoteInstanceStatus.Unavailable), createAuditInstance(RemoteInstanceStatus.Unavailable)];

      expect(hasAvailableAuditInstances(instances)).toBe(false);
    });
  });

  describe("hasPartiallyUnavailableAuditInstances", () => {
    it("returns false for null input", () => {
      expect(hasPartiallyUnavailableAuditInstances(null)).toBe(false);
    });

    it("returns false for undefined input", () => {
      expect(hasPartiallyUnavailableAuditInstances(undefined)).toBe(false);
    });

    it("returns false for empty array", () => {
      expect(hasPartiallyUnavailableAuditInstances([])).toBe(false);
    });

    it("returns true when some instances are online and some unavailable", () => {
      const instances = [createAuditInstance(RemoteInstanceStatus.Online), createAuditInstance(RemoteInstanceStatus.Unavailable)];

      expect(hasPartiallyUnavailableAuditInstances(instances)).toBe(true);
    });

    it("returns true when multiple instances with mixed availability", () => {
      const instances = [createAuditInstance(RemoteInstanceStatus.Online), createAuditInstance(RemoteInstanceStatus.Unavailable), createAuditInstance(RemoteInstanceStatus.Online), createAuditInstance(RemoteInstanceStatus.Unavailable)];

      expect(hasPartiallyUnavailableAuditInstances(instances)).toBe(true);
    });

    it("returns false when all instances are online", () => {
      const instances = [createAuditInstance(RemoteInstanceStatus.Online), createAuditInstance(RemoteInstanceStatus.Online)];

      expect(hasPartiallyUnavailableAuditInstances(instances)).toBe(false);
    });

    it("returns false when all instances are unavailable", () => {
      const instances = [createAuditInstance(RemoteInstanceStatus.Unavailable), createAuditInstance(RemoteInstanceStatus.Unavailable)];

      expect(hasPartiallyUnavailableAuditInstances(instances)).toBe(false);
    });

    it("returns false for single online instance", () => {
      const instances = [createAuditInstance(RemoteInstanceStatus.Online)];

      expect(hasPartiallyUnavailableAuditInstances(instances)).toBe(false);
    });

    it("returns false for single unavailable instance", () => {
      const instances = [createAuditInstance(RemoteInstanceStatus.Unavailable)];

      expect(hasPartiallyUnavailableAuditInstances(instances)).toBe(false);
    });
  });
});
