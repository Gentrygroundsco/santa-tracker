import React from 'react';
import { DateTime } from 'luxon';
import { SANTA_ROUTE_2026, FINAL_GIFT_TARGET, ROUTE_START, ROUTE_END } from '@/data/santaRoute2026';
import { missionTime, getCountriesVisited } from '@/lib/timeHelpers';

const format = (n: number) => new Intl.NumberFormat('en-US').format(Math.floor(n));

export function MissionStats({ snapshot }: { snapshot: any }) {
  const countriesVisited = getCountriesVisited(SANTA_ROUTE_2026.slice(0, Math.floor(snapshot.progress * SANTA_ROUTE_2026.length)));
  const totalDistance = 52_000;
  const elapsedTime = missionTime(ROUTE_START, DateTime.now());
  const estimatedTotalTime = missionTime(ROUTE_START, ROUTE_END);

  return (
    <div className="mission-stats">
      <div className="stat-grid">
        <div className="stat-card">
          <small>GIFTS DELIVERED</small>
          <strong>{format(snapshot.gifts)}</strong>
          <span className="stat-pct">{Math.round(snapshot.gifts / FINAL_GIFT_TARGET * 100)}%</span>
        </div>
        <div className="stat-card">
          <small>DISTANCE TRAVELED</small>
          <strong>{format(snapshot.distanceMiles)} MI</strong>
        </div>
        <div className="stat-card">
          <small>CURRENT SPEED</small>
          <strong>{format(snapshot.speedMph)} MPH</strong>
        </div>
        <div className="stat-card">
          <small>ALTITUDE</small>
          <strong>{format(snapshot.altitudeMeters * 3.28084)} FT</strong>
        </div>
        <div className="stat-card">
          <small>LOCATIONS VISITED</small>
          <strong>{Math.floor(snapshot.progress * SANTA_ROUTE_2026.length)} / {SANTA_ROUTE_2026.length}</strong>
        </div>
        <div className="stat-card">
          <small>COUNTRIES/TERRITORIES</small>
          <strong>{countriesVisited}</strong>
        </div>
      </div>
    </div>
  );
}
