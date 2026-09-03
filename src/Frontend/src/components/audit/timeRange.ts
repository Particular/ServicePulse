// Parsing and resolution for the audit time-range picker.
//
// Each bound of the range is a text expression, either:
//  - relative: "now", "now-6h", "now/d" (snap to start of unit; in the To bound
//    a snap means end of unit), "now-7d/d" — units s m h d w M
//  - absolute RFC 3339, tolerant: "T" or a space as separator, seconds and
//    milliseconds optional, zone optional. A zone-less value is local wall time;
//    "2026-08-31Z" forces UTC midnight, "2026-09-01 00:00:00-03:00" is honored
//    as given. A bare date is midnight (in the chosen zone).
//
// Relative expressions stay text in the store and the URL, and are resolved to
// concrete instants at query time — so "last 6 hours" keeps sliding with
// auto-refresh, and a shared URL re-evaluates instead of going stale.

export interface TimeRangeText {
  from: string;
  to: string;
}

export interface ParsedPoint {
  date?: Date;
  live?: boolean;
  error?: string;
}

const RELATIVE_PATTERN = /^now(?:-(\d+)([smhdwM]))?(?:\/([smhdwM]))?$/;
const ABSOLUTE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?)?\s*(Z|z|[+-]\d{2}:?\d{2})?$/;

const UNIT_MS: Record<string, number> = { s: 1e3, m: 60e3, h: 3600e3, d: 86400e3, w: 7 * 86400e3 };

export function parseTimePoint(raw: string, isEnd: boolean, now: () => Date = () => new Date()): ParsedPoint {
  const text = raw.trim();
  if (text === "") {
    return { error: "empty" };
  }

  const relative = RELATIVE_PATTERN.exec(text);
  if (relative) {
    const [, amount, unit, snap] = relative;
    let date = now();
    if (amount) {
      if (unit === "M") {
        date = new Date(date);
        date.setMonth(date.getMonth() - Number(amount));
      } else {
        date = new Date(date.getTime() - Number(amount) * UNIT_MS[unit]);
      }
    }
    if (snap) {
      date = snapToUnit(date, snap, isEnd);
    }
    return { date, live: true };
  }

  if (/^now/i.test(text)) {
    return { error: "expected now, now-6h or now-1d/d" };
  }

  const absolute = ABSOLUTE_PATTERN.exec(text);
  if (!absolute) {
    return { error: "expected RFC 3339 (2026-09-01 14:30[:00][Z|±hh:mm]) or a relative expression (now-6h)" };
  }

  const [, year, month, day, hour = "00", minute = "00", second = "00", millis = "0", zone] = absolute;
  if (+month < 1 || +month > 12 || +day < 1 || +day > 31 || +hour > 23 || +minute > 59 || +second > 59) {
    return { error: "not a real date" };
  }
  const ms = Number((millis + "00").slice(0, 3));
  let date: Date;
  if (zone) {
    let offsetMinutes = 0;
    if (zone.toUpperCase() !== "Z") {
      const zoneMatch = /^([+-])(\d{2}):?(\d{2})$/.exec(zone);
      if (!zoneMatch) {
        return { error: `unrecognized zone '${zone}'` };
      }
      offsetMinutes = (zoneMatch[1] === "-" ? -1 : 1) * (Number(zoneMatch[2]) * 60 + Number(zoneMatch[3]));
    }
    date = new Date(Date.UTC(+year, +month - 1, +day, +hour, +minute, +second, ms) - offsetMinutes * 60e3);
  } else {
    date = new Date(+year, +month - 1, +day, +hour, +minute, +second, ms);
  }

  // JS Date rolls invalid combinations over (Feb 30 -> Mar 2); probe the calendar day itself
  const rolledOver = new Date(Date.UTC(+year, +month - 1, +day)).getUTCDate() !== +day;
  return isNaN(date.getTime()) || rolledOver ? { error: "not a real date" } : { date, live: false };
}

