// frontend/utils/supabase.ts
import { createClient } from '@supabase/supabase-js';

// As variáveis de ambiente públicas são lidas automaticamente pelo Next.js
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('As variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY não estão definidas em .env.local');
}

/**
 * Cliente Supabase inicializado
 * Este cliente é usado para Autenticação e quaisquer chamadas que não precisem 
 * de um cliente específico de Server Component/API Route.
 * Para operações CRUD em Server Components (onde o RLS é importante), 
 * o ideal é usar o Supabase Helper para Server Components, mas para a autenticação 
 * básica do lado do cliente (browser), este é suficiente.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    // Evita que o Next.js lide com headers de autenticação automaticamente,
    // o que nos dá controle manual sobre o token JWT quando chamamos o backend Express.
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
    }
});

// ********** NOTA IMPORTANTE **********
// Para um projeto Next.js ideal com Supabase, normalmente usaríamos os Helpers do
// Supabase para Next.js para criar um cliente seguro para o Server Component.
// No entanto, como nossa API CRUD é EXTERNA (o backend Express), 
// vamos usar este cliente APENAS para gerenciar a SESSÃO e o JWT no browser/Next.js. 
// As chamadas de dados CRUD irão para http://localhost:5000/api.