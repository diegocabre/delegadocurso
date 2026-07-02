-- ====================================================================
-- MIGRACIÓN DE BASE DE DATOS: SOPORTE MULTI-TENANT (MULTICURSOS)
-- Ejecuta este script en el SQL Editor de tu Dashboard de Supabase.
-- ====================================================================

-- 1. Crear la tabla de Cursos
CREATE TABLE IF NOT EXISTS public.cursos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    admin_password TEXT NOT NULL,
    activo BOOLEAN DEFAULT false,
    creado_en TIMESTAMPTZ DEFAULT now()
);

-- Asegurar que la columna 'activo' exista si la tabla ya existía de antes
ALTER TABLE public.cursos ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT false;

-- Habilitar RLS en la tabla de cursos
ALTER TABLE public.cursos ENABLE ROW LEVEL SECURITY;

-- Crear política de lectura pública para que la app y la web validen códigos de curso
-- Se eliminan acentos para evitar incompatibilidades de encoding/codificación en el SQL Editor
DROP POLICY IF EXISTS "Lectura pública de cursos" ON public.cursos;
DROP POLICY IF EXISTS "Lectura publica de cursos" ON public.cursos;
CREATE POLICY "Lectura publica de cursos" ON public.cursos 
    FOR SELECT USING (true);

-- 2. Insertar el curso por defecto para migrar los datos existentes del Curso 5B
-- Nota: La contraseña por defecto de administración será 'tesorero2026'.
-- Puedes cambiarla directamente en la tabla 'cursos' en Supabase.
INSERT INTO public.cursos (codigo, nombre, admin_password, activo)
VALUES ('CL-5B-2026', 'Curso 5B', 'tesorero2026', true)
ON CONFLICT (codigo) DO UPDATE SET activo = true;

-- 3. Obtener el ID del curso por defecto para usarlo en la migración
DO $$
DECLARE
    default_curso_id UUID;
BEGIN
    SELECT id INTO default_curso_id FROM public.cursos WHERE codigo = 'CL-5B-2026' LIMIT 1;

    -- 4. Agregar columna curso_id a 'alumnos' y asociar datos existentes
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='alumnos' AND column_name='curso_id') THEN
        ALTER TABLE public.alumnos ADD COLUMN curso_id UUID REFERENCES public.cursos(id) ON DELETE CASCADE;
        UPDATE public.alumnos SET curso_id = default_curso_id WHERE curso_id IS NULL;
        ALTER TABLE public.alumnos ALTER COLUMN curso_id SET NOT NULL;
    END IF;

    -- 5. Agregar columna curso_id a 'pagos' y asociar datos existentes
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pagos' AND column_name='curso_id') THEN
        ALTER TABLE public.pagos ADD COLUMN curso_id UUID REFERENCES public.cursos(id) ON DELETE CASCADE;
        UPDATE public.pagos SET curso_id = default_curso_id WHERE curso_id IS NULL;
        ALTER TABLE public.pagos ALTER COLUMN curso_id SET NOT NULL;
    END IF;

    -- 6. Agregar columna curso_id a 'gastos' y asociar datos existentes
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='gastos' AND column_name='curso_id') THEN
        ALTER TABLE public.gastos ADD COLUMN curso_id UUID REFERENCES public.cursos(id) ON DELETE CASCADE;
        UPDATE public.gastos SET curso_id = default_curso_id WHERE curso_id IS NULL;
        ALTER TABLE public.gastos ALTER COLUMN curso_id SET NOT NULL;
    END IF;

    -- 7. Agregar columna curso_id a 'campanas' y asociar datos existentes
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='campanas' AND column_name='curso_id') THEN
        ALTER TABLE public.campanas ADD COLUMN curso_id UUID REFERENCES public.cursos(id) ON DELETE CASCADE;
        UPDATE public.campanas SET curso_id = default_curso_id WHERE curso_id IS NULL;
        ALTER TABLE public.campanas ALTER COLUMN curso_id SET NOT NULL;
    END IF;

    -- 8. Agregar columna curso_id a 'pagos_campanas' y asociar datos existentes
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pagos_campanas' AND column_name='curso_id') THEN
        ALTER TABLE public.pagos_campanas ADD COLUMN curso_id UUID REFERENCES public.cursos(id) ON DELETE CASCADE;
        UPDATE public.pagos_campanas SET curso_id = default_curso_id WHERE curso_id IS NULL;
        ALTER TABLE public.pagos_campanas ALTER COLUMN curso_id SET NOT NULL;
    END IF;

END $$;

-- 9. Asegurar que las políticas existan para todas las tablas sin generar errores duplicados

