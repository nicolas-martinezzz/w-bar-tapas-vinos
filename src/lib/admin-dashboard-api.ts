import type { Mesa, Reserva } from '@/lib/supabase';

export type ApiJson = {
  error?: string;
  message?: string;
  data?: unknown;
};

export type DashboardPayload = {
  mesas: Mesa[];
  reservas: Reserva[];
};

export async function readAdminApiResponse<T>(
  res: Response
): Promise<{ ok: true; data: T } | { ok: false; message: string }> {
  const json = (await res.json()) as ApiJson;
  if (!res.ok) {
    if (res.status === 401) {
      window.location.href = '/admin';
    }
    return { ok: false, message: json.message || 'Ha ocurrido un error.' };
  }
  return { ok: true, data: json.data as T };
}

export function formatDurationLabel(minutes: number): string {
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (m === 0) {
      return `${h} h`;
    }
    return `${h} h ${m} min`;
  }
  return `${minutes} min`;
}