function snapToUnit(input: Date, unit: string, toEndOfUnit: boolean): Date {
  const date = new Date(input);
  switch (unit) {
    case "s":
      date.setMilliseconds(0);
      break;
    case "m":
      date.setSeconds(0, 0);
      break;
    case "h":
      date.setMinutes(0, 0, 0);
      break;
    case "d":
      date.setHours(0, 0, 0, 0);
      break;
    case "w":
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
      break;
    case "M":
      date.setHours(0, 0, 0, 0);
      date.setDate(1);
      break;
  }

  if (!toEndOfUnit) {
    return date;
  }

  const end = new Date(date);
  switch (unit) {
    case "s":
      end.setSeconds(end.getSeconds() + 1);
      break;
    case "m":
      end.setMinutes(end.getMinutes() + 1);
      break;
    case "h":
      end.setHours(end.getHours() + 1);
      break;
    case "d":
      end.setDate(end.getDate() + 1);
      break;
    case "w":
      end.setDate(end.getDate() + 7);
      break;
    case "M":
      end.setMonth(end.getMonth() + 1);
      break;
  }
  return new Date(end.getTime() - 1000);
}

export interface ResolvedRange {
  from: Date;
  to: Date;
  live: boolean;
}

// Resolves both bounds; swaps them when entered backwards. Returns null when
// either bound is empty or invalid — callers treat that as "no range".
export function resolveTimeRange(range: TimeRangeText, now: () => Date = () => new Date()): ResolvedRange | null {
  const fixedNow = now();
  const stableNow = () => fixedNow; // both bounds see the same "now"
  const from = parseTimePoint(range.from, false, stableNow);
  const to = parseTimePoint(range.to, true, stableNow);
  if (!from.date || !to.date) {
    return null;
  }
  const swapped = from.date > to.date;
  return {
    from: swapped ? to.date : from.date,
    to: swapped ? from.date : to.date,
    live: Boolean(from.live || to.live),
  };
}

export function isEmptyRange(range: TimeRangeText): boolean {
  return range.from.trim() === "" && range.to.trim() === "";
}

const pad = (n: number) => String(n).padStart(2, "0");

export function formatUtc(date: Date): string {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}T${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}Z`;
}

export function formatLocal(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export interface RangePreset {
  label: string;
  from: string;
  to: string;
}

export const rangePresets: RangePreset[] = [
  { label: "Last 15 minutes", from: "now-15m", to: "now" },
  { label: "Last hour", from: "now-1h", to: "now" },
  { label: "Last 6 hours", from: "now-6h", to: "now" },
  { label: "Last 24 hours", from: "now-24h", to: "now" },
  { label: "Last 7 days", from: "now-7d", to: "now" },
  { label: "Today since 00:00", from: "now/d", to: "now" },
  { label: "Yesterday", from: "now-1d/d", to: "now-1d/d" },
  { label: "This week", from: "now/w", to: "now" },
];

// The one-click escape hatch for a timed-out query: the "last N" presets
// strictly narrower than the range that just failed, widest first — a gentle
// step down, not a cliff. An empty or invalid range has no bound at all, so
// everything qualifies. At most two suggestions.
export function narrowingPresets(range: TimeRangeText, now: () => Date = () => new Date()): RangePreset[] {
  const resolved = resolveTimeRange(range, now);
  const spanMs = resolved ? resolved.to.getTime() - resolved.from.getTime() : Infinity;
  const spanOf = (preset: RangePreset) => {
    const r = resolveTimeRange({ from: preset.from, to: preset.to }, now)!;
    return r.to.getTime() - r.from.getTime();
  };
  return rangePresets
    .filter((preset) => preset.to === "now" && !preset.from.includes("/") && spanOf(preset) < spanMs)
    .slice(-2)
    .reverse();
}

// The initial range when the URL doesn't carry one. Users can save their own
// default (kept in this browser); the factory default bounds the first query
// so opening the view never scans the whole store.
export const factoryDefaultRange: TimeRangeText = { from: "now-6h", to: "now" };

const DEFAULT_RANGE_STORAGE_KEY = "audit.defaultTimeRange";

export function loadDefaultRange(): TimeRangeText {
  try {
    const stored = JSON.parse(localStorage.getItem(DEFAULT_RANGE_STORAGE_KEY) ?? "");
    if (stored && typeof stored.from === "string" && typeof stored.to === "string") {
      return { from: stored.from, to: stored.to };
    }
  } catch {
    // fall through to the factory default
  }
  return { ...factoryDefaultRange };
}

export function saveDefaultRange(range: TimeRangeText | null): void {
  try {
    if (range === null) {
      localStorage.removeItem(DEFAULT_RANGE_STORAGE_KEY);
    } else {
      localStorage.setItem(DEFAULT_RANGE_STORAGE_KEY, JSON.stringify(range));
    }
  } catch {
    // storage unavailable: the default just doesn't persist
  }
}
