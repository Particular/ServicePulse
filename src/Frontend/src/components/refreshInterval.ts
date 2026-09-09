// Auto-refresh intervals and their labels. The control shows the short form the way
// Grafana does ("5s", "1m", "1h"); the menu adds the long form for clarity.

export interface RefreshIntervalOption {
  ms: number; // 0 = off
  short: string;
  long: string;
}

export function abbreviateInterval(ms: number | null): string {
  if (!ms) return "Off";
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  return `${Math.round(minutes / 60)}h`;
}

function describeInterval(ms: number): string {
  if (ms === 0) return "Off";
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `Every ${seconds} seconds`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return minutes === 1 ? "Every minute" : `Every ${minutes} minutes`;
  const hours = Math.round(minutes / 60);
  return hours === 1 ? "Every hour" : `Every ${hours} hours`;
}

export const refreshIntervalOptions: RefreshIntervalOption[] = [0, 5_000, 15_000, 30_000, 60_000, 600_000, 1_800_000, 3_600_000].map((ms) => ({
  ms,
  short: abbreviateInterval(ms),
  long: describeInterval(ms),
}));
