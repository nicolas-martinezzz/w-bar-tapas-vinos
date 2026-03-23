import type { SupabaseClient } from '@supabase/supabase-js';
import {
  intervalsOverlap,
  parseTimeToMinutes,
  reservationWindowMinutes,
} from '@/lib/reserva-overlap';

type ReservaRow = {
  id: number;
  hora: string;
  duracion_minutos: number | null;
};

/**
 * Ensures party size does not exceed table capacity when a table is assigned.
 */
export async function assertPartyFitsMesa(
  supabase: SupabaseClient,
  mesaId: number | null,
  personas: number
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (mesaId == null) {
    return { ok: true };
  }

  const { data, error } = await supabase.from('mesas').select('capacidad').eq('id', mesaId).maybeSingle();

  if (error) {
    return { ok: false, message: error.message };
  }
  if (!data) {
    return { ok: false, message: 'Mesa no encontrada.' };
  }
  if (personas > data.capacidad) {
    return {
      ok: false,
      message: `Las personas superan la capacidad de la mesa (máx. ${data.capacidad}).`,
    };
  }

  return { ok: true };
}

/**
 * Blocks overlapping reservations on the same table (excluding cancelled).
 */
export async function assertNoReservationOverlap(
  supabase: SupabaseClient,
  params: {
    mesaId: number | null;
    fecha: string;
    hora: string;
    duracionMinutos: number;
    excludeReservaId?: number;
  }
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (params.mesaId == null) {
    return { ok: true };
  }

  let window: { start: number; end: number };
  try {
    window = reservationWindowMinutes(params.hora, params.duracionMinutos);
  } catch {
    return { ok: false, message: 'Hora inválida.' };
  }

  let query = supabase
    .from('reservas')
    .select('id, hora, duracion_minutos')
    .eq('mesa_id', params.mesaId)
    .eq('fecha', params.fecha)
    .neq('estado', 'cancelada');

  if (params.excludeReservaId != null) {
    query = query.neq('id', params.excludeReservaId);
  }

  const { data, error } = await query;

  if (error) {
    return { ok: false, message: error.message };
  }

  const rows = (data ?? []) as ReservaRow[];

  for (const row of rows) {
    const dur = row.duracion_minutos ?? 90;
    let rowWindow: { start: number; end: number };
    try {
      rowWindow = reservationWindowMinutes(row.hora, dur);
    } catch {
      continue;
    }
    if (intervalsOverlap(window.start, window.end, rowWindow.start, rowWindow.end)) {
      return {
        ok: false,
        message: 'Esta mesa ya tiene una reserva que se solapa con ese horario.',
      };
    }
  }

  return { ok: true };
}

export { parseTimeToMinutes };
