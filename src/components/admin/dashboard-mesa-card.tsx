'use client';

import { memo } from 'react';
import { Armchair } from 'lucide-react';
import type { Mesa } from '@/lib/supabase';

export const MesaCard = memo(function MesaCard({
  mesa,
  occupied,
  onEdit,
}: {
  mesa: Mesa;
  occupied: boolean;
  onEdit: (m: Mesa) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onEdit(mesa)}
      aria-label={`${mesa.nombre}, capacidad ${mesa.capacidad}, ${!mesa.activa ? 'inactiva' : occupied ? 'ocupada' : 'libre'}`}
      className={`group text-left rounded-2xl border-2 p-4 transition-all focus:outline-none focus:ring-2 focus:ring-amber-400/70 focus:ring-offset-2 focus:ring-offset-stone-950 ${
        !mesa.activa
          ? 'border-stone-700 bg-stone-800/40 opacity-70'
          : occupied
            ? 'border-amber-500/50 bg-gradient-to-br from-amber-950/50 to-stone-900 shadow-md'
            : 'border-emerald-800/50 bg-stone-800/80 hover:border-emerald-600/40 hover:shadow-lg'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <Armchair
          className={`h-6 w-6 shrink-0 ${
            !mesa.activa ? 'text-stone-500' : occupied ? 'text-amber-400' : 'text-emerald-400'
          }`}
          aria-hidden
        />
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
            !mesa.activa
              ? 'bg-stone-700 text-stone-400'
              : occupied
                ? 'bg-amber-500/20 text-amber-200'
                : 'bg-emerald-500/20 text-emerald-200'
          }`}
        >
          {!mesa.activa ? 'Apagada' : occupied ? 'Ocupada' : 'Libre'}
        </span>
      </div>
      <p className="mt-3 font-bold text-white text-lg leading-tight">{mesa.nombre}</p>
      <p className="text-stone-400 text-sm mt-1">
        Hasta <span className="text-stone-200 font-medium">{mesa.capacidad}</span> personas
      </p>
      <p className="text-xs text-stone-500 mt-3 group-hover:text-stone-400">Tocá para editar</p>
    </button>
  );
});
