import { DEFAULT_RESERVATION_SLOT_MINUTES } from '@/lib/admin-defaults';
import { intervalsOverlap, reservationWindowMinutes } from '@/lib/reserva-overlap';
import type { Mesa, Reserva } from '@/lib/supabase';

export type ReservaAlertType = 'overlap' | 'capacity';

export type ReservaAlert = {
  reservaId: number;
  type: ReservaAlertType;
  message: string;
};

function isActive(r: Reserva): boolean {
  return r.estado !== 'cancelada';
}

/**
 * Detects overlapping reservations on the same table same day, and party size over table capacity.
 */
export function computeReservaAlerts(reservas: Reserva[], mesas: Mesa[]): ReservaAlert[] {
  const mesaById = new Map<number, Mesa>();
  mesas.forEach((m) => mesaById.set(m.id, m));

  const byFechaMesa = new Map<string, Reserva[]>();

  for (const r of reservas) {
    if (!isActive(r) || r.mesa_id == null) {
      continue;
    }
    const key = `${r.fecha}|${r.mesa_id}`;
    const list = byFechaMesa.get(key) ?? [];
    list.push(r);
    byFechaMesa.set(key, list);
  }

  const overlapAlerts: ReservaAlert[] = [];

  for (const [, list] of byFechaMesa) {
    const sorted = [...list].sort((a, b) => a.hora.localeCompare(b.hora));
    for (let i = 0; i < sorted.length; i++) {
      for (let j = i + 1; j < sorted.length; j++) {
        const a = sorted[i];
        const b = sorted[j];
        const durA = a.duracion_minutos ?? DEFAULT_RESERVATION_SLOT_MINUTES;
        const durB = b.duracion_minutos ?? DEFAULT_RESERVATION_SLOT_MINUTES;
        let wa: { start: number; end: number };
        let wb: { start: number; end: number };
        try {
          wa = reservationWindowMinutes(a.hora, durA);
          wb = reservationWindowMinutes(b.hora, durB);
        } catch {
          continue;
        }
        if (intervalsOverlap(wa.start, wa.end, wb.start, wb.end)) {
          const label =
            a.mesa_id != null ? (mesaById.get(a.mesa_id)?.nombre ?? `Mesa ${a.mesa_id}`) : 'Mesa';
          overlapAlerts.push({
            reservaId: a.id,
            type: 'overlap',
            message: `Solapa con otra reserva en ${label} el mismo día.`,
          });
          overlapAlerts.push({
            reservaId: b.id,
            type: 'overlap',
            message: `Solapa con otra reserva en ${label} el mismo día.`,
          });
        }
      }
    }
  }

  const capacityAlerts: ReservaAlert[] = [];
  for (const r of reservas) {
    if (!isActive(r) || r.mesa_id == null) {
      continue;
    }
    const mesa = mesaById.get(r.mesa_id);
    if (!mesa) {
      continue;
    }
    if (r.personas > mesa.capacidad) {
      capacityAlerts.push({
        reservaId: r.id,
        type: 'capacity',
        message: `${r.personas} personas superan la capacidad de ${mesa.nombre} (${mesa.capacidad}).`,
      });
    }
  }

  return [...overlapAlerts, ...capacityAlerts];
}

export function alertsByReservaId(alerts: ReservaAlert[]): Map<number, ReservaAlert[]> {
  const map = new Map<number, ReservaAlert[]>();
  for (const a of alerts) {
    const list = map.get(a.reservaId) ?? [];
    list.push(a);
    map.set(a.reservaId, list);
  }
  return map;
}

export function summarizeAlerts(alerts: ReservaAlert[]): {
  overlapReservaCount: number;
  capacityReservaCount: number;
} {
  const overlapIds = new Set<number>();
  const capacityIds = new Set<number>();
  for (const a of alerts) {
    if (a.type === 'overlap') {
      overlapIds.add(a.reservaId);
    } else {
      capacityIds.add(a.reservaId);
    }
  }
  return {
    overlapReservaCount: overlapIds.size,
    capacityReservaCount: capacityIds.size,
  };
}
