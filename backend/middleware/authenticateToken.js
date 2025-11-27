
// Importa o serviceRoleClient que é capaz de validar o JWT no servidor
const { serviceRoleClient } = require('../supabaseClient'); 

// Tenta validar o token JWT e anexa o objeto user a req.user
module.exports = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    // 1. Verificar se o cabeçalho Authorization existe e começa com "Bearer"
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // Se não houver token, define req.user como null e continua.
        // As rotas protegidas (com cheque de req.user) irão bloquear o acesso.
        req.user = null; 
        return next();
    }

    const token = authHeader.split(' ')[1];

    try {
        // Valida o token usando o serviceRoleClient
        // serviceRoleClient.auth.getUser() é o método que valida o JWT com a SERVICE KEY
        const { data: { user }, error } = await serviceRoleClient.auth.getUser(token);

        if (error || !user) {
            // Se o token for inválido, expirado, ou o usuário não for encontrado
            req.user = null;
        } else {
            // 3. Se o token for válido, anexa o objeto user à requisição
            req.user = user;
        }
        
        // Continua para a próxima função da rota (o controlador)
        next();

    } catch (e) {
        console.error('Exceção no middleware de autenticação:', e.message);
        // Em caso de erro grave, é tratado como não autorizado
        req.user = null;
        next(); 
    }
};
