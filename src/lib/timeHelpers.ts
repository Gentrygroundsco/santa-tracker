import { DateTime } from 'luxon';

export function formatLocalTime(time: DateTime, timezone: string): string {
  try {
    return time.setZone(timezone).toFormat('h:mm a ZZZZ');
  } catch {
    return time.toFormat('h:mm a');
  }
}

export function getCountriesVisited(stops: { countryCode: string }[]): number {
  return new Set(stops.map((s) => s.countryCode)).size;
}

export function missionTime(start: DateTime, end: DateTime): string {
  const seconds = Math.floor(end.diff(start).as('seconds'));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function nextLaunchCountdown(now: DateTime, launch: DateTime): { days: number; hours: number; minutes: number; seconds: number } | null {
  if (now >= launch) return null;
  const diff = Math.floor(launch.diff(now).as('seconds'));
  return { days: Math.floor(diff / 86400), hours: Math.floor((diff % 86400) / 3600), minutes: Math.floor((diff % 3600) / 60), seconds: diff % 60 };
}
