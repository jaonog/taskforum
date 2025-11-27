// backend/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Carrega as variáveis de ambiente do .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configuração do CORS
const corsOptions = {
    origin: 'http://localhost:3000', 
};

app.use(cors(corsOptions));


app.use(express.json()); 

// --- Configuração das Rotas ---

// Importa as rotas de tarefas que serão criadas em seguida
const taskRoutes = require('./routes/tasks');

// Define que todas as requisições para '/api/tasks' serão tratadas por 'taskRoutes'
app.use('/api/tasks', taskRoutes);

// Rota de Teste (Raiz da API)
app.get('/', (req, res) => {
  res.send('API de Tarefas/Fórum rodando com Express e Supabase! Acesse /api/tasks para interagir.');
});

// --- Inicialização do Servidor ---
app.listen(PORT, () => {
  console.log(`Servidor Express rodando na porta ${PORT}`);
});