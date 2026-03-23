'use client';

import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { DEFAULT_MESA_CAPACITY, DEFAULT_RESERVATION_SLOT_MINUTES } from '@/lib/admin-defaults';
import type { Mesa, Reserva } from '@/lib/supabase';

type StatusFilter = 'todas' | 'pendiente' | 'confirmada' | 'cancelada';

type ApiJson = {
  error?: string;
  message?: string;
  data?: unknown;
};

async function readApiResponse<T>(res: Response): Promise<{ ok: true; data: T } | { ok: false; message: string }> {
  const json = (await res.json()) as ApiJson;
  if (!res.ok) {
    if (res.status === 401) {
      window.location.href = '/admin';
    }
    return { ok: false, message: json.message || 'Ha ocurrido un error.' };
  }
  return { ok: true, data: json.data as T };
}

type DashboardPayload = {
  mesas: Mesa[];
  reservas: Reserva[];
};

/** Tarjeta de mesa: memoizada para no re-renderizar toda la grilla en cada cambio de estado global */
const MesaCard = memo(function MesaCard({
  mesa,
  occupied,
  onEdit,
}: {
  mesa: Mesa;
  occupied: boolean;
  onEdit: (m: Mesa) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onEdit(mesa)}
      aria-label={`${mesa.nombre}, capacidad ${mesa.capacidad}, ${!mesa.activa ? 'inactiva' : occupied ? 'ocupada' : 'libre'}`}
      className={`text-left rounded-xl border p-4 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/60 ${
        !mesa.activa
          ? 'border-zinc-700 bg-zinc-800/50 opacity-60'
          : occupied
            ? 'border-amber-600/60 bg-amber-950/30 shadow-inner'
            : 'border-zinc-700 bg-zinc-800 hover:border-zinc-500 hover:shadow-md'
      }`}
    >
      <p className="font-semibold text-white">{mesa.nombre}</p>
      <p className="text-zinc-400 text-sm">{mesa.capacidad} sillas</p>
      <p className={`text-xs mt-2 font-medium ${occupied ? 'text-amber-400' : 'text-emerald-400'}`}>
        {!mesa.activa ? 'Inactiva' : occupied ? 'Ocupada' : 'Libre'}
      </p>
    </button>
  );
});

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 rounded-lg bg-zinc-800 border border-zinc-700" />
        ))}
      </div>
      <div className="h-8 w-48 rounded bg-zinc-800" />
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-zinc-800 border border-zinc-700" />
        ))}
      </div>
      <div className="h-64 rounded-lg bg-zinc-800 border border-zinc-700" />
    </div>
  );
}

