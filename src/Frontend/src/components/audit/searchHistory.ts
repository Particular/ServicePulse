// Per-browser history of audit searches (search text and/or endpoint), most
// recently used first. Re-running or re-entering an existing search bumps it to
// the front instead of duplicating it; the least recently used entry falls off
// once the list is full.

export interface SearchHistoryEntry {
  search: string;
  endpoint: string;
  // Time-range expressions the search ran with ("" on both = no time filter).
  // Absent on entries recorded before ranges were captured; rerunning those
  // leaves the current range untouched.
  from?: string;
  to?: string;
  at: string; // ISO timestamp of last use
}

const STORAGE_KEY = "audit.searchHistory";
export const searchHistoryLimit = 10;

export function loadSearchHistory(): SearchHistoryEntry[] {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "");
    if (Array.isArray(stored)) {
      const optionalString = (v: unknown) => v === undefined || typeof v === "string";
      return stored.filter((e) => e && typeof e.search === "string" && typeof e.endpoint === "string" && typeof e.at === "string" && optionalString(e.from) && optionalString(e.to));
    }
  } catch {
    // fall through to empty history
  }
  return [];
}

function save(entries: SearchHistoryEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // storage unavailable: history just doesn't persist
  }
}

// Records a use of (search, endpoint, time range) and returns the updated
// history. The range is part of a search's identity: the same text over a
// different window is a different query.
export function recordSearch(search: string, endpoint: string, range: { from: string; to: string }, now: () => Date = () => new Date()): SearchHistoryEntry[] {
  const trimmedSearch = search.trim();
  const trimmedEndpoint = endpoint.trim();
  if (trimmedSearch === "" && trimmedEndpoint === "") {
    return loadSearchHistory();
  }

  const from = range.from.trim();
  const to = range.to.trim();
  const entries = loadSearchHistory().filter((e) => !(e.search === trimmedSearch && e.endpoint === trimmedEndpoint && e.from === from && e.to === to));
  entries.unshift({ search: trimmedSearch, endpoint: trimmedEndpoint, from, to, at: now().toISOString() });
  const capped = entries.slice(0, searchHistoryLimit);
  save(capped);
  return capped;
}

export function clearSearchHistory(): SearchHistoryEntry[] {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  return [];
}
