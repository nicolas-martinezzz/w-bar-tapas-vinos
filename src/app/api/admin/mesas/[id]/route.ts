import { NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/require-admin-auth';
import { createServiceRoleClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

type PatchMesaBody = {
  nombre?: string;
  capacidad?: number;
  orden?: number;
  activa?: boolean;
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

  let body: PatchMesaBody;
  try {
    body = (await request.json()) as PatchMesaBody;
  } catch {
    return NextResponse.json({ error: 'BAD_REQUEST', message: 'Cuerpo JSON inválido.' }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};
  if (body.nombre !== undefined) {
    patch.nombre = String(body.nombre).trim();
  }
  if (body.capacidad !== undefined) {
    if (!Number.isFinite(body.capacidad) || body.capacidad < 1) {
      return NextResponse.json({ error: 'VALIDATION', message: 'La capacidad debe ser mayor que 0.' }, { status: 400 });
    }
    patch.capacidad = body.capacidad;
  }
  if (body.orden !== undefined) {
    patch.orden = body.orden;
  }
  if (body.activa !== undefined) {
    patch.activa = body.activa;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'VALIDATION', message: 'No hay campos para actualizar.' }, { status: 400 });
  }

  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase.from('mesas').update(patch).eq('id', id).select().single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'CONFLICT', message: 'Ya existe una mesa con ese nombre.' },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: 'DATABASE', message: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'NOT_FOUND', message: 'Mesa no encontrada.' }, { status: 404 });
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
    const { error } = await supabase.from('mesas').delete().eq('id', id);

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
