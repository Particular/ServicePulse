// DORMANT — not currently wired into the UI. ServiceControl does not yet expose
// per-resource (per-queue) scopes; today's my/permissions/all returns a flat list of
// permission strings (see usePermissions/PermissionsStore). This module is kept ready
// for when the backend gains allow/deny scopes, at which point a PermissionEntry will
// carry a ScopeDescriptor and can(permission, resource) can enforce it.

// A scope's allow/deny resource patterns. null (on an entry) means unrestricted.
export interface ScopeDescriptor {
  allow: string[];
  deny: string[];
}

// A single scoped permission grant (the future descriptor entry shape).
export interface PermissionEntry {
  permission: string;
  scope: ScopeDescriptor | null;
}

// Resource-scope pattern matching. This MUST stay in lockstep with the
// ServiceControl server-side rules: `ResourceScope.Matches` (C#) and
// `FilterByQueueScope` (RavenDB query translation). The shared behaviour is
// pinned by scope-vectors.json, which both this suite and the ServiceControl
// test suite consume.
//
// Patterns:
//   "*"        matches everything
//   "prefix.*" prefix match crossing dots: "sales.*" matches "sales.orders"
//              and "sales.secret.payroll", but NOT bare "sales"
//   exact      case-insensitive equality
//
// Matching is case-insensitive: the server lowercases both sides (queue
// addresses are stored lowercased in the index), so we do the same here.
export function matchesPattern(pattern: string, resource: string): boolean {
  const p = pattern.toLowerCase();
  const r = resource.toLowerCase();
  if (p === "*") return true;
  if (p === r) return true;
  if (p.endsWith(".*")) return r.startsWith(p.slice(0, -1)); // "sales.*" -> "sales."
  return false;
}

// Whether a single permission entry permits access.
//   scope null          -> unrestricted (any resource; verb-level true)
//   resource undefined  -> verb-level check: holding the permission counts
//   resource provided   -> allow AND NOT deny, deny wins
export function entryPermits(entry: PermissionEntry, resource?: string): boolean {
  if (entry.scope === null) return true;
  if (resource === undefined) return true;
  const allowed = entry.scope.allow.some((pattern) => matchesPattern(pattern, resource));
  const denied = entry.scope.deny.some((pattern) => matchesPattern(pattern, resource));
  return allowed && !denied;
}
