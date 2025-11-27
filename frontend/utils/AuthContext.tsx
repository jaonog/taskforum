// frontend/utils/AuthContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from './supabase';
import { User, Session } from '@supabase/supabase-js';

// Definição da Interface do Contexto
interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error: string | null }>;
  signOut: () => Promise<void>;
  // Função para obter o Token JWT, crucial para o backend Express
  getJwt: () => Promise<string | null>;
}

// Criação do Contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provedor de Autenticação
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Função para obter o Token JWT atual do usuário
  const getJwt = useCallback(async (): Promise<string | null> => {
    // Busca a sessão atual. Se o token estiver prestes a expirar, o Supabase tenta fazer o refresh.
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  }, []);

  // Efeito para configurar o listener de autenticação do Supabase
  useEffect(() => {
    // Escuta mudanças de estado da autenticação (login, logout, refresh de token)
    // CORREÇÃO APLICADA: Desestruturamos 'subscription' de dentro de 'data'
    const { data: { subscription: authListener } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setIsLoading(false);
      }
    );

    // Carrega a sessão inicial para evitar flashes de conteúdo não autenticado
    const loadSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
    };
    
    loadSession();

    // Limpa o listener ao desmontar o componente
    return () => {
      // O 'authListener' agora tem o método unsubscribe()
      authListener?.unsubscribe(); 
    };
  }, []);

  // Função de Login
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      console.error('Login error:', error.message);
      return { success: false, error: error.message };
    }
    
    return { success: true, error: null };
  };

  // Função de Logout
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error.message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signIn, signOut, getJwt }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook customizado para usar o Contexto de Autenticação
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};