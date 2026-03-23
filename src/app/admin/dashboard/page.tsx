'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  AlertTriangle,
  Armchair,
  CalendarDays,
  CalendarRange,
  CheckCircle2,
  Clock,
  FileDown,
  FileText,
  HandPlatter,
  Info,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  Users,
} from 'lucide-react';
import { MesaCard } from '@/components/admin/dashboard-mesa-card';
import DashboardSkeleton from '@/components/admin/dashboard-skeleton';
import ReservationCalendarViews, {
  type CalendarViewMode,
} from '@/components/admin/reservation-calendar-views';
import { DEFAULT_MESA_CAPACITY, DEFAULT_RESERVATION_SLOT_MINUTES } from '@/lib/admin-defaults';
import {
  formatDurationLabel,
  readAdminApiResponse,
  type ApiJson,
  type DashboardPayload,
} from '@/lib/admin-dashboard-api';
import { buildMonthGrid, eachDayOfWeekFrom, startOfWeekMondayISO } from '@/lib/dashboard-date-utils';
import { alertsByReservaId, computeReservaAlerts, summarizeAlerts } from '@/lib/dashboard-reserva-alerts';
import { restaurant } from '@/config/restaurant';
import { buildReservasCsv, triggerCsvDownload } from '@/lib/export-reservas-csv';
import { triggerReservasPdfDownload } from '@/lib/export-reservas-pdf';
import type { DayWeatherPublic } from '@/lib/weather-open-meteo';
import type { Mesa, Reserva } from '@/lib/supabase';

type StatusFilter = 'todas' | 'pendiente' | 'confirmada' | 'cancelada';

const inputClass =
  'w-full rounded-xl border border-stone-600 bg-stone-800/90 px-4 py-3 text-base text-white placeholder:text-stone-500 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30';

