import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Cliente público estándar (de solo lectura segura)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cliente con Píldora Roja (Bypass total de RLS) para el Servidor
// Importante: ¡Nunca usar supabaseAdmin en componentes del cliente!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : (null as any); // Evita que explote en el navegador (donde no hay llave de admin)
