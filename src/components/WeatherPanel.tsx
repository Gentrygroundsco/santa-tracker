import React, { useEffect, useState } from 'react';
import type { WeatherData } from '@/lib/weather';
import { fetchWeather } from '@/lib/weather';
import { DateTime } from 'luxon';

export function WeatherPanel({ latitude, longitude, time }: { latitude: number; longitude: number; time: DateTime }) {
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    fetchWeather(latitude, longitude, time).then(setWeather);
  }, [latitude, longitude]);

  if (!weather) return <div className="weather-loading">Loading weather...</div>;

  return (
    <div className="weather-panel">
      <small className="eyebrow">CURRENT CONDITIONS</small>
      <div className="weather-content">
        <div className="weather-icon">{weather.icon}</div>
        <div className="weather-info">
          <div className="weather-condition">{weather.condition}</div>
          <div className="weather-temp">{weather.temperature}°F</div>
          <div className="weather-details">Wind {weather.windDirection} {weather.windSpeed} mph • {weather.humidity}% humidity</div>
        </div>
      </div>
    </div>
  );
}
