/**
 * Shared types for Supabase tables (admin API + UI).
 * Runtime access for anon/publishable key was moved to Route Handlers with the service role.
 */

export type ReservaEstado = 'pendiente' | 'confirmada' | 'cancelada' | 'completada';

export interface Mesa {
  id: number;
  nombre: string;
  capacidad: number;
  orden: number;
  activa: boolean;
  created_at: string;
}

export interface Reserva {
  id: number;
  nombre: string;
  telefono: string;
  fecha: string;
  hora: string;
  personas: number;
  estado: ReservaEstado;
  notas?: string | null;
  created_at: string;
  mesa_id?: number | null;
  duracion_minutos?: number;
}
