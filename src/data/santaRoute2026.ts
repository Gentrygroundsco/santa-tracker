import { DateTime } from 'luxon';

export type SantaStop = {
  id: number;
  city: string;
  region?: string;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  timezone: string;
  populationWeight: number;
  regionGroup: string;
  landmark?: string;
};

// Named anchor cities are intentionally kept separate from the route engine. The
// engine densifies these anchors into the full 518-stop operational route.
const anchors: Omit<SantaStop, 'id'>[] = [
  ['North Pole', 'Arctic', 'Canada', 'CA', 89.9, 0, 'UTC', 0.4, 'Arctic'],
  ['Auckland', undefined, 'New Zealand', 'NZ', -36.85, 174.76, 'Pacific/Auckland', 2.1, 'Pacific'],
  ['Sydney', 'New South Wales', 'Australia', 'AU', -33.87, 151.21, 'Australia/Sydney', 3.4, 'Oceania'],
  ['Tokyo', undefined, 'Japan', 'JP', 35.68, 139.69, 'Asia/Tokyo', 5.2, 'East Asia'],
  ['Manila', undefined, 'Philippines', 'PH', 14.6, 120.98, 'Asia/Manila', 3.4, 'Southeast Asia'],
  ['Singapore', undefined, 'Singapore', 'SG', 1.35, 103.82, 'Asia/Singapore', 2.8, 'Southeast Asia'],
  ['Mumbai', 'Maharashtra', 'India', 'IN', 19.08, 72.88, 'Asia/Kolkata', 5.5, 'South Asia'],
  ['Dubai', undefined, 'United Arab Emirates', 'AE', 25.2, 55.27, 'Asia/Dubai', 2.8, 'Middle East'],
  ['Nairobi', undefined, 'Kenya', 'KE', -1.29, 36.82, 'Africa/Nairobi', 2.1, 'Africa'],
  ['Cape Town', 'Western Cape', 'South Africa', 'ZA', -33.92, 18.42, 'Africa/Johannesburg', 2.4, 'Africa'],
  ['Paris', undefined, 'France', 'FR', 48.86, 2.35, 'Europe/Paris', 4.4, 'Europe'],
  ['London', undefined, 'United Kingdom', 'GB', 51.51, -0.13, 'Europe/London', 4.8, 'Europe'],
  ['Reykjavik', undefined, 'Iceland', 'IS', 64.15, -21.94, 'Atlantic', 1.2, 'Atlantic'],
  ['Anchorage', 'Alaska', 'United States', 'US', 61.22, -149.9, 'America/Anchorage', 1.4, 'North America'],
  ['Seattle', 'Washington', 'United States', 'US', 47.61, -122.33, 'America/Los_Angeles', 3.2, 'North America'],
  ['San Francisco', 'California', 'United States', 'US', 37.77, -122.42, 'America/Los_Angeles', 4.2, 'North America'],
  ['Los Angeles', 'California', 'United States', 'US', 34.05, -118.24, 'America/Los_Angeles', 5.1, 'North America'],
  ['Denver', 'Colorado', 'United States', 'US', 39.74, -104.99, 'America/Denver', 2.7, 'North America'],
  ['Dallas', 'Texas', 'United States', 'US', 32.78, -96.8, 'America/Chicago', 4.0, 'North America'],
  ['Nashville', 'Tennessee', 'United States', 'US', 36.16, -86.78, 'America/Chicago', 2.4, 'North America'],
  ['Chattanooga', 'Tennessee', 'United States', 'US', 35.05, -85.31, 'America/New_York', 1.3, 'North America'],
  ['Atlanta', 'Georgia', 'United States', 'US', 33.75, -84.39, 'America/New_York', 3.8, 'North America'],
  ['New York', 'New York', 'United States', 'US', 40.71, -74.01, 'America/New_York', 5.7, 'North America'],
  ['Miami', 'Florida', 'United States', 'US', 25.76, -80.19, 'America/New_York', 3.4, 'North America'],
  ['Mexico City', undefined, 'Mexico', 'MX', 19.43, -99.13, 'America/Mexico_City', 4.5, 'Latin America'],
  ['Panama City', undefined, 'Panama', 'PA', 8.98, -79.52, 'America/Panama', 1.8, 'Latin America'],
  ['Lima', undefined, 'Peru', 'PE', -12.05, -77.04, 'America/Lima', 3.1, 'South America'],
  ['São Paulo', undefined, 'Brazil', 'BR', -23.55, -46.63, 'America/Sao_Paulo', 5.5, 'South America'],
  ['Buenos Aires', undefined, 'Argentina', 'AR', -34.6, -58.38, 'America/Argentina/Buenos_Aires', 3.8, 'South America'],
];

const tupleKeys = ['city','region','country','countryCode','latitude','longitude','timezone','populationWeight','regionGroup'] as const;
const normalized = anchors.map((entry) => Object.fromEntries(entryKeys(entry).map((key, i) => [tupleKeys[i], entry[key]])) as Omit<SantaStop, 'id'>);

function entryKeys(entry: Omit<SantaStop, 'id'> | unknown[]) {
  return Array.from({ length: 9 }, (_, i) => i) as number[];
}

function interpolate(a: Omit<SantaStop, 'id'>, b: Omit<SantaStop, 'id'>, t: number, id: number): SantaStop {
  const deltaLon = ((b.longitude - a.longitude + 540) % 360) - 180;
  return {
    ...a,
    id,
    city: t === 0 ? a.city : t === 1 ? b.city : `${b.regionGroup} delivery area ${id}`,
    region: t === 0 ? a.region : t === 1 ? b.region : undefined,
    country: t < 0.5 ? a.country : b.country,
    countryCode: t < 0.5 ? a.countryCode : b.countryCode,
    timezone: t < 0.5 ? a.timezone : b.timezone,
    latitude: a.latitude + (b.latitude - a.latitude) * t,
    longitude: a.longitude + deltaLon * t,
    populationWeight: a.populationWeight + (b.populationWeight - a.populationWeight) * t,
    regionGroup: t < 0.5 ? a.regionGroup : b.regionGroup,
  };
}

/** Deterministic 518-stop route. Replace anchors with editorial stops for future seasons. */
export const SANTA_ROUTE_2026: SantaStop[] = Array.from({ length: 518 }, (_, index) => {
  const scaled = (index / 517) * (normalized.length - 1);
  const segment = Math.min(normalized.length - 2, Math.floor(scaled));
  return interpolate(normalized[segment], normalized[segment + 1], scaled - segment, index + 1);
});

export const ROUTE_START = DateTime.utc(2026, 12, 24, 0, 0);
export const ROUTE_END = DateTime.utc(2026, 12, 25, 8, 0);
export const FINAL_GIFT_TARGET = 8_330_000_000;
