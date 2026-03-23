-- Fixes: "Could not find the 'notas' column of 'reservas' in the schema cache"
-- Run in Supabase → SQL Editor.

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