export default function Dashboard() {
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [filter, setFilter] = useState<StatusFilter>('todas');

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

  const loadDashboardData = useCallback(async (mode: 'initial' | 'refresh') => {
    if (mode === 'initial') {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    try {
      const res = await fetch('/api/admin/dashboard', { cache: 'no-store' });
      const parsed = await readApiResponse<DashboardPayload>(res);
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

  /** Cerrar modales con Escape */
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

  /** KPIs: un solo recorrido del array */
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    let hoy = 0;
    let pendientes = 0;
    let confirmadas = 0;
    for (const r of reservas) {
      if (r.fecha === today) {
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
  }, [reservas]);

  const reservasDelDia = useMemo(
    () => reservas.filter((r) => r.fecha === selectedDate),
    [reservas, selectedDate]
  );

  const filteredReservas = useMemo(
    () =>
      reservasDelDia.filter((r) => (filter === 'todas' ? true : r.estado === filter)),
    [reservasDelDia, filter]
  );

  /** IDs de mesas ocupadas en el día seleccionado (consulta O(1) por mesa) */
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
    if (!confirm('¿Eliminar esta reserva?')) {
      return;
    }
    const res = await fetch(`/api/admin/reservas/${id}`, { method: 'DELETE' });
    const parsed = await readApiResponse<unknown>(res);
    if (parsed.ok) {
      await loadDashboardData('refresh');
    }
  };

  const handleEstadoChange = async (id: number, estado: Reserva['estado']) => {
    const res = await fetch(`/api/admin/reservas/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado }),
    });
    const parsed = await readApiResponse<unknown>(res);
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
  };

  const handleDeleteMesa = async () => {
    if (!editingMesa || mesaIsNew) {
      return;
    }
    if (!confirm('¿Eliminar esta mesa? Las reservas quedarán sin mesa asignada.')) {
      return;
    }
    const res = await fetch(`/api/admin/mesas/${editingMesa.id}`, { method: 'DELETE' });
    const parsed = await readApiResponse<unknown>(res);
    if (parsed.ok) {
      setShowMesaModal(false);
      await loadDashboardData('refresh');
    } else {
      setMesaFormError(parsed.message);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'confirmada':
        return 'bg-green-500/20 text-green-400';
      case 'cancelada':
        return 'bg-red-500/20 text-red-400';
      case 'completada':
        return 'bg-blue-500/20 text-blue-400';
      default:
        return 'bg-zinc-500/20 text-zinc-400';
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-10">
      {/* Resumen: totales globales */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white tracking-tight" data-testid="dashboard-heading">
          Panel de reservas
        </h1>
        <button
          type="button"
          onClick={() => void loadDashboardData('refresh')}
          disabled={refreshing}
          data-testid="dashboard-refresh"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-700 disabled:opacity-50"
          aria-busy={refreshing}
        >
          {refreshing ? (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
          ) : null}
          Actualizar datos
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-zinc-800 rounded-xl p-4 border border-zinc-700 shadow-sm">
          <p className="text-zinc-400 text-sm">Hoy</p>
          <p className="text-2xl font-bold text-amber-500 tabular-nums">{stats.hoy}</p>
        </div>
        <div className="bg-zinc-800 rounded-xl p-4 border border-zinc-700 shadow-sm">
          <p className="text-zinc-400 text-sm">Pendientes</p>
          <p className="text-2xl font-bold text-yellow-500 tabular-nums">{stats.pendientes}</p>
        </div>
        <div className="bg-zinc-800 rounded-xl p-4 border border-zinc-700 shadow-sm">
          <p className="text-zinc-400 text-sm">Confirmadas</p>
          <p className="text-2xl font-bold text-green-500 tabular-nums">{stats.confirmadas}</p>
        </div>
        <div className="bg-zinc-800 rounded-xl p-4 border border-zinc-700 shadow-sm">
          <p className="text-zinc-400 text-sm">Total histórico</p>
          <p className="text-2xl font-bold text-white tabular-nums">{stats.total}</p>
        </div>
      </div>

      {/* Mapa de sala */}
      <section id="sala" className="scroll-mt-24" data-testid="dashboard-section-sala">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-white">Sala</h2>
            <p className="text-zinc-500 text-sm mt-1 capitalize">{selectedDateLabel}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <label className="text-zinc-400 text-sm flex items-center gap-2">
              Día
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                data-testid="dashboard-date-input"
                className="bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-white"
              />
            </label>
            <button
              type="button"
              onClick={openNewMesa}
              data-testid="dashboard-add-mesa"
              className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              + Mesa
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
          <p className="text-zinc-500 text-sm mt-4">
            No hay mesas. Ejecutá el SQL en Supabase o creá una mesa (por defecto {DEFAULT_MESA_CAPACITY}{' '}
            sillas).
          </p>
        )}
      </section>

      {/* Tabla del día */}
      <section id="reservas" className="scroll-mt-24" data-testid="dashboard-section-reservas">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-white">Reservas del día</h2>
            <p className="text-zinc-500 text-sm capitalize">{selectedDateLabel}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as StatusFilter)}
              data-testid="dashboard-reserva-filter"
              className="bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white min-w-[10rem]"
              aria-label="Filtrar por estado"
            >
              <option value="todas">Todas</option>
              <option value="pendiente">Pendientes</option>
              <option value="confirmada">Confirmadas</option>
              <option value="cancelada">Canceladas</option>
            </select>
            <button
              type="button"
              onClick={openNewReserva}
              data-testid="dashboard-new-reserva"
              className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              + Nueva reserva
            </button>
          </div>
        </div>

        <div className="bg-zinc-800 rounded-xl border border-zinc-700 overflow-hidden shadow-sm">
          <div className="overflow-x-auto max-h-[min(70vh,560px)]">
            <table className="w-full min-w-[880px] text-sm">
              <thead className="sticky top-0 z-10 bg-zinc-700 shadow-md">
                <tr>
                  <th className="px-4 py-3 text-left text-zinc-300 font-semibold">Hora</th>
                  <th className="px-4 py-3 text-left text-zinc-300 font-semibold">Cliente</th>
                  <th className="px-4 py-3 text-left text-zinc-300 font-semibold">Teléfono</th>
                  <th className="px-4 py-3 text-left text-zinc-300 font-semibold">Personas</th>
                  <th className="px-4 py-3 text-left text-zinc-300 font-semibold">Mesa</th>
                  <th className="px-4 py-3 text-left text-zinc-300 font-semibold">Duración (min)</th>
                  <th className="px-4 py-3 text-left text-zinc-300 font-semibold">Estado</th>
                  <th className="px-4 py-3 text-left text-zinc-300 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredReservas.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-zinc-500">
                      No hay reservas para esta fecha y filtro
                    </td>
                  </tr>
                ) : (
                  filteredReservas.map((reserva) => {
                    const mesaNombre = reserva.mesa_id
                      ? mesaById.get(reserva.mesa_id)?.nombre ?? '—'
                      : '—';
                    return (
                      <tr key={reserva.id} className="border-t border-zinc-700/80 hover:bg-zinc-800/80">
                        <td className="px-4 py-3 text-white tabular-nums">{reserva.hora}</td>
                        <td className="px-4 py-3 text-white">{reserva.nombre}</td>
                        <td className="px-4 py-3 text-zinc-300">{reserva.telefono}</td>
                        <td className="px-4 py-3 text-zinc-300 tabular-nums">{reserva.personas}</td>
                        <td className="px-4 py-3 text-zinc-300">{mesaNombre}</td>
                        <td className="px-4 py-3 text-zinc-300 tabular-nums">
                          {reserva.duracion_minutos ?? DEFAULT_RESERVATION_SLOT_MINUTES}
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={reserva.estado}
                            onChange={(e) =>
                              handleEstadoChange(reserva.id, e.target.value as Reserva['estado'])
                            }
                            className={`px-2 py-1.5 rounded text-xs font-medium w-full max-w-[9rem] ${getEstadoColor(reserva.estado)}`}
                            aria-label={`Estado de reserva ${reserva.nombre}`}
                          >
                            <option value="pendiente">Pendiente</option>
                            <option value="confirmada">Confirmada</option>
                            <option value="cancelada">Cancelada</option>
                            <option value="completada">Completada</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2 flex-wrap">
                            <button
                              type="button"
                              onClick={() => handleEditReserva(reserva)}
                              className="text-amber-500 hover:text-amber-400 font-medium"
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteReserva(reserva.id)}
                              className="text-red-500 hover:text-red-400 font-medium"
                            >
                              Eliminar
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

      {/* Modal reserva */}
      {showReservaModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
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
            className="bg-zinc-800 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto border border-zinc-700 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="reserva-modal-title" className="text-xl font-bold text-white mb-4">
              {editingReserva ? 'Editar reserva' : 'Nueva reserva'}
            </h2>
            {reservaFormError && <p className="text-red-400 text-sm mb-3">{reservaFormError}</p>}
            <form onSubmit={handleReservaSubmit} className="space-y-4">
              <div>
                <label className="block text-zinc-400 text-sm mb-1">Nombre</label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-white"
                  required
                  autoComplete="name"
                />
              </div>
              <div>
                <label className="block text-zinc-400 text-sm mb-1">Teléfono</label>
                <input
                  type="tel"
                  value={form.telefono}
                  onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                  className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-white"
                  required
                  autoComplete="tel"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 text-sm mb-1">Fecha</label>
                  <input
                    type="date"
                    value={form.fecha}
                    onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                    className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-sm mb-1">Hora</label>
                  <input
                    type="time"
                    value={form.hora}
                    onChange={(e) => setForm({ ...form, hora: e.target.value })}
                    className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-white"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-zinc-400 text-sm mb-1">Personas</label>
                <input
                  type="number"
                  min={1}
                  max={40}
                  value={form.personas}
                  onChange={(e) => setForm({ ...form, personas: Number(e.target.value) })}
                  className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-zinc-400 text-sm mb-1">Mesa (opcional)</label>
                <select
                  value={form.mesa_id === '' ? '' : String(form.mesa_id)}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      mesa_id: e.target.value === '' ? '' : Number(e.target.value),
                    })
                  }
                  className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-white"
                >
                  <option value="">Sin asignar</option>
                  {mesasActivasOrdenadas.filter((m) => m.activa).map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nombre} ({m.capacidad} sillas)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-zinc-400 text-sm mb-1">Duración del turno (minutos)</label>
                <input
                  type="number"
                  min={15}
                  step={15}
                  value={form.duracion_minutos}
                  onChange={(e) => setForm({ ...form, duracion_minutos: Number(e.target.value) })}
                  className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-zinc-400 text-sm mb-1">Notas</label>
                <textarea
                  value={form.notas}
                  onChange={(e) => setForm({ ...form, notas: e.target.value })}
                  className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-white"
                  rows={2}
                />
              </div>
              {!editingReserva && (
                <div>
                  <label className="block text-zinc-400 text-sm mb-1">Estado inicial</label>
                  <select
                    value={form.estado}
                    onChange={(e) =>
                      setForm({ ...form, estado: e.target.value as Reserva['estado'] })
                    }
                    className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="confirmada">Confirmada</option>
                    <option value="cancelada">Cancelada</option>
                    <option value="completada">Completada</option>
                  </select>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-2.5 rounded-lg font-medium"
                >
                  {editingReserva ? 'Guardar' : 'Crear'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowReservaModal(false)}
                  className="flex-1 bg-zinc-600 hover:bg-zinc-500 text-white py-2.5 rounded-lg"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal mesa */}
      {showMesaModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
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
            className="bg-zinc-800 rounded-xl p-6 w-full max-w-md border border-zinc-700 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="mesa-modal-title" className="text-xl font-bold text-white mb-4">
              {mesaIsNew ? 'Nueva mesa' : 'Editar mesa'}
            </h2>
            {mesaFormError && <p className="text-red-400 text-sm mb-3">{mesaFormError}</p>}
            <form onSubmit={handleMesaSubmit} className="space-y-4">
              <div>
                <label className="block text-zinc-400 text-sm mb-1">Nombre</label>
                <input
                  type="text"
                  value={mesaForm.nombre}
                  onChange={(e) => setMesaForm({ ...mesaForm, nombre: e.target.value })}
                  className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-zinc-400 text-sm mb-1">Capacidad (comensales)</label>
                <input
                  type="number"
                  min={1}
                  value={mesaForm.capacidad}
                  onChange={(e) => setMesaForm({ ...mesaForm, capacidad: Number(e.target.value) })}
                  className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-zinc-400 text-sm mb-1">Orden</label>
                <input
                  type="number"
                  value={mesaForm.orden}
                  onChange={(e) => setMesaForm({ ...mesaForm, orden: Number(e.target.value) })}
                  className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="activa"
                  checked={mesaForm.activa}
                  onChange={(e) => setMesaForm({ ...mesaForm, activa: e.target.checked })}
                  className="rounded border-zinc-600"
                />
                <label htmlFor="activa" className="text-zinc-300 text-sm">
                  Mesa activa
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-2.5 rounded-lg font-medium"
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={() => setShowMesaModal(false)}
                  className="flex-1 bg-zinc-600 hover:bg-zinc-500 text-white py-2.5 rounded-lg"
                >
                  Cancelar
                </button>
              </div>
              {!mesaIsNew && (
                <button
                  type="button"
                  onClick={handleDeleteMesa}
                  className="w-full text-red-400 hover:text-red-300 text-sm py-2"
                >
                  Eliminar mesa
                </button>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
