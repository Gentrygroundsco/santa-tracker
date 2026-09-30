import { DateTime } from 'luxon';

export type WeatherData = {
  temperature: number;
  condition: string;
  windSpeed: number;
  windDirection: string;
  humidity: number;
  icon: string;
  lastUpdated: DateTime;
};

const conditions: Record<number, { condition: string; icon: string }> = {
  0: { condition: 'Clear', icon: '☀️' },
  1: { condition: 'Mostly Clear', icon: '🌤' },
  2: { condition: 'Partly Cloudy', icon: '⛅' },
  3: { condition: 'Overcast', icon: '☁️' },
  45: { condition: 'Foggy', icon: '🌫️' },
  48: { condition: 'Foggy', icon: '🌫️' },
  51: { condition: 'Light Drizzle', icon: '🌧️' },
  53: { condition: 'Drizzle', icon: '🌧️' },
  55: { condition: 'Heavy Drizzle', icon: '🌧️' },
  61: { condition: 'Rainy', icon: '🌧️' },
  63: { condition: 'Heavy Rain', icon: '⛈️' },
  65: { condition: 'Very Heavy Rain', icon: '⛈️' },
  71: { condition: 'Light Snow', icon: '❄️' },
  73: { condition: 'Snow', icon: '❄️' },
  75: { condition: 'Heavy Snow', icon: '❄️' },
  80: { condition: 'Showers', icon: '🌦️' },
  81: { condition: 'Heavy Showers', icon: '⛈️' },
  82: { condition: 'Violent Showers', icon: '⛈️' },
  95: { condition: 'Thunderstorm', icon: '⛈️' },
  96: { condition: 'Thunderstorm with Hail', icon: '⛈️' },
  99: { condition: 'Thunderstorm with Hail', icon: '⛈️' },
};

const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];

function mockWeather(lat: number, lon: number, _temp: DateTime): WeatherData {
  const seed = Math.abs(Math.sin(lat * 12.9898 + lon * 78.233) * 43758.5453);
  const code = Math.floor((seed % 1) * 12) * 5;
  const { condition, icon } = conditions[code] || { condition: 'Clear', icon: '☀️' };
  const tempBase = 15 + Math.sin(lon / 30) * 25 + Math.cos(lat / 20) * 10;
  const temperature = Math.round(tempBase + (Math.sin(seed * 123) * 8 - 4));
  const windBase = 8 + Math.abs(Math.sin(seed * 456)) * 12;
  const windSpeed = Math.round(windBase);
  const dirIndex = Math.floor((seed * 789) % directions.length);
  return { temperature, condition, windSpeed, windDirection: directions[dirIndex], humidity: Math.round(40 + Math.abs(Math.sin(seed * 111)) * 40), icon, lastUpdated: DateTime.now() };
}

export async function fetchWeather(lat: number, lon: number, time: DateTime): Promise<WeatherData> {
  try {
    if (process.env.NODE_ENV === 'development' || !process.env.VITE_WEATHER_API_KEY) {
      return mockWeather(lat, lon, time);
    }
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m,wind_direction_10m,relative_humidity_2m&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto`;
    const response = await fetch(url);
    if (!response.ok) return mockWeather(lat, lon, time);
    const data = await response.json();
    const current = data.current;
    const code = current.weather_code;
    const { condition, icon } = conditions[code] || { condition: 'Unknown', icon: '🌍' };
    const dirIndex = Math.floor((current.wind_direction_10m / 22.5) % 16);
    return { temperature: Math.round(current.temperature_2m), condition, windSpeed: Math.round(current.wind_speed_10m), windDirection: directions[dirIndex], humidity: current.relative_humidity_2m, icon, lastUpdated: DateTime.now() };
  } catch {
    return mockWeather(lat, lon, time);
  }
}
