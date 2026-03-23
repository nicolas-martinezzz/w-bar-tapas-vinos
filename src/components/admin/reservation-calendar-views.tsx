'use client';

import { ChevronLeft, ChevronRight, CloudLightning, CloudRain, Wind } from 'lucide-react';
import { useMemo } from 'react';
import {
  addDaysISO,
  addMonthsISO,
  buildMonthGrid,
  eachDayOfWeekFrom,
  parseISODateLocal,
  startOfWeekMondayISO,
  toISODateLocal,
} from '@/lib/dashboard-date-utils';
import type { DayWeatherPublic } from '@/lib/weather-open-meteo';
import type { Reserva } from '@/lib/supabase';

export type CalendarViewMode = 'day' | 'week' | 'month';

type ReservationCalendarViewsProps = {
  viewMode: CalendarViewMode;
  onViewModeChange: (mode: CalendarViewMode) => void;
  selectedDate: string;
  onSelectDate: (iso: string) => void;
  reservas: Reserva[];
  todayISO: string;
  weatherByDate: Record<string, DayWeatherPublic> | null;
  weatherLoading: boolean;
};

function countReservasOnDay(reservas: Reserva[], iso: string): number {
  return reservas.filter((r) => r.fecha === iso && r.estado !== 'cancelada').length;
}

function weekdayShort(iso: string): string {
  return parseISODateLocal(iso).toLocaleDateString('es-AR', { weekday: 'short' });
}

function WeatherMicro({ w }: { w: DayWeatherPublic }) {
  const { flags } = w;
  return (
    <div
      className="mt-1 flex flex-wrap items-center gap-0.5 justify-start min-h-[18px]"
      title={w.tooltip}
    >
      {flags.storm && <CloudLightning className="h-3.5 w-3.5 text-violet-300 shrink-0" aria-hidden />}
      {flags.rain && !flags.storm && (
        <CloudRain className="h-3.5 w-3.5 text-sky-300 shrink-0" aria-hidden />
      )}
      {flags.heavyWind && <Wind className="h-3.5 w-3.5 text-amber-200 shrink-0" aria-hidden />}
      {!flags.storm && !flags.rain && !flags.heavyWind && (
        <span className="text-[9px] text-stone-500 truncate">{w.label}</span>
      )}
    </div>
  );
}

function weatherCellClass(w: DayWeatherPublic | undefined, base: string): string {
  if (!w) {
    return base;
  }
  if (w.flags.storm) {
    return `${base} ring-1 ring-violet-500/50 bg-violet-950/20`;
  }
  if (w.flags.rain) {
    return `${base} ring-1 ring-sky-500/40 bg-sky-950/15`;
  }
  if (w.flags.heavyWind) {
    return `${base} ring-1 ring-amber-500/40 bg-amber-950/10`;
  }
  return base;
}

