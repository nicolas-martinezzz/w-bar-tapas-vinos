-- Run this in the Supabase SQL editor (manual migration).
-- Creates mesas, extends reservas, enables RLS (anon has no policies = no access; service role bypasses RLS).

CREATE TABLE IF NOT EXISTS public.mesas (
  id BIGSERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  capacidad INTEGER NOT NULL CHECK (capacidad > 0),
  orden INTEGER NOT NULL DEFAULT 0,
  activa BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT mesas_nombre_unique UNIQUE (nombre)
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'reservas' AND column_name = 'mesa_id'
  ) THEN
    ALTER TABLE public.reservas
      ADD COLUMN mesa_id BIGINT REFERENCES public.mesas (id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'reservas' AND column_name = 'duracion_minutos'
  ) THEN
    ALTER TABLE public.reservas
      ADD COLUMN duracion_minutos INTEGER NOT NULL DEFAULT 90 CHECK (duracion_minutos > 0);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS reservas_mesa_fecha_idx ON public.reservas (mesa_id, fecha)
  WHERE mesa_id IS NOT NULL;

ALTER TABLE public.mesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservas ENABLE ROW LEVEL SECURITY;

-- Optional seed: 20 tables (skip if mesas already exist)
INSERT INTO public.mesas (nombre, capacidad, orden)
SELECT 'Mesa ' || gs, 4, gs
FROM generate_series(1, 20) AS gs
ON CONFLICT (nombre) DO NOTHING;
