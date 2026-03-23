import type { Mesa, Reserva } from '@/lib/supabase';

function mesaName(mesas: Mesa[], id: number | null | undefined): string {
  if (id == null) {
    return '';
  }
  return mesas.find((m) => m.id === id)?.nombre ?? String(id);
}

/**
 * Builds and downloads a PDF of all reservations (client-only; dynamic import).
 */
export async function triggerReservasPdfDownload(
  reservas: Reserva[],
  mesas: Mesa[],
  options: { venueName: string; addressLine?: string }
): Promise<void> {
  const [{ jsPDF }, autoTableMod] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);

  const autoTable = autoTableMod.default;

  const sorted = [...reservas].sort((a, b) => {
    const df = a.fecha.localeCompare(b.fecha);
    if (df !== 0) {
      return df;
    }
    return a.hora.localeCompare(b.hora);
  });

  let totalPersonas = 0;
  for (const r of sorted) {
    if (r.estado !== 'cancelada') {
      totalPersonas += r.personas;
    }
  }

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(options.venueName, 14, 16);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  if (options.addressLine) {
    doc.text(options.addressLine, 14, 22);
  }
  doc.text(`Generado: ${new Date().toLocaleString('es-AR')}`, 14, options.addressLine ? 27 : 22);
  doc.setTextColor(0, 0, 0);

  const head = [
    ['Fecha', 'Hora', 'Cliente', 'Teléfono', 'Pers.', 'Mesa', 'Estado', 'Dur. (min)', 'Notas'],
  ];

  const body = sorted.map((r) => [
    r.fecha,
    r.hora,
    r.nombre,
    r.telefono,
    String(r.personas),
    mesaName(mesas, r.mesa_id) || '—',
    r.estado,
    String(r.duracion_minutos ?? ''),
    (r.notas ?? '').replace(/\s+/g, ' ').trim(),
  ]);

  autoTable(doc, {
    startY: options.addressLine ? 32 : 28,
    head,
    body,
    styles: { fontSize: 8, cellPadding: 1.5 },
    headStyles: { fillColor: [180, 130, 40], textColor: 20 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { left: 14, right: 14 },
    tableWidth: pageW - 28,
    columnStyles: {
      0: { cellWidth: 24 },
      1: { cellWidth: 16 },
      2: { cellWidth: 38 },
      3: { cellWidth: 28 },
      4: { cellWidth: 14, halign: 'center' },
      5: { cellWidth: 28 },
      6: { cellWidth: 22 },
      7: { cellWidth: 18, halign: 'center' },
      8: { cellWidth: 'auto' },
    },
  });

  const withTable = doc as unknown as { lastAutoTable?: { finalY: number } };
  const finalY = withTable.lastAutoTable?.finalY ?? 40;
  doc.setFontSize(9);
  doc.text(`Total reservas en listado: ${sorted.length}`, 14, finalY + 10);
  doc.text(`Cubiertos (excl. canceladas): ${totalPersonas}`, 14, finalY + 16);

  const stamp = new Date().toISOString().slice(0, 10);
  doc.save(`reservas-${options.venueName.replace(/\s+/g, '-').toLowerCase()}-${stamp}.pdf`);
}
