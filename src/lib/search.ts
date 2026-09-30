import type { SantaStop } from '@/data/santaRoute2026';

export function searchNearby(query: string, allStops: SantaStop[], userLat?: number, userLon?: number): SantaStop[] {
  const lower = query.toLowerCase();
  const matches = allStops.filter((stop) => stop.city.toLowerCase().includes(lower) || stop.region?.toLowerCase().includes(lower) || stop.country.toLowerCase().includes(lower));
  if (!matches.length || userLat === undefined || userLon === undefined) return matches.slice(0, 10);
  const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 3959;
    const toRad = (n: number) => n * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
  };
  return matches.sort((a, b) => haversine(userLat, userLon, a.latitude, a.longitude) - haversine(userLat, userLon, b.latitude, b.longitude)).slice(0, 10);
}
