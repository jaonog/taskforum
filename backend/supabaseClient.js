// backend/supabaseClient.js (VERSÃO CORRIGIDA)
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY; 

// Se as variáveis não estiverem configuradas, o servidor para.
if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_KEY) {
throw new Error("As chaves do Supabase (URL, ANON e SERVICE_KEY) devem ser definidas no arquivo .env");
}

// 1. Cliente Padrão (usa a chave ANON)
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2. Cliente de Role de Serviço (usa a SERVICE_KEY para operações de servidor, como validação de token)
const serviceRoleClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Exporta ambos os clientes
module.exports = {
    supabase,
    serviceRoleClient
};