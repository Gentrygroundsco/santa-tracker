import React from 'react';
import { DateTime } from 'luxon';

const ROUTE_START = DateTime.utc(2026, 12, 24, 0, 0);

export function LaunchCountdown({ now }: { now: DateTime }) {
  if (now >= ROUTE_START) return null;

  const diff = Math.floor(ROUTE_START.diff(now).as('seconds'));
  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  const seconds = diff % 60;

  return (
    <div className="countdown-overlay">
      <div className="countdown-card">
        <h2>SANTA LAUNCHES IN</h2>
        <div className="countdown-timer">
          <div className="countdown-unit">
            <span className="countdown-value">{String(days).padStart(2, '0')}</span>
            <span className="countdown-label">DAYS</span>
          </div>
          <div className="countdown-unit">
            <span className="countdown-value">{String(hours).padStart(2, '0')}</span>
            <span className="countdown-label">HOURS</span>
          </div>
          <div className="countdown-unit">
            <span className="countdown-value">{String(minutes).padStart(2, '0')}</span>
            <span className="countdown-label">MINUTES</span>
          </div>
          <div className="countdown-unit">
            <span className="countdown-value">{String(seconds).padStart(2, '0')}</span>
            <span className="countdown-label">SECONDS</span>
          </div>
        </div>
        <div className="north-pole-status">
          <div className="status-item"><i className="status-dot" />Sleigh: READY</div>
          <div className="status-item"><i className="status-dot" />Navigation: ONLINE</div>
          <div className="status-item"><i className="status-dot" />Reindeer: READY</div>
          <div className="status-item"><i className="status-dot" />Weather: MONITORING</div>
          <div className="status-item"><i className="status-dot" />Route: CALCULATED</div>
        </div>
      </div>
    </div>
  );
}
