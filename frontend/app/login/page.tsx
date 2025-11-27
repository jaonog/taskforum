// frontend/app/login/page.tsx
"use client";

import { useState, FormEvent, useEffect } from 'react';
import { useAuth } from '@/utils/AuthContext';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { signIn, user, isLoading } = useAuth();
  const router = useRouter();

  // Redireciona se o usuário já estiver logado
  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);
  
  // Exibe um carregamento se a autenticação inicial ainda estiver processando
  if (isLoading) {
    return <div className="p-8 text-center">Carregando sessão...</div>;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!email || !password) {
        setError('Preencha todos os campos.');
        setLoading(false);
        return;
    }
    
    // Chama a função de login do AuthContext
    const { success, error: authError } = await signIn(email, password);

    if (success) {
      // O useEffect cuidará do redirecionamento
    } else {
      setError(authError || 'Erro desconhecido ao tentar fazer login.');
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h1>
        
        {error && (
          <p className="mb-4 p-2 bg-red-100 text-red-700 border border-red-300 rounded text-sm">
            {error}
          </p>
        )}

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
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>

        <p className="text-center text-sm text-gray-600 mt-4">
            Não tem conta? <a href="/register" className="text-blue-500 hover:text-blue-700">Cadastre-se</a>
        </p>
      </form>
    </div>
  );
}