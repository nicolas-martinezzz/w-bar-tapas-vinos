import { NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/require-admin-auth';
import { assertNoReservationOverlap, assertPartyFitsMesa } from '@/lib/reserva-validation';
import { createServiceRoleClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const DEFAULT_DURACION = 90;

type ReservaEstado = 'pendiente' | 'confirmada' | 'cancelada' | 'completada';

type CreateReservaBody = {
  nombre?: string;
  telefono?: string;
  fecha?: string;
  hora?: string;
  personas?: number;
  notas?: string | null;
  estado?: ReservaEstado;
  mesa_id?: number | null;
  duracion_minutos?: number;
};

export async function GET(request: Request) {
  const auth = await requireAdminAuth();
  if (!auth.ok) {
    return auth.response;
  }

  const { searchParams } = new URL(request.url);
  const dateFilter = searchParams.get('date');

  try {
    const supabase = createServiceRoleClient();
    let query = supabase
      .from('reservas')
      .select('*')
      .order('fecha', { ascending: true })
      .order('hora', { ascending: true });

    if (dateFilter) {
      query = query.eq('fecha', dateFilter);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: 'DATABASE', message: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data ?? [] });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    if (message.includes('SUPABASE_SERVICE_ROLE_KEY')) {
      return NextResponse.json(
        { error: 'CONFIG', message: 'Falta SUPABASE_SERVICE_ROLE_KEY en el servidor.' },
        { status: 500 }
      );
    }
    return NextResponse.json({ error: 'SERVER', message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireAdminAuth();
  if (!auth.ok) {
    return auth.response;
  }

  let body: CreateReservaBody;
  try {
    body = (await request.json()) as CreateReservaBody;
  } catch {
    return NextResponse.json({ error: 'BAD_REQUEST', message: 'Cuerpo JSON inválido.' }, { status: 400 });
  }

  if (!body.nombre?.trim()) {
    return NextResponse.json({ error: 'VALIDATION', message: 'El nombre es obligatorio.' }, { status: 400 });
  }
  if (!body.telefono?.trim()) {
    return NextResponse.json({ error: 'VALIDATION', message: 'El teléfono es obligatorio.' }, { status: 400 });
  }
  if (!body.fecha?.trim()) {
    return NextResponse.json({ error: 'VALIDATION', message: 'La fecha es obligatoria.' }, { status: 400 });
  }
  if (!body.hora?.trim()) {
    return NextResponse.json({ error: 'VALIDATION', message: 'La hora es obligatoria.' }, { status: 400 });
  }

  const personas = body.personas ?? 2;
  if (!Number.isFinite(personas) || personas < 1) {
    return NextResponse.json({ error: 'VALIDATION', message: 'Personas inválidas.' }, { status: 400 });
  }

  const duracionMinutos = body.duracion_minutos ?? DEFAULT_DURACION;
  if (!Number.isFinite(duracionMinutos) || duracionMinutos < 1) {
    return NextResponse.json({ error: 'VALIDATION', message: 'Duración inválida.' }, { status: 400 });
  }

  const mesaId = body.mesa_id === undefined || body.mesa_id === null ? null : Number(body.mesa_id);
  if (mesaId !== null && !Number.isFinite(mesaId)) {
    return NextResponse.json({ error: 'VALIDATION', message: 'Mesa inválida.' }, { status: 400 });
  }

  const initialEstado = body.estado ?? 'pendiente';

  try {
    const supabase = createServiceRoleClient();

    if (initialEstado !== 'cancelada') {
      const fit = await assertPartyFitsMesa(supabase, mesaId, personas);
      if (!fit.ok) {
        return NextResponse.json({ error: 'VALIDATION', message: fit.message }, { status: 400 });
      }

      const overlap = await assertNoReservationOverlap(supabase, {
        mesaId,
        fecha: body.fecha.trim(),
        hora: body.hora.trim(),
        duracionMinutos,
      });
      if (!overlap.ok) {
        return NextResponse.json({ error: 'CONFLICT', message: overlap.message }, { status: 409 });
      }
    }

    const insertRow = {
      nombre: body.nombre.trim(),
      telefono: body.telefono.trim(),
      fecha: body.fecha.trim(),
      hora: body.hora.trim(),
      personas,
      notas: body.notas?.trim() || null,
      estado: initialEstado,
      mesa_id: mesaId,
      duracion_minutos: duracionMinutos,
    };

    const { data, error } = await supabase.from('reservas').insert(insertRow).select().single();

    if (error) {
      return NextResponse.json({ error: 'DATABASE', message: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    if (message.includes('SUPABASE_SERVICE_ROLE_KEY')) {
      return NextResponse.json(
        { error: 'CONFIG', message: 'Falta SUPABASE_SERVICE_ROLE_KEY en el servidor.' },
        { status: 500 }
      );
    }
    return NextResponse.json({ error: 'SERVER', message }, { status: 500 });
  }
}
