import { describe, expect, it } from 'vitest';
import { intervalsOverlap, parseTimeToMinutes, reservationWindowMinutes } from '@/lib/reserva-overlap';

describe('parseTimeToMinutes', () => {
  it('parses HH:MM', () => {
    expect(parseTimeToMinutes('14:30')).toBe(14 * 60 + 30);
  });

  it('parses HH:MM:SS', () => {
    expect(parseTimeToMinutes('09:15:00')).toBe(9 * 60 + 15);
  });

  it('throws on invalid time', () => {
    expect(() => parseTimeToMinutes('xx')).toThrow('INVALID_TIME');
  });
});

describe('intervalsOverlap', () => {
  it('detects overlap', () => {
    expect(intervalsOverlap(60, 120, 90, 150)).toBe(true);
  });

  it('detects no overlap when touching end', () => {
    expect(intervalsOverlap(60, 120, 120, 180)).toBe(false);
  });

  it('detects no overlap when separate', () => {
    expect(intervalsOverlap(60, 90, 120, 150)).toBe(false);
  });
});

describe('reservationWindowMinutes', () => {
  it('returns start and end from duration', () => {
    const w = reservationWindowMinutes('20:00', 90);
    expect(w.start).toBe(20 * 60);
    expect(w.end).toBe(20 * 60 + 90);
  });
});