export default function Dashboard() {
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<CalendarViewMode>('day');
  const [filter, setFilter] = useState<StatusFilter>('todas');
  const [reservaSearch, setReservaSearch] = useState('');
  const [weatherByDate, setWeatherByDate] = useState<Record<string, DayWeatherPublic> | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [showReservaModal, setShowReservaModal] = useState(false);
  const [editingReserva, setEditingReserva] = useState<Reserva | null>(null);
  const [reservaFormError, setReservaFormError] = useState('');

  const [showMesaModal, setShowMesaModal] = useState(false);
  const [editingMesa, setEditingMesa] = useState<Mesa | null>(null);
  const [mesaIsNew, setMesaIsNew] = useState(false);
  const [mesaFormError, setMesaFormError] = useState('');

  const [form, setForm] = useState({
    nombre: '',
    telefono: '',
    fecha: '',
    hora: '',
    personas: 2,
    notas: '',
    estado: 'pendiente' as Reserva['estado'],
    mesa_id: '' as '' | number,
    duracion_minutos: DEFAULT_RESERVATION_SLOT_MINUTES,
  });

  const [mesaForm, setMesaForm] = useState({
    nombre: '',
    capacidad: DEFAULT_MESA_CAPACITY,
    orden: 0,
    activa: true,
  });

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(null), 4000);
  }, []);

  const loadDashboardData = useCallback(async (mode: 'initial' | 'refresh') => {
    if (mode === 'initial') {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    try {
      const res = await fetch('/api/admin/dashboard', { cache: 'no-store' });
      const parsed = await readAdminApiResponse<DashboardPayload>(res);
      if (parsed.ok) {
        setMesas(parsed.data.mesas);
        setReservas(parsed.data.reservas);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboardData('initial');
  }, [loadDashboardData]);

  useEffect(() => {
    let cancelled = false;
    setWeatherLoading(true);
    void (async () => {
      try {
        const res = await fetch('/api/admin/weather', { cache: 'no-store' });
        const parsed = await readAdminApiResponse<{ days: Record<string, DayWeatherPublic> }>(res);
        if (!cancelled && parsed.ok) {
          setWeatherByDate(parsed.data.days);
        }
      } finally {
        if (!cancelled) {
          setWeatherLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!showReservaModal && !showMesaModal) {
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowReservaModal(false);
        setShowMesaModal(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showReservaModal, showMesaModal]);

  const mesaById = useMemo(() => {
    const map = new Map<number, Mesa>();
    mesas.forEach((m) => map.set(m.id, m));
    return map;
  }, [mesas]);

  const todayISO = useMemo(() => new Date().toISOString().split('T')[0], []);

  const stats = useMemo(() => {
    let hoy = 0;
    let pendientes = 0;
    let confirmadas = 0;
    for (const r of reservas) {
      if (r.fecha === todayISO) {
        hoy++;
      }
      if (r.estado === 'pendiente') {
        pendientes++;
      }
      if (r.estado === 'confirmada') {
        confirmadas++;
      }
    }
    return { hoy, pendientes, confirmadas, total: reservas.length };
  }, [reservas, todayISO]);

  const reservaAlerts = useMemo(() => computeReservaAlerts(reservas, mesas), [reservas, mesas]);
  const alertSummary = useMemo(() => summarizeAlerts(reservaAlerts), [reservaAlerts]);
  const alertMap = useMemo(() => alertsByReservaId(reservaAlerts), [reservaAlerts]);

  const periodLabel = viewMode === 'day' ? 'este día' : viewMode === 'week' ? 'esta semana' : 'este mes';

  const periodReservationCount = useMemo(() => {
    const nonCancelled = (r: Reserva) => r.estado !== 'cancelada';
    if (viewMode === 'day') {
      return reservas.filter((r) => r.fecha === selectedDate && nonCancelled(r)).length;
    }
    if (viewMode === 'week') {
      const weekStart = startOfWeekMondayISO(selectedDate);
      const days = new Set(eachDayOfWeekFrom(weekStart));
      return reservas.filter((r) => days.has(r.fecha) && nonCancelled(r)).length;
    }
    const { cells } = buildMonthGrid(selectedDate);
    const inMonth = new Set(cells.filter((c) => c.inCurrentMonth).map((c) => c.iso));
    return reservas.filter((r) => inMonth.has(r.fecha) && nonCancelled(r)).length;
  }, [reservas, viewMode, selectedDate]);

  const handleDownloadAllReservas = useCallback(() => {
    const csv = buildReservasCsv(reservas, mesas);
    const stamp = new Date().toISOString().slice(0, 10);
    triggerCsvDownload(csv, `reservas-w-bar-${stamp}.csv`);
    showToast('Archivo CSV descargado.');
  }, [reservas, mesas, showToast]);

  const handleDownloadPdf = useCallback(async () => {
    setPdfGenerating(true);
    try {
      await triggerReservasPdfDownload(reservas, mesas, {
        venueName: restaurant.name,
        addressLine: `${restaurant.address}, ${restaurant.neighborhood}`,
      });
      showToast('PDF descargado.');
    } finally {
      setPdfGenerating(false);
    }
  }, [reservas, mesas, showToast]);

  const reservasDelDia = useMemo(
    () => reservas.filter((r) => r.fecha === selectedDate),
    [reservas, selectedDate]
  );

  const filteredReservas = useMemo(() => {
    const q = reservaSearch.trim().toLowerCase();
    return reservasDelDia.filter((r) => {
      if (filter !== 'todas' && r.estado !== filter) {
        return false;
      }
      if (!q) {
        return true;
      }
      const hay = `${r.nombre} ${r.telefono} ${r.notas ?? ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [reservasDelDia, filter, reservaSearch]);

  const proximasLlegadas = useMemo(() => {
    const activas = reservasDelDia.filter((r) => r.estado !== 'cancelada');
    return [...activas].sort((a, b) => a.hora.localeCompare(b.hora)).slice(0, 6);
  }, [reservasDelDia]);

  const occupiedMesaIds = useMemo(() => {
    const ids = new Set<number>();
    for (const r of reservas) {
      if (
        r.fecha === selectedDate &&
        r.estado !== 'cancelada' &&
        r.mesa_id != null
      ) {
        ids.add(r.mesa_id);
      }
    }
    return ids;
  }, [reservas, selectedDate]);

  const selectedDateLabel = useMemo(() => {
    try {
      return new Date(`${selectedDate}T12:00:00`).toLocaleDateString('es-AR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return selectedDate;
    }
  }, [selectedDate]);

  const mesasActivasOrdenadas = useMemo(
    () => [...mesas].sort((a, b) => a.orden - b.orden || a.id - b.id),
    [mesas]
  );

  const handleEditMesa = useCallback((mesa: Mesa) => {
    setMesaIsNew(false);
    setEditingMesa(mesa);
    setMesaForm({
      nombre: mesa.nombre,
      capacidad: mesa.capacidad,
      orden: mesa.orden,
      activa: mesa.activa,
    });
    setMesaFormError('');
    setShowMesaModal(true);
  }, []);

  const handleReservaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReservaFormError('');

    const payload = {
      nombre: form.nombre,
      telefono: form.telefono,
      fecha: form.fecha,
      hora: form.hora,
      personas: form.personas,
      notas: form.notas || null,
      estado: form.estado,
      mesa_id: form.mesa_id === '' ? null : form.mesa_id,
      duracion_minutos: form.duracion_minutos,
    };

    const wasEditing = editingReserva != null;
    const url = editingReserva ? `/api/admin/reservas/${editingReserva.id}` : '/api/admin/reservas';
    const method = editingReserva ? 'PATCH' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const json = (await res.json()) as ApiJson;
    if (!res.ok) {
      if (res.status === 401) {
        window.location.href = '/admin';
        return;
      }
      setReservaFormError(json.message || 'No se pudo guardar la reserva.');
      return;
    }

    setShowReservaModal(false);
    setEditingReserva(null);
    setForm({
      nombre: '',
      telefono: '',
      fecha: '',
      hora: '',
      personas: 2,
      notas: '',
      estado: 'pendiente',
      mesa_id: '',
      duracion_minutos: DEFAULT_RESERVATION_SLOT_MINUTES,
    });
    await loadDashboardData('refresh');
    showToast(wasEditing ? 'Cambios guardados correctamente.' : 'Reserva creada correctamente.');
  };

  const handleEditReserva = (reserva: Reserva) => {
    setEditingReserva(reserva);
    setForm({
      nombre: reserva.nombre,
      telefono: reserva.telefono,
      fecha: reserva.fecha,
      hora: reserva.hora,
      personas: reserva.personas,
      notas: reserva.notas || '',
      estado: reserva.estado,
      mesa_id: reserva.mesa_id ?? '',
      duracion_minutos: reserva.duracion_minutos ?? DEFAULT_RESERVATION_SLOT_MINUTES,
    });
    setReservaFormError('');
    setShowReservaModal(true);
  };

  const handleDeleteReserva = async (id: number) => {
    if (!confirm('¿Seguro que querés borrar esta reserva? Esta acción no se puede deshacer.')) {
      return;
    }
    const res = await fetch(`/api/admin/reservas/${id}`, { method: 'DELETE' });
    const parsed = await readAdminApiResponse<unknown>(res);
    if (parsed.ok) {
      await loadDashboardData('refresh');
      showToast('Reserva eliminada.');
    }
  };

  const handleEstadoChange = async (id: number, estado: Reserva['estado']) => {
    const res = await fetch(`/api/admin/reservas/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado }),
    });
    const parsed = await readAdminApiResponse<unknown>(res);
    if (parsed.ok) {
      await loadDashboardData('refresh');
    }
  };

  const openNewReserva = () => {
    setEditingReserva(null);
    setForm({
      nombre: '',
      telefono: '',
      fecha: selectedDate,
      hora: '',
      personas: 2,
      notas: '',
      estado: 'pendiente',
      mesa_id: '',
      duracion_minutos: DEFAULT_RESERVATION_SLOT_MINUTES,
    });
    setReservaFormError('');
    setShowReservaModal(true);
  };

  const openNewMesa = () => {
    setMesaIsNew(true);
    setEditingMesa(null);
    setMesaForm({
      nombre: '',
      capacidad: DEFAULT_MESA_CAPACITY,
      orden: mesas.length + 1,
      activa: true,
    });
    setMesaFormError('');
    setShowMesaModal(true);
  };

  const handleMesaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMesaFormError('');

    if (mesaIsNew) {
      const res = await fetch('/api/admin/mesas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mesaForm),
      });
      const json = (await res.json()) as ApiJson;
      if (!res.ok) {
        setMesaFormError(json.message || 'No se pudo crear la mesa.');
        return;
      }
    } else if (editingMesa) {
      const res = await fetch(`/api/admin/mesas/${editingMesa.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mesaForm),
      });
      const json = (await res.json()) as ApiJson;
      if (!res.ok) {
        setMesaFormError(json.message || 'No se pudo actualizar la mesa.');
        return;
      }
    }

    setShowMesaModal(false);
    await loadDashboardData('refresh');
    showToast(mesaIsNew ? 'Mesa agregada.' : 'Mesa actualizada.');
  };

  const handleDeleteMesa = async () => {
    if (!editingMesa || mesaIsNew) {
      return;
    }
    if (!confirm('¿Eliminar esta mesa? Las reservas asociadas quedarán sin mesa.')) {
      return;
    }
    const res = await fetch(`/api/admin/mesas/${editingMesa.id}`, { method: 'DELETE' });
    const parsed = await readAdminApiResponse<unknown>(res);
    if (parsed.ok) {
      setShowMesaModal(false);
      await loadDashboardData('refresh');
      showToast('Mesa eliminada.');
    } else {
      setMesaFormError(parsed.message);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-amber-500/25 text-amber-100 border-amber-500/30';
      case 'confirmada':
        return 'bg-emerald-500/25 text-emerald-100 border-emerald-500/30';
      case 'cancelada':
        return 'bg-red-500/20 text-red-100 border-red-500/25';
      case 'completada':
        return 'bg-sky-500/25 text-sky-100 border-sky-500/30';
      default:
        return 'bg-stone-600/40 text-stone-200 border-stone-600';
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-10 pb-12">
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-950/95 px-5 py-3 text-emerald-50 shadow-xl"
        >
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" aria-hidden />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      <header className="space-y-2">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2 flex-wrap">
              <Sparkles className="h-8 w-8 text-amber-400 shrink-0" aria-hidden />
              Reservas del restaurante
            </h1>
            <p className="text-stone-400 mt-2 max-w-2xl text-base leading-relaxed">
              Acá ves el resumen del día, las mesas y podés cargar o cambiar reservas. No hace falta saber de
              computadoras: solo completá los datos cuando te lo pidan.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <button
              type="button"
              onClick={handleDownloadAllReservas}
              data-testid="dashboard-export-csv"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-700/60 bg-emerald-950/40 px-4 py-3 text-sm font-medium text-emerald-100 hover:bg-emerald-900/50 shadow-sm"
            >
              <FileDown className="h-4 w-4 text-emerald-400" aria-hidden />
              CSV
            </button>
            <button
              type="button"
              onClick={() => void handleDownloadPdf()}
              disabled={pdfGenerating}
              data-testid="dashboard-export-pdf"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-700/50 bg-rose-950/40 px-4 py-3 text-sm font-medium text-rose-100 hover:bg-rose-900/45 shadow-sm disabled:opacity-50"
            >
              {pdfGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin text-rose-300" aria-hidden />
              ) : (
                <FileText className="h-4 w-4 text-rose-300" aria-hidden />
              )}
              PDF
            </button>
            <button
              type="button"
              onClick={() => void loadDashboardData('refresh')}
              disabled={refreshing}
              data-testid="dashboard-refresh"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-600 bg-stone-800 px-5 py-3 text-sm font-medium text-stone-100 hover:bg-stone-700 disabled:opacity-50 shadow-sm"
              aria-busy={refreshing}
            >
              {refreshing ? (
                <Loader2 className="h-4 w-4 animate-spin text-amber-400" aria-hidden />
              ) : (
                <RefreshCw className="h-4 w-4 text-amber-400" aria-hidden />
              )}
              Actualizar todo
            </button>
          </div>
        </div>
      </header>

      <ReservationCalendarViews
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        reservas={reservas}
        todayISO={todayISO}
        weatherByDate={weatherByDate}
        weatherLoading={weatherLoading}
      />

      {(alertSummary.overlapReservaCount > 0 || alertSummary.capacityReservaCount > 0) && (
        <div
          role="region"
          aria-label="Alertas de reservas"
          className="rounded-2xl border border-amber-600/50 bg-gradient-to-r from-amber-950/80 via-red-950/40 to-stone-900 p-4 sm:p-5 shadow-lg"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-amber-500/20 p-2">
                <AlertTriangle className="h-6 w-6 text-amber-300" aria-hidden />
              </div>
              <div>
                <h2 className="text-lg font-bold text-amber-100">Revisá estas reservas</h2>
                <p className="text-stone-300 text-sm mt-1 max-w-3xl">
                  El sistema detectó conflictos en los datos guardados. Corregilos para evitar problemas en el
                  servicio.
                </p>
                <ul className="mt-3 space-y-2 text-sm text-stone-200">
                  {alertSummary.overlapReservaCount > 0 && (
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-red-400" aria-hidden />
                      <span>
                        <strong className="text-red-200">{alertSummary.overlapReservaCount}</strong> reserva
                        {alertSummary.overlapReservaCount === 1 ? '' : 's'} con horarios que se solapan en la misma
                        mesa.
                      </span>
                    </li>
                  )}
                  {alertSummary.capacityReservaCount > 0 && (
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-amber-400" aria-hidden />
                      <span>
                        <strong className="text-amber-200">{alertSummary.capacityReservaCount}</strong> reserva
                        {alertSummary.capacityReservaCount === 1 ? '' : 's'} con más personas que la capacidad de la
                        mesa.
                      </span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-stone-700/80 bg-gradient-to-br from-stone-800/90 to-stone-900 p-4 sm:p-5 shadow-md">
          <div className="flex items-center gap-2 text-stone-400 text-sm font-medium">
            <CalendarDays className="h-4 w-4 text-amber-400 shrink-0" aria-hidden />
            Hoy en el local
          </div>
          <p className="text-3xl font-bold text-white tabular-nums mt-2">{stats.hoy}</p>
          <p className="text-xs text-stone-500 mt-1">Reservas para el día de hoy</p>
        </div>
        <div className="rounded-2xl border border-stone-700/80 bg-gradient-to-br from-stone-800/90 to-stone-900 p-4 sm:p-5 shadow-md">
          <div className="flex items-center gap-2 text-stone-400 text-sm font-medium">
            <Clock className="h-4 w-4 text-amber-400 shrink-0" aria-hidden />
            Por confirmar
          </div>
          <p className="text-3xl font-bold text-amber-200 tabular-nums mt-2">{stats.pendientes}</p>
          <p className="text-xs text-stone-500 mt-1">Aún falta confirmar con el cliente</p>
        </div>
        <div className="rounded-2xl border border-stone-700/80 bg-gradient-to-br from-stone-800/90 to-stone-900 p-4 sm:p-5 shadow-md">
          <div className="flex items-center gap-2 text-stone-400 text-sm font-medium">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" aria-hidden />
            Confirmadas
          </div>
          <p className="text-3xl font-bold text-emerald-300 tabular-nums mt-2">{stats.confirmadas}</p>
          <p className="text-xs text-stone-500 mt-1">Listas para el servicio</p>
        </div>
        <div className="rounded-2xl border border-stone-700/80 bg-gradient-to-br from-stone-800/90 to-stone-900 p-4 sm:p-5 shadow-md">
          <div className="flex items-center gap-2 text-stone-400 text-sm font-medium">
            <HandPlatter className="h-4 w-4 text-stone-300 shrink-0" aria-hidden />
            En total
          </div>
          <p className="text-3xl font-bold text-white tabular-nums mt-2">{stats.total}</p>
          <p className="text-xs text-stone-500 mt-1">Todas las reservas guardadas</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-stone-700/60 bg-stone-900/50 px-4 py-3 text-sm text-stone-300">
        <CalendarRange className="h-4 w-4 text-amber-400 shrink-0" aria-hidden />
        <span>
          Reservas activas en <strong className="text-white">{periodLabel}</strong>:{' '}
          <strong className="text-amber-200 tabular-nums">{periodReservationCount}</strong>
        </span>
      </div>

      {proximasLlegadas.length > 0 && (
        <section
          aria-label="Próximas llegadas del día"
          className="rounded-2xl border border-amber-800/40 bg-gradient-to-br from-amber-950/40 to-stone-900/80 p-4 sm:p-5 shadow-inner"
        >
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-5 w-5 text-amber-400" aria-hidden />
            <h2 className="text-lg font-bold text-white">Próximas llegadas del día seleccionado</h2>
          </div>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {proximasLlegadas.map((r) => {
              const mesaNombre = r.mesa_id ? mesaById.get(r.mesa_id)?.nombre ?? '—' : 'Sin mesa';
              return (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => handleEditReserva(r)}
                    className="flex w-full flex-col rounded-xl border border-stone-700/80 bg-stone-800/60 px-3 py-2.5 text-left text-sm hover:border-amber-500/50 hover:bg-stone-800 transition-colors"
                  >
                    <span className="font-mono text-amber-200 tabular-nums font-bold">{r.hora}</span>
                    <span className="text-white font-medium truncate">{r.nombre}</span>
                    <span className="text-stone-500 text-xs">
                      {r.personas} pers. · {mesaNombre}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section id="sala" className="scroll-mt-24 space-y-4" data-testid="dashboard-section-sala">
        <div className="rounded-2xl border border-stone-700/80 bg-stone-900/50 p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="h-6 w-6 text-amber-400" aria-hidden />
                Mesas de la sala
              </h2>
              <p className="text-stone-400 text-sm mt-1 capitalize leading-relaxed">{selectedDateLabel}</p>
              <p className="text-stone-500 text-xs mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" /> Libre
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-amber-400" /> Ocupada
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-stone-500" /> Apagada
                </span>
              </p>
            </div>
            <div className="flex flex-wrap items-end gap-3">
              <label className="flex flex-col gap-1.5 text-sm text-stone-300">
                <span className="font-medium">Ver el día</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  data-testid="dashboard-date-input"
                  className="rounded-xl border border-stone-600 bg-stone-800 px-3 py-2.5 text-white min-h-[44px]"
                />
              </label>
              <button
                type="button"
                onClick={openNewMesa}
                data-testid="dashboard-add-mesa"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-600 bg-stone-800 px-4 py-2.5 text-sm font-semibold text-stone-100 hover:bg-stone-700 min-h-[44px]"
              >
                <Plus className="h-4 w-4" aria-hidden />
                Agregar mesa
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {mesasActivasOrdenadas.map((mesa) => (
              <MesaCard
                key={mesa.id}
                mesa={mesa}
                occupied={mesa.activa && occupiedMesaIds.has(mesa.id)}
                onEdit={handleEditMesa}
              />
            ))}
          </div>
          {mesas.length === 0 && (
            <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-stone-600 py-10 px-4 text-center">
              <Armchair className="h-12 w-12 text-stone-600 mb-3" aria-hidden />
              <p className="text-stone-400 max-w-md">
                Todavía no hay mesas cargadas. Podés crear la primera con &quot;Agregar mesa&quot; (por defecto{' '}
                {DEFAULT_MESA_CAPACITY} personas por mesa).
              </p>
            </div>
          )}
        </div>
      </section>

      <section id="reservas" className="scroll-mt-24 space-y-4" data-testid="dashboard-section-reservas">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2" data-testid="dashboard-heading">
              <CalendarRange className="h-6 w-6 text-amber-400" aria-hidden />
              Lista del día
            </h2>
            <p className="text-stone-400 text-sm mt-1 capitalize">{selectedDateLabel}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <label className="flex flex-col gap-1.5 text-sm text-stone-300 min-w-0 flex-1 sm:max-w-xs">
              <span className="font-medium">Buscar</span>
              <span className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500"
                  aria-hidden
                />
                <input
                  type="search"
                  value={reservaSearch}
                  onChange={(e) => setReservaSearch(e.target.value)}
                  placeholder="Nombre, teléfono o nota"
                  data-testid="dashboard-reserva-search"
                  className="w-full rounded-xl border border-stone-600 bg-stone-800 pl-10 pr-3 py-2.5 text-white placeholder:text-stone-500 min-h-[44px]"
                  aria-label="Buscar en las reservas del día"
                />
              </span>
            </label>
            <label className="flex flex-col gap-1.5 text-sm text-stone-300">
              <span className="font-medium">Mostrar</span>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as StatusFilter)}
                data-testid="dashboard-reserva-filter"
                className="rounded-xl border border-stone-600 bg-stone-800 px-4 py-2.5 text-white min-w-[12rem] min-h-[44px]"
                aria-label="Filtrar reservas por estado"
              >
                <option value="todas">Todas las reservas</option>
                <option value="pendiente">Solo pendientes</option>
                <option value="confirmada">Solo confirmadas</option>
                <option value="cancelada">Solo canceladas</option>
              </select>
            </label>
            <button
              type="button"
              onClick={openNewReserva}
              data-testid="dashboard-new-reserva"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 px-5 py-2.5 font-bold shadow-lg shadow-amber-900/20 min-h-[44px]"
            >
              <Plus className="h-5 w-5" aria-hidden />
              Nueva reserva
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-stone-700/80 bg-stone-900/40 overflow-hidden shadow-inner">
          <div className="overflow-x-auto max-h-[min(70vh,560px)]">
            <table className="w-full min-w-[880px] text-sm">
              <thead className="sticky top-0 z-10 bg-stone-800 border-b border-stone-700">
                <tr>
                  <th className="px-4 py-3.5 text-left text-stone-300 font-semibold">Hora</th>
                  <th className="px-4 py-3.5 text-left text-stone-300 font-semibold">Cliente</th>
                  <th className="px-4 py-3.5 text-left text-stone-300 font-semibold">Teléfono</th>
                  <th className="px-4 py-3.5 text-left text-stone-300 font-semibold">Personas</th>
                  <th className="px-4 py-3.5 text-left text-stone-300 font-semibold">Mesa</th>
                  <th className="px-4 py-3.5 text-left text-stone-300 font-semibold">Turno</th>
                  <th className="px-4 py-3.5 text-left text-stone-300 font-semibold">Estado</th>
                  <th className="px-4 py-3.5 text-left text-stone-300 font-semibold w-40">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredReservas.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center max-w-sm mx-auto">
                        <CalendarDays className="h-14 w-14 text-stone-600 mb-3" aria-hidden />
                        <p className="text-stone-300 font-medium">No hay reservas para este día y filtro</p>
                        <p className="text-stone-500 text-sm mt-2">
                          Cambiá la fecha arriba o tocá &quot;Nueva reserva&quot; para cargar una.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredReservas.map((reserva, idx) => {
                    const mesaNombre = reserva.mesa_id
                      ? mesaById.get(reserva.mesa_id)?.nombre ?? '—'
                      : 'Sin mesa';
                    const dur = reserva.duracion_minutos ?? DEFAULT_RESERVATION_SLOT_MINUTES;
                    const rowAlerts = alertMap.get(reserva.id);
                    const hasOverlap = rowAlerts?.some((a) => a.type === 'overlap');
                    const hasCapacity = rowAlerts?.some((a) => a.type === 'capacity');
                    return (
                      <tr
                        key={reserva.id}
                        className={`border-t border-stone-800/80 ${
                          idx % 2 === 0 ? 'bg-stone-900/20' : 'bg-stone-900/40'
                        } hover:bg-amber-950/15 transition-colors ${
                          hasOverlap
                            ? 'border-l-4 border-l-red-500 shadow-[inset_4px_0_0_0_rgba(239,68,68,0.35)]'
                            : hasCapacity
                              ? 'border-l-4 border-l-amber-500 shadow-[inset_4px_0_0_0_rgba(245,158,11,0.25)]'
                              : ''
                        }`}
                      >
                        <td className="px-4 py-3.5 text-white font-medium tabular-nums">
                          <span className="inline-flex flex-col gap-1">
                            <span>{reserva.hora}</span>
                            {rowAlerts && rowAlerts.length > 0 && (
                              <span className="inline-flex flex-wrap gap-1">
                                {hasOverlap && (
                                  <span className="rounded-md bg-red-950/80 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-200">
                                    Solapamiento
                                  </span>
                                )}
                                {hasCapacity && (
                                  <span className="rounded-md bg-amber-950/80 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-200">
                                    Capacidad
                                  </span>
                                )}
                              </span>
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-white">{reserva.nombre}</td>
                        <td className="px-4 py-3.5 text-stone-300">{reserva.telefono}</td>
                        <td className="px-4 py-3.5 text-stone-200 tabular-nums">{reserva.personas}</td>
                        <td className="px-4 py-3.5 text-stone-300">{mesaNombre}</td>
                        <td className="px-4 py-3.5 text-stone-300">
                          <span className="text-stone-200">{formatDurationLabel(dur)}</span>
                          <span className="text-stone-500 text-xs ml-1">({dur} min)</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <select
                            value={reserva.estado}
                            onChange={(e) =>
                              handleEstadoChange(reserva.id, e.target.value as Reserva['estado'])
                            }
                            className={`w-full max-w-[10rem] rounded-lg border px-2 py-2 text-xs font-medium ${getEstadoColor(reserva.estado)}`}
                            aria-label={`Estado de la reserva de ${reserva.nombre}`}
                          >
                            <option value="pendiente">Pendiente</option>
                            <option value="confirmada">Confirmada</option>
                            <option value="cancelada">Cancelada</option>
                            <option value="completada">Completada</option>
                          </select>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex gap-2 flex-wrap">
                            <button
                              type="button"
                              onClick={() => handleEditReserva(reserva)}
                              className="inline-flex items-center gap-1 rounded-lg bg-amber-500/15 px-3 py-2 text-amber-200 text-xs font-semibold hover:bg-amber-500/25"
                            >
                              <Pencil className="h-3.5 w-3.5" aria-hidden />
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteReserva(reserva.id)}
                              className="inline-flex items-center gap-1 rounded-lg bg-red-500/10 px-3 py-2 text-red-300 text-xs font-semibold hover:bg-red-500/20"
                            >
                              <Trash2 className="h-3.5 w-3.5" aria-hidden />
                              Quitar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {showReservaModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowReservaModal(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="reserva-modal-title"
            className="bg-stone-900 rounded-2xl p-6 sm:p-8 w-full max-w-lg max-h-[92vh] overflow-y-auto border border-stone-600 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-6">
              <div className="rounded-xl bg-amber-500/15 p-2">
                <CalendarDays className="h-7 w-7 text-amber-400" aria-hidden />
              </div>
              <div>
                <h2 id="reserva-modal-title" className="text-xl font-bold text-white">
                  {editingReserva ? 'Cambiar datos de la reserva' : 'Nueva reserva'}
                </h2>
                <p className="text-stone-400 text-sm mt-1">
                  Completá los campos. Podés dejar la mesa vacía y asignarla después.
                </p>
              </div>
            </div>
            {reservaFormError && (
              <p className="text-red-300 text-sm mb-4 rounded-xl bg-red-950/50 border border-red-800/50 px-3 py-2" role="alert">
                {reservaFormError}
              </p>
            )}
            <form onSubmit={handleReservaSubmit} className="space-y-5">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-500/90">Cliente</p>
                <div>
                  <label className="block text-stone-300 text-sm font-medium mb-1.5">Nombre y apellido</label>
                  <input
                    type="text"
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    className={inputClass}
                    placeholder="Ej. María García"
                    required
                    autoComplete="name"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 text-sm font-medium mb-1.5">Teléfono de contacto</label>
                  <input
                    type="tel"
                    value={form.telefono}
                    onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                    className={inputClass}
                    placeholder="Ej. 11 1234-5678"
                    required
                    autoComplete="tel"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-500/90">Cuándo</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-stone-300 text-sm font-medium mb-1.5">Día</label>
                    <input
                      type="date"
                      value={form.fecha}
                      onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                      className={inputClass}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-stone-300 text-sm font-medium mb-1.5">Hora</label>
                    <input
                      type="time"
                      value={form.hora}
                      onChange={(e) => setForm({ ...form, hora: e.target.value })}
                      className={inputClass}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-500/90">Detalles</p>
                <div>
                  <label className="block text-stone-300 text-sm font-medium mb-1.5">Cantidad de personas</label>
                  <input
                    type="number"
                    min={1}
                    max={40}
                    value={form.personas}
                    onChange={(e) => setForm({ ...form, personas: Number(e.target.value) })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-stone-300 text-sm font-medium mb-1.5">Mesa (opcional)</label>
                  <select
                    value={form.mesa_id === '' ? '' : String(form.mesa_id)}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        mesa_id: e.target.value === '' ? '' : Number(e.target.value),
                      })
                    }
                    className={inputClass}
                  >
                    <option value="">Todavía no asigné mesa</option>
                    {mesasActivasOrdenadas.filter((m) => m.activa).map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nombre} — hasta {m.capacidad} personas
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-stone-300 text-sm font-medium mb-1.5">
                    Duración aproximada del turno
                  </label>
                  <input
                    type="number"
                    min={15}
                    step={15}
                    value={form.duracion_minutos}
                    onChange={(e) => setForm({ ...form, duracion_minutos: Number(e.target.value) })}
                    className={inputClass}
                  />
                  <p className="text-stone-500 text-xs mt-1.5 flex items-start gap-1">
                    <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" aria-hidden />
                    En minutos (por ejemplo 90 = una hora y media). Sirve para evitar dos grupos en la misma mesa
                    a la vez.
                  </p>
                </div>
                <div>
                  <label className="block text-stone-300 text-sm font-medium mb-1.5">Notas internas</label>
                  <textarea
                    value={form.notas}
                    onChange={(e) => setForm({ ...form, notas: e.target.value })}
                    className={`${inputClass} min-h-[88px]`}
                    placeholder="Alergias, celebración, preferencia de ubicación…"
                    rows={3}
                  />
                </div>
                {!editingReserva && (
                  <div>
                    <label className="block text-stone-300 text-sm font-medium mb-1.5">Estado al cargar</label>
                    <select
                      value={form.estado}
                      onChange={(e) =>
                        setForm({ ...form, estado: e.target.value as Reserva['estado'] })
                      }
                      className={inputClass}
                    >
                      <option value="pendiente">Pendiente (aún no confirmada)</option>
                      <option value="confirmada">Confirmada</option>
                      <option value="cancelada">Cancelada</option>
                      <option value="completada">Ya vino / completada</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReservaModal(false)}
                  className="flex-1 rounded-xl border border-stone-600 py-3 font-semibold text-stone-200 hover:bg-stone-800"
                >
                  Cerrar sin guardar
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 py-3 font-bold shadow-lg"
                >
                  {editingReserva ? 'Guardar cambios' : 'Guardar reserva'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMesaModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowMesaModal(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="mesa-modal-title"
            className="bg-stone-900 rounded-2xl p-6 sm:p-8 w-full max-w-md border border-stone-600 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-6">
              <div className="rounded-xl bg-amber-500/15 p-2">
                <Armchair className="h-7 w-7 text-amber-400" aria-hidden />
              </div>
              <div>
                <h2 id="mesa-modal-title" className="text-xl font-bold text-white">
                  {mesaIsNew ? 'Nueva mesa' : 'Datos de la mesa'}
                </h2>
                <p className="text-stone-400 text-sm mt-1">
                  El nombre es el que verás en la grilla (ej. Mesa 1). La capacidad es el máximo de comensales.
                </p>
              </div>
            </div>
            {mesaFormError && (
              <p className="text-red-300 text-sm mb-4 rounded-xl bg-red-950/50 border border-red-800/50 px-3 py-2">
                {mesaFormError}
              </p>
            )}
            <form onSubmit={handleMesaSubmit} className="space-y-4">
              <div>
                <label className="block text-stone-300 text-sm font-medium mb-1.5">Nombre de la mesa</label>
                <input
                  type="text"
                  value={mesaForm.nombre}
                  onChange={(e) => setMesaForm({ ...mesaForm, nombre: e.target.value })}
                  className={inputClass}
                  placeholder="Ej. Mesa ventana"
                  required
                />
              </div>
              <div>
                <label className="block text-stone-300 text-sm font-medium mb-1.5">
                  Cuántas personas entran
                </label>
                <input
                  type="number"
                  min={1}
                  value={mesaForm.capacidad}
                  onChange={(e) => setMesaForm({ ...mesaForm, capacidad: Number(e.target.value) })}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className="block text-stone-300 text-sm font-medium mb-1.5">Orden en la lista</label>
                <input
                  type="number"
                  value={mesaForm.orden}
                  onChange={(e) => setMesaForm({ ...mesaForm, orden: Number(e.target.value) })}
                  className={inputClass}
                />
                <p className="text-stone-500 text-xs mt-1">Número más chico aparece primero.</p>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-stone-700 bg-stone-800/50 px-4 py-3">
                <input
                  type="checkbox"
                  id="activa"
                  checked={mesaForm.activa}
                  onChange={(e) => setMesaForm({ ...mesaForm, activa: e.target.checked })}
                  className="h-5 w-5 rounded border-stone-500 text-amber-500 focus:ring-amber-500"
                />
                <label htmlFor="activa" className="text-stone-200 text-sm leading-snug">
                  Mesa en uso (desmarcá si no la usás por un tiempo)
                </label>
              </div>
              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMesaModal(false)}
                  className="flex-1 rounded-xl border border-stone-600 py-3 font-semibold text-stone-200 hover:bg-stone-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 py-3 font-bold"
                >
                  Guardar mesa
                </button>
              </div>
              {!mesaIsNew && (
                <button
                  type="button"
                  onClick={handleDeleteMesa}
                  className="w-full rounded-xl border border-red-900/50 py-3 text-red-300 text-sm font-semibold hover:bg-red-950/40"
                >
                  Eliminar esta mesa
                </button>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
