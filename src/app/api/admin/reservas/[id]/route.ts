import { NextResponse } from 'next/server';
import { DEFAULT_RESERVATION_SLOT_MINUTES } from '@/lib/admin-defaults';
import { requireAdminAuth } from '@/lib/require-admin-auth';
import { assertNoReservationOverlap, assertPartyFitsMesa } from '@/lib/reserva-validation';
import { createServiceRoleClient } from '@/lib/supabase-server';
import type { ReservaEstado } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

type PatchReservaBody = {
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

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminAuth();
  if (!auth.ok) {
    return auth.response;
  }

  const { id: idParam } = await context.params;
  const id = Number(idParam);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: 'VALIDATION', message: 'ID inválido.' }, { status: 400 });
  }

  let body: PatchReservaBody;
  try {
    body = (await request.json()) as PatchReservaBody;
  } catch {
    return NextResponse.json({ error: 'BAD_REQUEST', message: 'Cuerpo JSON inválido.' }, { status: 400 });
  }

  try {
    const supabase = createServiceRoleClient();

    const { data: existing, error: fetchError } = await supabase
      .from('reservas')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (fetchError) {
      return NextResponse.json({ error: 'DATABASE', message: fetchError.message }, { status: 500 });
    }
    if (!existing) {
      return NextResponse.json({ error: 'NOT_FOUND', message: 'Reserva no encontrada.' }, { status: 404 });
    }

    const nextNombre = body.nombre !== undefined ? body.nombre.trim() : existing.nombre;
    const nextTelefono = body.telefono !== undefined ? body.telefono.trim() : existing.telefono;
    const nextFecha = body.fecha !== undefined ? body.fecha.trim() : existing.fecha;
    const nextHora = body.hora !== undefined ? body.hora.trim() : existing.hora;
    const nextPersonas = body.personas !== undefined ? body.personas : existing.personas;
    const nextNotas = body.notas !== undefined ? (body.notas?.trim() || null) : existing.notas;
    const nextEstado = body.estado !== undefined ? body.estado : existing.estado;
    const nextMesaId =
      body.mesa_id === undefined
        ? existing.mesa_id != null
          ? Number(existing.mesa_id)
          : null
        : body.mesa_id === null
          ? null
          : Number(body.mesa_id);
    const nextDuracion =
      body.duracion_minutos !== undefined
        ? body.duracion_minutos
        : (existing.duracion_minutos ?? DEFAULT_RESERVATION_SLOT_MINUTES);

    if (!nextNombre) {
      return NextResponse.json({ error: 'VALIDATION', message: 'El nombre es obligatorio.' }, { status: 400 });
    }
    if (!nextTelefono) {
      return NextResponse.json({ error: 'VALIDATION', message: 'El teléfono es obligatorio.' }, { status: 400 });
    }
    if (!nextFecha || !nextHora) {
      return NextResponse.json({ error: 'VALIDATION', message: 'Fecha y hora son obligatorias.' }, { status: 400 });
    }
    if (!Number.isFinite(nextPersonas) || nextPersonas < 1) {
      return NextResponse.json({ error: 'VALIDATION', message: 'Personas inválidas.' }, { status: 400 });
    }
    if (nextMesaId !== null && !Number.isFinite(nextMesaId)) {
      return NextResponse.json({ error: 'VALIDATION', message: 'Mesa inválida.' }, { status: 400 });
    }
    if (!Number.isFinite(nextDuracion) || nextDuracion < 1) {
      return NextResponse.json({ error: 'VALIDATION', message: 'Duración inválida.' }, { status: 400 });
    }

    if (nextEstado !== 'cancelada') {
      const fit = await assertPartyFitsMesa(supabase, nextMesaId, nextPersonas);
      if (!fit.ok) {
        return NextResponse.json({ error: 'VALIDATION', message: fit.message }, { status: 400 });
      }

      const overlap = await assertNoReservationOverlap(supabase, {
        mesaId: nextMesaId,
        fecha: nextFecha,
        hora: nextHora,
        duracionMinutos: nextDuracion,
        excludeReservaId: id,
      });
      if (!overlap.ok) {
        return NextResponse.json({ error: 'CONFLICT', message: overlap.message }, { status: 409 });
      }
    }

    const patch = {
      nombre: nextNombre,
      telefono: nextTelefono,
      fecha: nextFecha,
      hora: nextHora,
      personas: nextPersonas,
      notas: nextNotas,
      estado: nextEstado,
      mesa_id: nextMesaId,
      duracion_minutos: nextDuracion,
    };

    const { data, error } = await supabase.from('reservas').update(patch).eq('id', id).select().single();

    if (error) {
      return NextResponse.json({ error: 'DATABASE', message: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
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

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminAuth();
  if (!auth.ok) {
    return auth.response;
  }

  const { id: idParam } = await context.params;
  const id = Number(idParam);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: 'VALIDATION', message: 'ID inválido.' }, { status: 400 });
  }

  try {
    const supabase = createServiceRoleClient();
    const { error } = await supabase.from('reservas').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: 'DATABASE', message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
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
