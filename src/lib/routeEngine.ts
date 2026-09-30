import { DateTime } from 'luxon';
import type { SantaStop } from '@/data/santaRoute2026';
import { FINAL_GIFT_TARGET, ROUTE_END, ROUTE_START, SANTA_ROUTE_2026 } from '@/data/santaRoute2026';

export type RouteSnapshot = {
  previous: SantaStop;
  current: SantaStop;
  next: SantaStop;
  progress: number;
  segmentProgress: number;
  latitude: number;
  longitude: number;
  altitudeMeters: number;
  speedMph: number;
  distanceMiles: number;
  gifts: number;
  phase: 'PREPARING' | 'AIRBORNE' | 'DELIVERING PRESENTS' | 'MISSION COMPLETE';
};

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const toRad = (n: number) => n * Math.PI / 180;
const toDeg = (n: number) => n * 180 / Math.PI;

export function greatCircle(a: SantaStop, b: SantaStop, t: number) {
  const φ1 = toRad(a.latitude), φ2 = toRad(b.latitude);
  const λ1 = toRad(a.longitude), λ2 = toRad(b.longitude);
  const delta = 2 * Math.asin(Math.sqrt(Math.sin((φ2 - φ1) / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin((λ2 - λ1) / 2) ** 2));
  if (delta < 0.000001) return { latitude: a.latitude, longitude: a.longitude };
  const A = Math.sin((1 - t) * delta) / Math.sin(delta);
  const B = Math.sin(t * delta) / Math.sin(delta);
  const x = A * Math.cos(φ1) * Math.cos(λ1) + B * Math.cos(φ2) * Math.cos(λ2);
  const y = A * Math.cos(φ1) * Math.sin(λ1) + B * Math.cos(φ2) * Math.sin(λ2);
  const z = A * Math.sin(φ1) + B * Math.sin(φ2);
  return { latitude: toDeg(Math.atan2(z, Math.sqrt(x * x + y * y))), longitude: toDeg(Math.atan2(y, x)) };
}

function weightedGiftTarget(stopIndex: number) {
  const weight = SANTA_ROUTE_2026.slice(0, stopIndex).reduce((sum, stop) => sum + stop.populationWeight, 0);
  const total = SANTA_ROUTE_2026.reduce((sum, stop) => sum + stop.populationWeight, 0);
  return Math.round(FINAL_GIFT_TARGET * weight / total);
}

export function snapshotAt(instant: DateTime): RouteSnapshot {
  const elapsed = instant.toMillis() - ROUTE_START.toMillis();
  const duration = ROUTE_END.toMillis() - ROUTE_START.toMillis();
  const progress = clamp(elapsed / duration);
  const rawIndex = progress * (SANTA_ROUTE_2026.length - 1);
  const index = Math.min(SANTA_ROUTE_2026.length - 2, Math.floor(rawIndex));
  const segmentProgress = rawIndex - index;
  const previous = SANTA_ROUTE_2026[Math.max(0, index - 1)];
  const current = SANTA_ROUTE_2026[index];
  const next = SANTA_ROUTE_2026[index + 1];
  const position = greatCircle(current, next, segmentProgress);
  const altitudeMeters = 9000 + Math.sin(segmentProgress * Math.PI) * 3500 + Math.sin(progress * Math.PI * 22) * 120;
  const distanceMiles = progress * 52_000;
  const speedMph = Math.max(0, 700_000 + Math.sin(progress * Math.PI * 18) * 220_000);
  const gifts = Math.max(0, weightedGiftTarget(index) + Math.round(segmentProgress * (weightedGiftTarget(index + 1) - weightedGiftTarget(index))));
  const phase = progress >= 1 ? 'MISSION COMPLETE' : segmentProgress < 0.08 ? 'DELIVERING PRESENTS' : 'AIRBORNE';
  return { previous, current, next, progress, segmentProgress, ...position, altitudeMeters, speedMph, distanceMiles, gifts, phase };
}
