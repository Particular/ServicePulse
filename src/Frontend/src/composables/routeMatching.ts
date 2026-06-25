// Normalizes a (method, path) into a comparison key for allowed-route matching.
// Param names are collapsed to {} so matching couples only to method + path STRUCTURE
// (the stable public contract), surviving server route-parameter renames.
export function normalizeRouteKey(method: string, path: string): string {
  const normalizedPath = path
    .replace(/\{[^}]*\}/g, "{}")
    .replace(/^\/?/, "/");
  return `${method.toUpperCase()} ${normalizedPath}`;
}
