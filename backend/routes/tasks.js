// backend/routes/tasks.js
const express = require('express');
const router = express.Router();

// 1. O middleware de autenticação (que anexa req.user)
const authenticateToken = require('../middleware/authenticateToken'); 

// 2. Importa o serviceRoleClient do arquivo supabaseClient.js
const { serviceRoleClient: supabase } = require('../supabaseClient'); 


// ROTA 1: GET /api/tasks (Feed público) - Rota NÃO PROTEGIDA
router.get('/', async (req, res) => {
    try {
        // Usa o cliente de serviço (Service Role) para ignorar o RLS e buscar o feed público.
        const { data, error } = await supabase 
            .from('tasks')
            .select('*')
            .eq('is_public', true) // Filtra apenas tarefas públicas
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) throw error;
        res.status(200).json(data);
    } catch (err) {
        console.error('Erro ao buscar feed público:', err);
        res.status(500).json({ error: 'Erro ao buscar tarefas públicas.' });
    }
});

// ROTA 2: POST /api/tasks (Criar nova tarefa) - ROTA PROTEGIDA
// Adicionamos o middleware authenticateToken
router.post('/', authenticateToken, async (req, res) => {
    // req.user É OBTIDO PELO MIDDLEWARE!
    if (!req.user) {
        return res.status(401).json({ error: 'Não autorizado. Faça login para criar tarefas.' });
    }

    try {
        const { title, description, is_public } = req.body;
        
        // Insere a tarefa, usando o ID do usuário do req.user
        const { data, error } = await supabase 
            .from('tasks')
            .insert({ 
                user_id: req.user.id, // O ID do usuário vem do req.user
                title, 
                description, 
                is_public: is_public || false
            })
            .select();

        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (err) {
        console.error('Erro ao criar tarefa:', err);
        res.status(500).json({ error: err.message || 'Erro ao criar tarefa.' });
    }
});

// ROTA 3: GET /api/tasks/user (Dashboard pessoal) - ROTA PROTEGIDA
router.get('/user', authenticateToken, async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Não autorizado. Faça login para ver seu dashboard.' });
    }

    try {
        // Busca todas as tarefas associadas ao ID do usuário logado
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('user_id', req.user.id) // Filtra pelo ID do usuário
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.status(200).json(data);

    } catch (err) {
        console.error('Erro ao buscar dashboard pessoal:', err);
        res.status(500).json({ error: 'Erro ao buscar tarefas do usuário.' });
    }
});

// ROTA 4 & 5: PUT /api/tasks/:id/complete & /privacy - ROTAS PROTEGIDAS
const updateTask = async (req, res, updateObject) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Não autorizado.' });
    }
    
    const taskId = req.params.id;

    try {
        const { data, error } = await supabase
            .from('tasks')
            .update(updateObject)
            .eq('id', taskId)
            .eq('user_id', req.user.id) // OBRIGA: A tarefa deve ser do usuário logado
            .select();

        if (error) throw error;
        
        if (data.length === 0) {
            return res.status(404).json({ error: 'Tarefa não encontrada ou você não tem permissão para modificá-la.' });
        }
        
        res.status(200).json(data[0]);
    } catch (err) {
        console.error('Erro na atualização da tarefa:', err);
        res.status(500).json({ error: 'Erro ao atualizar tarefa.' });
    }
}

router.put('/:id/complete', authenticateToken, (req, res) => updateTask(req, res, { is_completed: true }));

router.put('/:id/privacy', authenticateToken, (req, res) => {
    const { is_public } = req.body;
    // Validação mínima
    if (typeof is_public !== 'boolean') {
        return res.status(400).json({ error: 'O valor de is_public deve ser um booleano.' });
    }
    updateTask(req, res, { is_public: is_public });
});


module.exports = router;