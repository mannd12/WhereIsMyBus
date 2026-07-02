/** Human-friendly distance: rounds metres to the nearest 10, switches to km past 1 km. */
export function formatDistance(metres: number): string {
  if (metres < 1000) return `${Math.round(metres / 10) * 10} m`;
  return `${(metres / 1000).toFixed(1)} km`;
}

/** Rough walking time in minutes at ~80 m/min (min 1). */
export function walkMinutes(metres: number): number {
  return Math.max(1, Math.round(metres / 80));
}

/** Compact "time ago" for a past epoch-seconds timestamp (e.g. "3h ago"). */
export function timeAgo(epochSeconds: number): string {
  const secs = Math.floor(Date.now() / 1000) - epochSeconds;
  if (secs < 60) return 'just now';
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}
