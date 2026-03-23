-- Opcional: si ya tenías mesas sembradas con 4 sillas, pasalas a 8.
-- Ejecutar solo si querés unificar capacidad en mesas "Mesa N" que siguen en 4.
UPDATE public.mesas
SET capacidad = 8
WHERE capacidad = 4
  AND nombre ~ '^Mesa [0-9]+$';