-- === POLÍTICAS DE LECTURA (SELECT) ===
DROP POLICY IF EXISTS "Lectura pública de alumnos" ON public.alumnos;
DROP POLICY IF EXISTS "Lectura publica de alumnos" ON public.alumnos;
CREATE POLICY "Lectura publica de alumnos" ON public.alumnos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Lectura pública de pagos" ON public.pagos;
DROP POLICY IF EXISTS "Lectura publica de pagos" ON public.pagos;
CREATE POLICY "Lectura publica de pagos" ON public.pagos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Lectura pública de gastos" ON public.gastos;
DROP POLICY IF EXISTS "Lectura publica de gastos" ON public.gastos;
CREATE POLICY "Lectura publica de gastos" ON public.gastos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Lectura pública de campanas" ON public.campanas;
DROP POLICY IF EXISTS "Lectura publica de campanas" ON public.campanas;
CREATE POLICY "Lectura publica de campanas" ON public.campanas FOR SELECT USING (true);

DROP POLICY IF EXISTS "Lectura pública de pagos_campanas" ON public.pagos_campanas;
DROP POLICY IF EXISTS "Lectura publica de pagos_campanas" ON public.pagos_campanas;
CREATE POLICY "Lectura publica de pagos_campanas" ON public.pagos_campanas FOR SELECT USING (true);


-- === POLÍTICAS DE ESCRITURA PARA LA APP MÓVIL (INSERT, UPDATE, DELETE) ===

-- Alumnos
DROP POLICY IF EXISTS "Permitir inserción pública de alumnos" ON public.alumnos;
DROP POLICY IF EXISTS "Permitir insercion publica de alumnos" ON public.alumnos;
CREATE POLICY "Permitir insercion publica de alumnos" ON public.alumnos FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir actualización pública de alumnos" ON public.alumnos;
DROP POLICY IF EXISTS "Permitir actualizacion publica de alumnos" ON public.alumnos;
CREATE POLICY "Permitir actualizacion publica de alumnos" ON public.alumnos FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Permitir eliminación pública de alumnos" ON public.alumnos;
DROP POLICY IF EXISTS "Permitir eliminacion publica de alumnos" ON public.alumnos;
CREATE POLICY "Permitir eliminacion publica de alumnos" ON public.alumnos FOR DELETE USING (true);

-- Pagos
DROP POLICY IF EXISTS "Permitir inserción pública de pagos" ON public.pagos;
DROP POLICY IF EXISTS "Permitir insercion publica de pagos" ON public.pagos;
CREATE POLICY "Permitir insercion publica de pagos" ON public.pagos FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir eliminación pública de pagos" ON public.pagos;
DROP POLICY IF EXISTS "Permitir eliminacion publica de pagos" ON public.pagos;
CREATE POLICY "Permitir eliminacion publica de pagos" ON public.pagos FOR DELETE USING (true);

-- Gastos
DROP POLICY IF EXISTS "Permitir inserción pública de gastos" ON public.gastos;
DROP POLICY IF EXISTS "Permitir insercion publica de gastos" ON public.gastos;
CREATE POLICY "Permitir insercion publica de gastos" ON public.gastos FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir eliminación pública de gastos" ON public.gastos;
DROP POLICY IF EXISTS "Permitir eliminacion publica de gastos" ON public.gastos;
CREATE POLICY "Permitir eliminacion publica de gastos" ON public.gastos FOR DELETE USING (true);

-- Campañas
DROP POLICY IF EXISTS "Permitir inserción pública de campanas" ON public.campanas;
DROP POLICY IF EXISTS "Permitir insercion publica de campanas" ON public.campanas;
CREATE POLICY "Permitir insercion publica de campanas" ON public.campanas FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir actualización pública de campanas" ON public.campanas;
DROP POLICY IF EXISTS "Permitir actualizacion publica de campanas" ON public.campanas;
CREATE POLICY "Permitir actualizacion publica de campanas" ON public.campanas FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Permitir eliminación pública de campanas" ON public.campanas;
DROP POLICY IF EXISTS "Permitir eliminacion publica de campanas" ON public.campanas;
CREATE POLICY "Permitir eliminacion publica de campanas" ON public.campanas FOR DELETE USING (true);

-- Pagos Campañas
DROP POLICY IF EXISTS "Permitir inserción pública de pagos_campanas" ON public.pagos_campanas;
DROP POLICY IF EXISTS "Permitir insercion publica de pagos_campanas" ON public.pagos_campanas;
CREATE POLICY "Permitir insercion publica de pagos_campanas" ON public.pagos_campanas FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir eliminación pública de pagos_campanas" ON public.pagos_campanas;
DROP POLICY IF EXISTS "Permitir eliminacion publica de pagos_campanas" ON public.pagos_campanas;
CREATE POLICY "Permitir eliminacion publica de pagos_campanas" ON public.pagos_campanas FOR DELETE USING (true);
