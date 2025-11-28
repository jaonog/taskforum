// backend/server.js

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Configuração das Variáveis de Ambiente
// Em produção (Render), as variáveis são injetadas pelo ambiente.
// Roda dotenv.config() apenas se não estiver em produção para carregar o .env local.
if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

const app = express();
// Define a porta: usa a porta fornecida pelo Render (process.env.PORT) ou 5000 (local)
const PORT = process.env.PORT || 5000;

// Variável para a URL de produção do frontend (Vercel/Render)
// ESTE VALOR DEVE SER CONFIGURADO NAS VARIÁVEIS DE AMBIENTE DO RENDER (VERCEL_FRONTEND_URL)
const VERCEL_FRONTEND_URL = process.env.VERCEL_FRONTEND_URL || 'https://jaonog-taskforum-4mhw.vercel.app'; 
// Substitua a URL padrão acima pela sua URL real, mas garanta que ela esteja no painel do Render!

// Configuração do CORS: Permite acesso tanto do ambiente local quanto da URL de produção
const corsOptions = {
    // Permite que o ambiente de produção E o ambiente de desenvolvimento acessem a API
    origin: [VERCEL_FRONTEND_URL, 'http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}; 

app.use(cors(corsOptions));

// Middleware para analisar corpos de requisição JSON
app.use(express.json()); 

// --- Configuração das Rotas ---

// Importa as rotas de tarefas
const taskRoutes = require('./routes/tasks');

// Define que todas as requisições para '/api/tasks' serão tratadas por 'taskRoutes'
app.use('/api/tasks', taskRoutes);

// Rota de Teste (Raiz da API)
app.get('/', (req, res) => {
    // Rota simples para verificar se o servidor está ativo
    res.send('API de Tarefas/Fórum rodando com Express e Supabase! O caminho correto para interagir é /api/tasks.');
});

// --- Inicialização do Servidor ---
app.listen(PORT, () => {
    console.log(`Servidor Express rodando na porta ${PORT}`);
    console.log(`CORS permitido para: ${corsOptions.origin.join(' e ')}`);
});