import type { Mesa, Reserva } from '@/lib/supabase';

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Builds a UTF-8 CSV with BOM for Excel, sorted by date and time.
 */
export function buildReservasCsv(reservas: Reserva[], mesas: Mesa[]): string {
  const mesaName = (id: number | null | undefined) => {
    if (id == null) {
      return '';
    }
    return mesas.find((m) => m.id === id)?.nombre ?? String(id);
  };

  const headers = [
    'fecha',
    'hora',
    'nombre',
    'telefono',
    'personas',
    'mesa',
    'estado',
    'duracion_minutos',
    'notas',
  ];

  const sorted = [...reservas].sort((a, b) => {
    const df = a.fecha.localeCompare(b.fecha);
    if (df !== 0) {
      return df;
    }
    return a.hora.localeCompare(b.hora);
  });

  const lines = [
    headers.join(','),
    ...sorted.map((r) =>
      [
        r.fecha,
        r.hora,
        r.nombre,
        r.telefono,
        String(r.personas),
        mesaName(r.mesa_id),
        r.estado,
        String(r.duracion_minutos ?? ''),
        r.notas ?? '',
      ]
        .map((c) => escapeCsvCell(String(c)))
        .join(',')
    ),
  ];

  return `\ufeff${lines.join('\r\n')}`;
}

export function triggerCsvDownload(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
