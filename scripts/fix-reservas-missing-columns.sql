-- Run once in Supabase: SQL Editor → New query → Run.
-- Fixes missing columns on public.reservas (duracion_minutos, mesa_id, notas, etc.)

-- 1) Table mesas must exist before mesa_id FK
CREATE TABLE IF NOT EXISTS public.mesas (
  id BIGSERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  capacidad INTEGER NOT NULL CHECK (capacidad > 0),
  orden INTEGER NOT NULL DEFAULT 0,
  activa BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT mesas_nombre_unique UNIQUE (nombre)
);

-- 2) Optional FK column on reservas
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

-- 3) Required for the admin API (default 90 minutes per booking slot)
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

-- 4) Backfill if column existed as nullable (unlikely)
UPDATE public.reservas SET duracion_minutos = 90 WHERE duracion_minutos IS NULL;

-- 5) Optional notes field (admin form)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'reservas' AND column_name = 'notas'
  ) THEN
    ALTER TABLE public.reservas
      ADD COLUMN notas TEXT NULL;
  END IF;
END $$;
