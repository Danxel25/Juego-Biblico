import { createClient, SupabaseClient } from '@supabase/supabase-js';

// NOTA IMPORTANTE:
// Reemplaza los valores de abajo con la URL y la clave anónima (anon key) de tu proyecto de Supabase.
// Es una buena práctica almacenar estas claves como variables de entorno.
// Puedes encontrarlas en tu panel de Supabase: "Project Settings" > "API".

export const supabaseUrl = (window as any).process?.env?.SUPABASE_URL || 'https://lltzemsaoqysxybohnrd.supabase.co';
export const supabaseKey = (window as any).process?.env?.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsdHplbXNhb3F5c3h5Ym9obnJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4MzY5MTEsImV4cCI6MjA3ODQxMjkxMX0.r6uVoEBhBOqMu5QsZpOZkOaf9uMHNsfe1kxE5iFdVqA';

if (supabaseKey.startsWith('YOUR_SUPABASE_ANON_KEY') || supabaseUrl.startsWith('YOUR_SUPABASE_URL')) {
    console.warn(`
      ***********************************************************************************
      *                                                                                 *
      *  Las credenciales de Supabase no están configuradas correctamente.              *
      *  Por favor, añade tu SUPABASE_URL y SUPABASE_KEY en                             *
      *  'src/environments/supabase.config.ts'.                                         *
      *  La funcionalidad de la base de datos estará deshabilitada.                     *
      *                                                                                 *
      ***********************************************************************************
    `);
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);