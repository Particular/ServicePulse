import { describe, test, expect } from "vitest";
import { matchesPattern, entryPermits, type PermissionEntry } from "@/composables/permissionMatching";
import scopeVectors from "@/composables/scope-vectors.json";

describe("permissionMatching", () => {
  // Shared vectors: these MUST produce the same result in the ServiceControl
  // ResourceScope/FilterByQueueScope tests. entryPermits with a resource is the
  // frontend equivalent of the server's ResourceScope.Permits.
  describe("scope-vectors.json (shared with ServiceControl)", () => {
    test.each(scopeVectors.vectors)("$name", ({ allow, deny, resource, permits }) => {
      const entry: PermissionEntry = { permission: "messages:view", scope: { allow, deny } };
      expect(entryPermits(entry, resource)).toBe(permits);
    });
  });

  describe("matchesPattern", () => {
    test("universal wildcard matches everything", () => {
      expect(matchesPattern("*", "anything")).toBe(true);
    });

    test("prefix crosses dots but excludes the bare prefix", () => {
      expect(matchesPattern("sales.*", "sales.orders.eu")).toBe(true);
      expect(matchesPattern("sales.*", "sales")).toBe(false);
    });

    test("is case-insensitive on both sides", () => {
      expect(matchesPattern("Sales.Orders", "sales.orders")).toBe(true);
      expect(matchesPattern("SALES.*", "sales.orders")).toBe(true);
    });
  });

  describe("entryPermits scope semantics", () => {
    test("null scope is unrestricted for any resource", () => {
      const entry: PermissionEntry = { permission: "messages:retry", scope: null };
      expect(entryPermits(entry, "anything")).toBe(true);
    });

    test("null scope passes the verb-level check", () => {
      const entry: PermissionEntry = { permission: "messages:retry", scope: null };
      expect(entryPermits(entry)).toBe(true);
    });

    test("verb-level check (no resource) passes for a scoped entry", () => {
      // Holding the permission for *some* scope counts at the verb level.
      const entry: PermissionEntry = { permission: "messages:retry", scope: { allow: ["sales.*"], deny: [] } };
      expect(entryPermits(entry)).toBe(true);
    });

    test("resource-level check enforces the scope", () => {
      const entry: PermissionEntry = { permission: "messages:retry", scope: { allow: ["sales.*"], deny: [] } };
      expect(entryPermits(entry, "sales.orders")).toBe(true);
      expect(entryPermits(entry, "finance.invoicing")).toBe(false);
    });
  });
});
