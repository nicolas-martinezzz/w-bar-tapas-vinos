import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface Reserva {
  id: number;
  nombre: string;
  telefono: string;
  fecha: string;
  hora: string;
  personas: number;
  estado: 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
  notas?: string;
  created_at: string;
}

export const reservasService = {
  async getAll(): Promise<Reserva[]> {
    const { data, error } = await supabase
      .from('reservas')
      .select('*')
      .order('fecha', { ascending: true })
      .order('hora', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async create(reserva: Omit<Reserva, 'id' | 'created_at'>): Promise<Reserva> {
    const { data, error } = await supabase
      .from('reservas')
      .insert(reserva)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: number, reserva: Partial<Reserva>): Promise<Reserva> {
    const { data, error } = await supabase
      .from('reservas')
      .update(reserva)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from('reservas')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async updateEstado(id: number, estado: Reserva['estado']): Promise<Reserva> {
    return this.update(id, { estado });
  }
};