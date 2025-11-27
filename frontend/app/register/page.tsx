// frontend/app/register/page.tsx
"use client";

import { useState, FormEvent, useEffect } from 'react';
import { supabase } from '@/utils/supabase'; // Usamos o cliente Supabase direto para o cadastro
import { useAuth } from '@/utils/AuthContext';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Redireciona se o usuário já estiver logado
  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  // Se estiver carregando, mostra o carregamento
  if (isLoading) {
    return <div className="p-8 text-center">Carregando sessão...</div>;
  }
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    if (!email || !password || !username) {
        setError('Preencha todos os campos.');
        setLoading(false);
        return;
    }

    try {
        // 1. Chamar o registro (supabase.auth.signUp)
        const { data, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                // Metadados opcionais, mas úteis
                data: { username }, 
            },
        });

        if (signUpError) {
            throw new Error(signUpError.message);
        }

        // 2. Se o registro for bem-sucedido, criar o Perfil
        if (data.user) {
            const { error: profileError } = await supabase
                .from('profiles')
                .insert({ 
                    id: data.user.id, 
                    username: username,
                });
            
            if (profileError) {
                // Nota: O ideal seria reverter o signup aqui, mas para simplicidade, apenas logamos o erro.
                console.error("Erro ao criar perfil:", profileError);
                throw new Error("Usuário criado, mas falha ao criar perfil: " + profileError.message);
            }
            
            setMessage('Cadastro realizado com sucesso! Você será redirecionado para o login.');
            
            // Redireciona após 3 segundos
            setTimeout(() => {
                router.push('/login');
            }, 3000);
            
        } else {
            // Isso acontece em setups onde a confirmação por email é obrigatória
            setMessage('Verifique seu email para confirmar sua conta e fazer login.');
        }

    } catch (err) {
        setError((err as Error).message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Cadastre-se</h1>
        
        {error && (
          <p className="mb-4 p-2 bg-red-100 text-red-700 border border-red-300 rounded text-sm">
            {error}
          </p>
        )}
        
        {message && (
          <p className="mb-4 p-2 bg-green-100 text-green-700 border border-green-300 rounded text-sm">
            {message}
          </p>
        )}

        {/* Campo Username */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
            Nome de Usuário (único)
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
            disabled={loading}
          />
        </div>

        {/* Campo E-mail */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            E-mail
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
            disabled={loading}
          />
        </div>

        {/* Campo Senha */}
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
            Senha
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            required
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Cadastrando...' : 'Cadastrar'}
        </button>

        <p className="text-center text-sm text-gray-600 mt-4">
            Já tem conta? <a href="/login" className="text-blue-500 hover:text-blue-700">Faça login</a>
        </p>
      </form>
    </div>
  );
}