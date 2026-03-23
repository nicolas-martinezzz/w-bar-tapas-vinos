'use client';

import { useState, useEffect } from 'react';
import { Reserva, reservasService } from '@/lib/supabase';

export default function Dashboard() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingReserva, setEditingReserva] = useState<Reserva | null>(null);
  const [filter, setFilter] = useState<'todas' | 'pendiente' | 'confirmada' | 'cancelada'>('todas');

  const [form, setForm] = useState<{
    nombre: string;
    telefono: string;
    fecha: string;
    hora: string;
    personas: number;
    notas: string;
    estado: 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
  }>({
    nombre: '',
    telefono: '',
    fecha: '',
    hora: '',
    personas: 2,
    notas: '',
    estado: 'pendiente'
  });

  useEffect(() => {
    loadReservas();
  }, []);

  const loadReservas = async () => {
    try {
      const data = await reservasService.getAll();
      setReservas(data);
    } catch (error) {
      console.error('Error cargando reservas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingReserva) {
        await reservasService.update(editingReserva.id, form);
      } else {
        await reservasService.create(form);
      }
      setShowModal(false);
      setEditingReserva(null);
      setForm({ nombre: '', telefono: '', fecha: '', hora: '', personas: 2, notas: '', estado: 'pendiente' });
      loadReservas();
    } catch (error) {
      console.error('Error guardando reserva:', error);
    }
  };

  const handleEdit = (reserva: Reserva) => {
    setEditingReserva(reserva);
    setForm({
      nombre: reserva.nombre,
      telefono: reserva.telefono,
      fecha: reserva.fecha,
      hora: reserva.hora,
      personas: reserva.personas,
      notas: reserva.notas || '',
      estado: reserva.estado
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar esta reserva?')) {
      try {
        await reservasService.delete(id);
        loadReservas();
      } catch (error) {
        console.error('Error eliminando reserva:', error);
      }
    }
  };

  const handleEstadoChange = async (id: number, estado: Reserva['estado']) => {
    try {
      await reservasService.updateEstado(id, estado);
      loadReservas();
    } catch (error) {
      console.error('Error actualizando estado:', error);
    }
  };

  const filteredReservas = reservas.filter(r => 
    filter === 'todas' ? true : r.estado === filter
  );

  const hoy = new Date().toISOString().split('T')[0];
  const reservasHoy = reservas.filter(r => r.fecha === hoy).length;
  const reservasPendientes = reservas.filter(r => r.estado === 'pendiente').length;
  const reservasConfirmadas = reservas.filter(r => r.estado === 'confirmada').length;
  const totalReservas = reservas.length;

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'bg-yellow-500/20 text-yellow-400';
      case 'confirmada': return 'bg-green-500/20 text-green-400';
      case 'cancelada': return 'bg-red-500/20 text-red-400';
      case 'completada': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-zinc-500/20 text-zinc-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Gestión de Reservas</h1>
        <div className="flex gap-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white"
          >
            <option value="todas">Todas</option>
            <option value="pendiente">Pendientes</option>
            <option value="confirmada">Confirmadas</option>
            <option value="cancelada">Canceladas</option>
          </select>
          <button
            onClick={() => {
              setEditingReserva(null);
              setForm({ nombre: '', telefono: '', fecha: '', hora: '', personas: 2, notas: '', estado: 'pendiente' });
              setShowModal(true);
            }}
            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg"
          >
            + Nueva Reserva
          </button>
        </div>
      </div>

      <div className="bg-zinc-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-zinc-700">
            <tr>
              <th className="px-4 py-3 text-left text-zinc-300">Fecha</th>
              <th className="px-4 py-3 text-left text-zinc-300">Hora</th>
              <th className="px-4 py-3 text-left text-zinc-300">Cliente</th>
              <th className="px-4 py-3 text-left text-zinc-300">Teléfono</th>
              <th className="px-4 py-3 text-left text-zinc-300">Personas</th>
              <th className="px-4 py-3 text-left text-zinc-300">Estado</th>
              <th className="px-4 py-3 text-left text-zinc-300">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredReservas.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                  No hay reservas para mostrar
                </td>
              </tr>
            ) : (
              filteredReservas.map((reserva) => (
                <tr key={reserva.id} className="border-t border-zinc-700">
                  <td className="px-4 py-3 text-white">{reserva.fecha}</td>
                  <td className="px-4 py-3 text-white">{reserva.hora}</td>
                  <td className="px-4 py-3 text-white">{reserva.nombre}</td>
                  <td className="px-4 py-3 text-zinc-300">{reserva.telefono}</td>
                  <td className="px-4 py-3 text-zinc-300">{reserva.personas}</td>
                  <td className="px-4 py-3">
                    <select
                      value={reserva.estado}
                      onChange={(e) => handleEstadoChange(reserva.id, e.target.value as Reserva['estado'])}
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
                        onClick={() => handleEdit(reserva)}
                        className="text-amber-500 hover:text-amber-400"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(reserva.id)}
                        className="text-red-500 hover:text-red-400"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-zinc-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingReserva ? 'Editar Reserva' : 'Nueva Reserva'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  min="1"
                  max="20"
                  value={form.personas}
                  onChange={(e) => setForm({ ...form, personas: parseInt(e.target.value) })}
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
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-2 rounded-lg"
                >
                  {editingReserva ? 'Guardar Cambios' : 'Crear Reserva'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-zinc-600 hover:bg-zinc-500 text-white py-2 rounded-lg"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}