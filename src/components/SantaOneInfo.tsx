import React from 'react';

export function SantaOneInfo() {
  const specs = [
    { label: 'Aircraft Type', value: 'All-weather, multi-purpose Christmas delivery sleigh' },
    { label: 'Designer', value: 'K. Kringle & Elves, Inc.' },
    { label: 'Home Base', value: 'North Pole' },
    { label: 'First Flight', value: 'December 24, 343 A.D.' },
    { label: 'Gift Payload', value: '60,000 tons' },
    { label: 'Santa Takeoff Weight', value: '260 lb' },
    { label: 'Propulsion', value: '9 RP — Reindeer Power' },
    { label: 'Fuel', value: 'Hay, oats & carrots' },
    { label: 'Maximum Speed', value: 'Faster than starlight' },
    { label: 'Climb Rate', value: 'One "T" — Twinkle of an Eye' },
  ];

  const reindeer = ['Dasher', 'Dancer', 'Prancer', 'Vixen', 'Comet', 'Cupid', 'Donner', 'Blitzen', 'Rudolph'];

  return (
    <div className="santa-one-info">
      <h2>SANTA ONE — TECHNICAL SPECIFICATIONS</h2>
      <div className="specs-grid">
        {specs.map((spec) => (
          <div key={spec.label} className="spec-item">
            <small>{spec.label}</small>
            <strong>{spec.value}</strong>
          </div>
        ))}
      </div>
      <div className="reindeer-section">
        <h3>SLEIGH CREW — REINDEER ROSTER</h3>
        <div className="reindeer-list">
          {reindeer.map((name) => (
            <div key={name} className="reindeer-badge">
              {name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
