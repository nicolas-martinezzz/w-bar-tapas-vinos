/**
 * Date helpers for admin calendar (local calendar day via noon anchor).
 */

export function parseISODateLocal(iso: string): Date {
  return new Date(`${iso}T12:00:00`);
}

export function toISODateLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function addDaysISO(iso: string, deltaDays: number): string {
  const d = parseISODateLocal(iso);
  d.setDate(d.getDate() + deltaDays);
  return toISODateLocal(d);
}

export function addMonthsISO(iso: string, deltaMonths: number): string {
  const d = parseISODateLocal(iso);
  d.setMonth(d.getMonth() + deltaMonths);
  return toISODateLocal(d);
}

/** Monday as first day of week (common for es-AR). */
export function startOfWeekMondayISO(iso: string): string {
  const d = parseISODateLocal(iso);
  const dow = d.getDay();
  const diff = dow === 0 ? -6 : 1 - dow;
  d.setDate(d.getDate() + diff);
  return toISODateLocal(d);
}

export function eachDayOfWeekFrom(weekStartISO: string): string[] {
  const out: string[] = [];
  for (let i = 0; i < 7; i++) {
    out.push(addDaysISO(weekStartISO, i));
  }
  return out;
}

export type MonthCell = {
  iso: string;
  inCurrentMonth: boolean;
};

/**
 * 6-row calendar grid (42 cells) starting Monday, for the month containing `iso`.
 */
export function buildMonthGrid(iso: string): { year: number; monthIndex: number; cells: MonthCell[] } {
  const anchor = parseISODateLocal(iso);
  const year = anchor.getFullYear();
  const monthIndex = anchor.getMonth();

  const firstOfMonth = new Date(year, monthIndex, 1, 12, 0, 0, 0);
  const firstDow = firstOfMonth.getDay();
  const lead = firstDow === 0 ? 6 : firstDow - 1;

  const gridStart = new Date(firstOfMonth);
  gridStart.setDate(firstOfMonth.getDate() - lead);

  const cells: MonthCell[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    cells.push({
      iso: toISODateLocal(d),
      inCurrentMonth: d.getMonth() === monthIndex,
    });
  }

  return { year, monthIndex, cells };
}
