import { NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/require-admin-auth';
import { createServiceRoleClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

type CreateMesaBody = {
  nombre?: string;
  capacidad?: number;
  orden?: number;
  activa?: boolean;
};

export async function GET() {
  const auth = await requireAdminAuth();
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from('mesas')
      .select('*')
      .order('orden', { ascending: true })
      .order('id', { ascending: true });

    if (error) {
      return NextResponse.json({ error: 'DATABASE', message: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data ?? [] });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: 'SERVER', message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireAdminAuth();
  if (!auth.ok) {
    return auth.response;
  }

  let body: CreateMesaBody;
  try {
    body = (await request.json()) as CreateMesaBody;
  } catch {
    return NextResponse.json({ error: 'BAD_REQUEST', message: 'Cuerpo JSON inválido.' }, { status: 400 });
  }

  if (!body.nombre?.trim()) {
    return NextResponse.json({ error: 'VALIDATION', message: 'El nombre es obligatorio.' }, { status: 400 });
  }

  const capacidad = body.capacidad ?? 4;
  if (!Number.isFinite(capacidad) || capacidad < 1) {
    return NextResponse.json({ error: 'VALIDATION', message: 'La capacidad debe ser mayor que 0.' }, { status: 400 });
  }

  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from('mesas')
      .insert({
        nombre: body.nombre.trim(),
        capacidad,
        orden: body.orden ?? 0,
        activa: body.activa ?? true,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'CONFLICT', message: 'Ya existe una mesa con ese nombre.' },
          { status: 409 }
        );
      }
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
