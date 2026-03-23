import { NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/require-admin-auth';
import { createServiceRoleClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

/**
 * Single round-trip for admin dashboard: mesas + reservas.
 */
export async function GET() {
  const auth = await requireAdminAuth();
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const supabase = createServiceRoleClient();

    const [mesasResult, reservasResult] = await Promise.all([
      supabase
        .from('mesas')
        .select('*')
        .order('orden', { ascending: true })
        .order('id', { ascending: true }),
      supabase
        .from('reservas')
        .select('*')
        .order('fecha', { ascending: true })
        .order('hora', { ascending: true }),
    ]);

    if (mesasResult.error) {
      return NextResponse.json(
        { error: 'DATABASE', message: mesasResult.error.message },
        { status: 500 }
      );
    }
    if (reservasResult.error) {
      return NextResponse.json(
        { error: 'DATABASE', message: reservasResult.error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: {
        mesas: mesasResult.data ?? [],
        reservas: reservasResult.data ?? [],
      },
    });
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