export default function ReservationCalendarViews({
  viewMode,
  onViewModeChange,
  selectedDate,
  onSelectDate,
  reservas,
  todayISO,
  weatherByDate,
  weatherLoading,
}: ReservationCalendarViewsProps) {
  const weekStart = useMemo(() => startOfWeekMondayISO(selectedDate), [selectedDate]);
  const weekDays = useMemo(() => eachDayOfWeekFrom(weekStart), [weekStart]);

  const monthMeta = useMemo(() => buildMonthGrid(selectedDate), [selectedDate]);
  const monthTitle = useMemo(() => {
    const d = parseISODateLocal(selectedDate);
    return d.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
  }, [selectedDate]);

  const weekRangeLabel = useMemo(() => {
    const a = parseISODateLocal(weekDays[0]);
    const b = parseISODateLocal(weekDays[6]);
    const sameMonth = a.getMonth() === b.getMonth();
    const left = a.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
    const right = b.toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'short',
      year: sameMonth ? undefined : 'numeric',
    });
    return `${left} — ${right}`;
  }, [weekDays]);

  const selectedDayWeather = weatherByDate?.[selectedDate];

  const handlePrevWeek = () => {
    onSelectDate(addDaysISO(weekStart, -7));
  };

  const handleNextWeek = () => {
    onSelectDate(addDaysISO(weekStart, 7));
  };

  const handlePrevMonth = () => {
    onSelectDate(addMonthsISO(selectedDate, -1));
  };

  const handleNextMonth = () => {
    onSelectDate(addMonthsISO(selectedDate, 1));
  };

  const modeBtn = (mode: CalendarViewMode, label: string) => {
    const active = viewMode === mode;
    return (
      <button
        type="button"
        onClick={() => onViewModeChange(mode)}
        className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all min-h-[44px] ${
          active
            ? 'bg-amber-500 text-stone-950 shadow-lg shadow-amber-900/30'
            : 'bg-stone-800/90 text-stone-300 border border-stone-600 hover:bg-stone-700 hover:text-white'
        }`}
        aria-pressed={active}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="rounded-2xl border border-stone-700/80 bg-gradient-to-br from-stone-900/80 to-stone-950/90 p-4 sm:p-6 shadow-xl transition-shadow duration-300">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-500/90">Vista del calendario</p>
          <p className="text-stone-400 text-sm mt-1">
            Día, semana o mes. El clima es orientativo (Open-Meteo, zona del local).
          </p>
        </div>
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Modo de vista">
          {modeBtn('day', 'Día')}
          {modeBtn('week', 'Semana')}
          {modeBtn('month', 'Mes')}
        </div>
      </div>

      {weatherLoading && (
        <p className="mt-3 text-xs text-stone-500" role="status">
          Cargando pronóstico…
        </p>
      )}

      {viewMode === 'week' && (
        <div className="mt-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={handlePrevWeek}
              className="inline-flex items-center gap-1 rounded-xl border border-stone-600 bg-stone-800 px-3 py-2 text-sm text-stone-200 hover:bg-stone-700"
              aria-label="Semana anterior"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden />
              Anterior
            </button>
            <p className="text-center text-sm font-medium text-amber-100 capitalize">{weekRangeLabel}</p>
            <button
              type="button"
              onClick={handleNextWeek}
              className="inline-flex items-center gap-1 rounded-xl border border-stone-600 bg-stone-800 px-3 py-2 text-sm text-stone-200 hover:bg-stone-700"
              aria-label="Semana siguiente"
            >
              Siguiente
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
          </div>
          <div className="flex flex-wrap gap-3 text-[11px] text-stone-500">
            <span className="inline-flex items-center gap-1">
              <CloudRain className="h-3.5 w-3.5 text-sky-400" aria-hidden /> Lluvia / chaparrón
            </span>
            <span className="inline-flex items-center gap-1">
              <Wind className="h-3.5 w-3.5 text-amber-300" aria-hidden /> Viento fuerte
            </span>
            <span className="inline-flex items-center gap-1">
              <CloudLightning className="h-3.5 w-3.5 text-violet-300" aria-hidden /> Tormenta
            </span>
          </div>
          <div className="overflow-x-auto pb-1 -mx-1 px-1">
            <div className="grid grid-cols-7 gap-2 min-w-[min(100%,640px)] sm:min-w-0">
              {weekDays.map((iso) => {
                const count = countReservasOnDay(reservas, iso);
                const isToday = iso === todayISO;
                const isSelected = iso === selectedDate;
                const w = weatherByDate?.[iso];
                const base = `flex flex-col rounded-xl border p-2 sm:p-3 text-left transition-all min-h-[118px] ${
                  isSelected
                    ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/40'
                    : isToday
                      ? 'border-sky-500/50 bg-sky-950/30'
                      : 'border-stone-700 bg-stone-800/40 hover:border-stone-500'
                }`;
                return (
                  <button
                    key={iso}
                    type="button"
                    onClick={() => {
                      onSelectDate(iso);
                      onViewModeChange('day');
                    }}
                    className={weatherCellClass(w, base)}
                  >
                    <span className="text-[10px] sm:text-xs uppercase text-stone-500 truncate">
                      {weekdayShort(iso)}
                    </span>
                    <span className="text-lg font-bold text-white tabular-nums">
                      {parseISODateLocal(iso).getDate()}
                    </span>
                    {w && <WeatherMicro w={w} />}
                    <span className="text-[10px] text-stone-500 mt-auto">
                      {count === 0 ? 'Sin reservas' : `${count} reserva${count === 1 ? '' : 's'}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {viewMode === 'month' && (
        <div className="mt-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="inline-flex items-center gap-1 rounded-xl border border-stone-600 bg-stone-800 px-3 py-2 text-sm text-stone-200 hover:bg-stone-700"
              aria-label="Mes anterior"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden />
              Anterior
            </button>
            <p className="text-center text-base font-semibold text-amber-100 capitalize">{monthTitle}</p>
            <button
              type="button"
              onClick={handleNextMonth}
              className="inline-flex items-center gap-1 rounded-xl border border-stone-600 bg-stone-800 px-3 py-2 text-sm text-stone-200 hover:bg-stone-700"
              aria-label="Mes siguiente"
            >
              Siguiente
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] sm:text-xs font-semibold uppercase text-stone-500 pb-2">
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {monthMeta.cells.map((cell) => {
              const count = countReservasOnDay(reservas, cell.iso);
              const isToday = cell.iso === todayISO;
              const isSelected = cell.iso === selectedDate;
              const w = weatherByDate?.[cell.iso];
              const base = `relative flex min-h-[56px] sm:min-h-[72px] flex-col rounded-xl border p-1.5 sm:p-2 text-left transition-all ${
                !cell.inCurrentMonth
                  ? 'border-transparent bg-stone-900/30 opacity-40'
                  : isSelected
                    ? 'border-amber-500 bg-amber-500/15 ring-1 ring-amber-500/50'
                    : isToday
                      ? 'border-sky-500/60 bg-sky-950/25'
                      : 'border-stone-700/80 bg-stone-800/30 hover:border-stone-500'
              }`;
              return (
                <button
                  key={`${cell.iso}-${cell.inCurrentMonth}`}
                  type="button"
                  onClick={() => {
                    onSelectDate(cell.iso);
                    onViewModeChange('day');
                  }}
                  className={cell.inCurrentMonth ? weatherCellClass(w, base) : base}
                >
                  <span
                    className={`text-sm font-semibold tabular-nums ${cell.inCurrentMonth ? 'text-white' : 'text-stone-600'}`}
                  >
                    {parseISODateLocal(cell.iso).getDate()}
                  </span>
                  {cell.inCurrentMonth && w && <WeatherMicro w={w} />}
                  {cell.inCurrentMonth && count > 0 && (
                    <span className="mt-auto inline-flex w-fit items-center rounded-full bg-amber-500/25 px-1.5 py-0.5 text-[10px] font-bold text-amber-200">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {viewMode === 'day' && (
        <div className="mt-6 flex flex-col gap-3 rounded-xl border border-dashed border-stone-600 bg-stone-800/30 px-4 py-3 text-sm text-stone-400">
          <div className="flex flex-wrap items-start gap-3">
            <span className="flex-1 min-w-0">
              Estás viendo el día{' '}
              <strong className="text-amber-200">
                {parseISODateLocal(selectedDate).toLocaleDateString('es-AR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </strong>
              . Cambiá la fecha abajo o usá Semana/Mes para moverte más rápido.
            </span>
            <button
              type="button"
              onClick={() => onSelectDate(toISODateLocal(new Date()))}
              className="rounded-lg border border-stone-600 bg-stone-800 px-3 py-1.5 text-xs font-semibold text-amber-200 hover:bg-stone-700 shrink-0"
            >
              Ir a hoy
            </button>
          </div>
          {selectedDayWeather && (
            <div
              className={`flex flex-wrap items-center gap-3 rounded-lg border px-3 py-2 text-xs ${
                selectedDayWeather.flags.storm
                  ? 'border-violet-500/50 bg-violet-950/40 text-violet-100'
                  : selectedDayWeather.flags.rain
                    ? 'border-sky-500/50 bg-sky-950/35 text-sky-100'
                    : selectedDayWeather.flags.heavyWind
                      ? 'border-amber-500/50 bg-amber-950/30 text-amber-100'
                      : 'border-stone-600 bg-stone-900/50 text-stone-300'
              }`}
              role="status"
            >
              <span className="font-semibold text-stone-200">Clima previsto:</span>
              <span className="flex items-center gap-2">
                {selectedDayWeather.flags.storm && (
                  <CloudLightning className="h-4 w-4 text-violet-300" aria-hidden />
                )}
                {selectedDayWeather.flags.rain && !selectedDayWeather.flags.storm && (
                  <CloudRain className="h-4 w-4 text-sky-300" aria-hidden />
                )}
                {selectedDayWeather.flags.heavyWind && (
                  <Wind className="h-4 w-4 text-amber-200" aria-hidden />
                )}
                {selectedDayWeather.tooltip}
              </span>
            </div>
          )}
          {!weatherLoading && weatherByDate && !selectedDayWeather && (
            <p className="text-xs text-stone-500">
              No hay pronóstico para esta fecha (solo disponible para el rango que ofrece el servicio).
            </p>
          )}
        </div>
      )}
    </div>
  );
}
