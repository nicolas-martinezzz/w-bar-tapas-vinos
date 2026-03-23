/**
 * Converts "HH:MM" or "HH:MM:SS" to minutes from midnight.
 */
export function parseTimeToMinutes(hora: string): number {
  const parts = hora.trim().split(':');
  const h = Number(parts[0]);
  const m = Number(parts[1] ?? 0);
  if (Number.isNaN(h) || Number.isNaN(m)) {
    throw new Error('INVALID_TIME');
  }
  return h * 60 + m;
}

export function intervalsOverlap(
  startA: number,
  endA: number,
  startB: number,
  endB: number
): boolean {
  return startA < endB && startB < endA;
}

export function reservationWindowMinutes(hora: string, duracionMinutos: number): { start: number; end: number } {
  const start = parseTimeToMinutes(hora);
  const end = start + duracionMinutos;
  return { start, end };
}
