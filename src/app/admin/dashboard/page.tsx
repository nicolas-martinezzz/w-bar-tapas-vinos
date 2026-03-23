'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Mesa, Reserva } from '@/lib/supabase';

const DEFAULT_SLOT_MINUTES = 90;

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

export default function Dashboard() {
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
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
    duracion_minutos: DEFAULT_SLOT_MINUTES,
  });

  const [mesaForm, setMesaForm] = useState({
    nombre: '',
    capacidad: 4,
    orden: 0,
    activa: true,
  });

  const loadMesas = async () => {
    const res = await fetch('/api/admin/mesas');
    const parsed = await readApiResponse<Mesa[]>(res);
    if (parsed.ok) {
      setMesas(parsed.data);
    }
  };

  const loadReservas = async () => {
    const res = await fetch('/api/admin/reservas');
    const parsed = await readApiResponse<Reserva[]>(res);
    if (parsed.ok) {
      setReservas(parsed.data);
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([loadMesas(), loadReservas()]);
      setLoading(false);
    };
    void load();
  }, []);

  const mesaById = useMemo(() => {
    const map = new Map<number, Mesa>();
    mesas.forEach((m) => map.set(m.id, m));
    return map;
  }, [mesas]);

  const reservasDelDia = useMemo(
    () => reservas.filter((r) => r.fecha === selectedDate),
    [reservas, selectedDate]
  );

  const filteredReservas = useMemo(
    () =>
      reservasDelDia.filter((r) => (filter === 'todas' ? true : r.estado === filter)),
    [reservasDelDia, filter]
  );

  const hoy = new Date().toISOString().split('T')[0];
  const reservasHoy = reservas.filter((r) => r.fecha === hoy).length;
  const reservasPendientes = reservas.filter((r) => r.estado === 'pendiente').length;
  const reservasConfirmadas = reservas.filter((r) => r.estado === 'confirmada').length;
  const totalReservas = reservas.length;

  const isMesaOccupied = (mesaId: number) =>
    reservas.some(
      (r) =>
        r.mesa_id === mesaId &&
        r.fecha === selectedDate &&
        r.estado !== 'cancelada'
    );

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
      duracion_minutos: DEFAULT_SLOT_MINUTES,
    });
    await loadReservas();
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
      duracion_minutos: reserva.duracion_minutos ?? DEFAULT_SLOT_MINUTES,
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
      await loadReservas();
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
      await loadReservas();
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
      duracion_minutos: DEFAULT_SLOT_MINUTES,
    });
    setReservaFormError('');
    setShowReservaModal(true);
  };

  const openNewMesa = () => {
    setMesaIsNew(true);
    setEditingMesa(null);
    setMesaForm({ nombre: '', capacidad: 4, orden: mesas.length + 1, activa: true });
    setMesaFormError('');
    setShowMesaModal(true);
  };

  const openEditMesa = (mesa: Mesa) => {
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
    await loadMesas();
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
      await loadMesas();
      await loadReservas();
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

  const mesasActivasOrdenadas = useMemo(
    () => [...mesas].sort((a, b) => a.orden - b.orden || a.id - b.id),
    [mesas]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    );
  }

  return (
    <div>
      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
          <p className="text-zinc-400 text-sm">Hoy</p>
          <p className="text-2xl font-bold text-amber-500">{reservasHoy}</p>
        </div>
        <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
          <p className="text-zinc-400 text-sm">Pendientes</p>
          <p className="text-2xl font-bold text-yellow-500">{reservasPendientes}</p>
        </div>
        <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
          <p className="text-zinc-400 text-sm">Confirmadas</p>
          <p className="text-2xl font-bold text-green-500">{reservasConfirmadas}</p>
        </div>
        <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
          <p className="text-zinc-400 text-sm">Total</p>
          <p className="text-2xl font-bold text-white">{totalReservas}</p>
        </div>
      </div>

      {/* Vista de sala: mapa simple de mesas */}
      <section id="sala" className="mb-12 scroll-mt-24">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-white">Sala</h2>
            <p className="text-zinc-500 text-sm">Estado según la fecha seleccionada abajo</p>
          </div>
          <div className="flex gap-2">
            <label className="text-zinc-400 text-sm flex items-center gap-2">
              Día
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-white"
              />
            </label>
            <button
              type="button"
              onClick={openNewMesa}
              className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-lg text-sm"
            >
              + Mesa
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {mesasActivasOrdenadas.map((mesa) => {
            const occupied = mesa.activa && isMesaOccupied(mesa.id);
            return (
              <button
                key={mesa.id}
                type="button"
                onClick={() => openEditMesa(mesa)}
                className={`text-left rounded-lg border p-4 transition-colors ${
                  !mesa.activa
                    ? 'border-zinc-700 bg-zinc-800/50 opacity-60'
                    : occupied
                      ? 'border-amber-600/60 bg-amber-950/30'
                      : 'border-zinc-700 bg-zinc-800 hover:border-zinc-500'
                }`}
              >
                <p className="font-semibold text-white">{mesa.nombre}</p>
                <p className="text-zinc-400 text-sm">Cap. {mesa.capacidad}</p>
                <p className={`text-xs mt-2 ${occupied ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {!mesa.activa ? 'Inactiva' : occupied ? 'Ocupada' : 'Libre'}
                </p>
              </button>
            );
          })}
        </div>
        {mesas.length === 0 && (
          <p className="text-zinc-500 text-sm mt-4">No hay mesas. Ejecutá el SQL en Supabase o creá una mesa.</p>
        )}
      </section>

      {/* Lista de reservas */}
      <section id="reservas" className="scroll-mt-24">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-white">Reservas del día</h1>
          <div className="flex flex-wrap gap-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as StatusFilter)}
              className="bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white"
            >
              <option value="todas">Todas</option>
              <option value="pendiente">Pendientes</option>
              <option value="confirmada">Confirmadas</option>
              <option value="cancelada">Canceladas</option>
            </select>
            <button
              type="button"
              onClick={openNewReserva}
              className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg"
            >
              + Nueva reserva
            </button>
          </div>
        </div>

        <div className="bg-zinc-800 rounded-lg overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-zinc-700">
              <tr>
                <th className="px-4 py-3 text-left text-zinc-300">Hora</th>
                <th className="px-4 py-3 text-left text-zinc-300">Cliente</th>
                <th className="px-4 py-3 text-left text-zinc-300">Teléfono</th>
                <th className="px-4 py-3 text-left text-zinc-300">Personas</th>
                <th className="px-4 py-3 text-left text-zinc-300">Mesa</th>
                <th className="px-4 py-3 text-left text-zinc-300">Duración (min)</th>
                <th className="px-4 py-3 text-left text-zinc-300">Estado</th>
                <th className="px-4 py-3 text-left text-zinc-300">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredReservas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-zinc-500">
                    No hay reservas para esta fecha y filtro
                  </td>
                </tr>
              ) : (
                filteredReservas.map((reserva) => {
                  const mesaNombre = reserva.mesa_id ? mesaById.get(reserva.mesa_id)?.nombre ?? '—' : '—';
                  return (
                    <tr key={reserva.id} className="border-t border-zinc-700">
                      <td className="px-4 py-3 text-white">{reserva.hora}</td>
                      <td className="px-4 py-3 text-white">{reserva.nombre}</td>
                      <td className="px-4 py-3 text-zinc-300">{reserva.telefono}</td>
                      <td className="px-4 py-3 text-zinc-300">{reserva.personas}</td>
                      <td className="px-4 py-3 text-zinc-300">{mesaNombre}</td>
                      <td className="px-4 py-3 text-zinc-300">{reserva.duracion_minutos ?? DEFAULT_SLOT_MINUTES}</td>
                      <td className="px-4 py-3">
                        <select
                          value={reserva.estado}
                          onChange={(e) =>
                            handleEstadoChange(reserva.id, e.target.value as Reserva['estado'])
                          }
                          className={`px-2 py-1 rounded text-xs font-medium ${getEstadoColor(reserva.estado)}`}
                        >
                          <option value="pendiente">Pendiente</option>
                          <option value="confirmada">Confirmada</option>
                          <option value="cancelada">Cancelada</option>
                          <option value="completada">Completada</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditReserva(reserva)}
                            className="text-amber-500 hover:text-amber-400"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteReserva(reserva.id)}
                            className="text-red-500 hover:text-red-400"
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
      </section>

      {/* Modal reserva */}
      {showReservaModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">
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
                      {m.nombre} (cap. {m.capacidad})
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
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-2 rounded-lg"
                >
                  {editingReserva ? 'Guardar' : 'Crear'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowReservaModal(false)}
                  className="flex-1 bg-zinc-600 hover:bg-zinc-500 text-white py-2 rounded-lg"
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">{mesaIsNew ? 'Nueva mesa' : 'Editar mesa'}</h2>
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
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-2 rounded-lg"
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={() => setShowMesaModal(false)}
                  className="flex-1 bg-zinc-600 hover:bg-zinc-500 text-white py-2 rounded-lg"
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
