/**
 * Open-Meteo daily forecast parsing and display helpers (WMO weather codes).
 * @see https://open-meteo.com/en/docs
 */

export type DayWeatherPublic = {
  date: string;
  weathercode: number | null;
  precipProbMax: number | null;
  windMaxKmh: number | null;
  label: string;
  flags: {
    rain: boolean;
    heavyWind: boolean;
    storm: boolean;
  };
  tooltip: string;
};

const WIND_ALERT_KMH = 38;
const PRECIP_ALERT_PCT = 45;

function wmoShortLabel(code: number): string {
  if (code === 0) {
    return 'Despejado';
  }
  if (code <= 3) {
    return 'Nublado';
  }
  if (code <= 48) {
    return 'Niebla';
  }
  if (code <= 67) {
    return 'Lluvia';
  }
  if (code <= 77) {
    return 'Nieve';
  }
  if (code <= 82) {
    return 'Chubascos';
  }
  if (code <= 86) {
    return 'Chubascos fuertes';
  }
  if (code <= 99) {
    return 'Tormenta';
  }
  return 'Variable';
}

export function deriveDayWeather(
  date: string,
  weathercode: number | null,
  precipProbMax: number | null,
  windMaxKmh: number | null
): DayWeatherPublic {
  const code = weathercode;
  const storm = code != null && code >= 95;
  const rainFromCode =
    code != null &&
    ((code >= 51 && code <= 67) ||
      (code >= 61 && code <= 65) ||
      (code >= 80 && code <= 86) ||
      (code >= 96 && code <= 99));
  const rain =
    storm || rainFromCode || (precipProbMax != null && precipProbMax >= PRECIP_ALERT_PCT);
  const heavyWind = windMaxKmh != null && windMaxKmh >= WIND_ALERT_KMH;

  const label = code != null ? wmoShortLabel(code) : 'Sin datos';

  const parts: string[] = [label];
  if (precipProbMax != null) {
    parts.push(`Lluvia hasta ${Math.round(precipProbMax)}%`);
  }
  if (windMaxKmh != null) {
    parts.push(`Viento hasta ${Math.round(windMaxKmh)} km/h`);
  }
  const tooltip = parts.join(' · ');

  return {
    date,
    weathercode: code,
    precipProbMax,
    windMaxKmh,
    label,
    flags: { rain, heavyWind, storm },
    tooltip,
  };
}

export type OpenMeteoDailyResponse = {
  daily?: {
    time?: string[];
    weathercode?: number[];
    precipitation_probability_max?: (number | null)[];
    windspeed_10m_max?: (number | null)[];
  };
};

export function mapOpenMeteoDailyToRecord(json: OpenMeteoDailyResponse): Record<string, DayWeatherPublic> {
  const daily = json.daily;
  if (!daily?.time?.length) {
    return {};
  }
  const times = daily.time;
  const codes = daily.weathercode ?? [];
  const precips = daily.precipitation_probability_max ?? [];
  const winds = daily.windspeed_10m_max ?? [];
  const out: Record<string, DayWeatherPublic> = {};

  for (let i = 0; i < times.length; i++) {
    const date = times[i];
    const code = codes[i] ?? null;
    const pp = precips[i] ?? null;
    const w = winds[i] ?? null;
    out[date] = deriveDayWeather(date, code, pp, w);
  }
  return out;
}
