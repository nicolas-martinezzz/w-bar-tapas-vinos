import { NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/require-admin-auth';
import { mapOpenMeteoDailyToRecord, type OpenMeteoDailyResponse } from '@/lib/weather-open-meteo';
import { RESTAURANT_COORDINATES } from '@/config/restaurant';

export const dynamic = 'force-dynamic';

/**
 * Proxies Open-Meteo (free, no key) for restaurant coordinates. Admin-only.
 */
export async function GET() {
  const auth = await requireAdminAuth();
  if (!auth.ok) {
    return auth.response;
  }

  const { latitude, longitude } = RESTAURANT_COORDINATES;

  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', String(latitude));
  url.searchParams.set('longitude', String(longitude));
  url.searchParams.set(
    'daily',
    'weathercode,precipitation_probability_max,windspeed_10m_max'
  );
  url.searchParams.set('timezone', 'America/Argentina/Buenos_Aires');
  url.searchParams.set('past_days', '92');
  url.searchParams.set('forecast_days', '16');

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
    if (!res.ok) {
      return NextResponse.json(
        { error: 'WEATHER', message: 'El servicio de clima no respondió.' },
        { status: 502 }
      );
    }
    const json = (await res.json()) as OpenMeteoDailyResponse;
    const days = mapOpenMeteoDailyToRecord(json);
    return NextResponse.json({ data: { days } });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: 'WEATHER', message }, { status: 502 });
  }
}
