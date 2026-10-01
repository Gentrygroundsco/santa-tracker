import React, { useState, useEffect } from 'react';
import { DateTime } from 'luxon';

export function DeveloperPanel({
  onTimeChange,
  onSpeedChange,
  currentTime,
  currentSpeed,
}: {
  onTimeChange: (time: DateTime) => void;
  onSpeedChange: (speed: number) => void;
  currentTime: DateTime;
  currentSpeed: number;
}) {
  const [expanded, setExpanded] = useState(false);

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className={`dev-panel ${expanded ? 'expanded' : ''}`}>
      <button className="dev-toggle" onClick={() => setExpanded(!expanded)}>
        {expanded ? '✕' : '⚙️'} DEV
      </button>
      {expanded && (
        <div className="dev-controls">
          <label>
            Time:
            <input
              type="datetime-local"
              value={currentTime.toISO()?.slice(0, 16) || ''}
              onChange={(e) => onTimeChange(DateTime.fromISO(e.target.value))}
            />
          </label>
          <label>
            Speed: {currentSpeed}×
            <input type="range" min="1" max="100" value={currentSpeed} onChange={(e) => onSpeedChange(Number(e.target.value))} />
          </label>
          <div className="dev-info">
            <p>Mode: {process.env.NODE_ENV}</p>
            <p>Route: 518 stops loaded</p>
          </div>
        </div>
      )}
    </div>
  );
}
