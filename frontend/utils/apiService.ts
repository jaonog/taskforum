// frontend/utils/apiService.ts
"use client"; // ESSENCIAL: Garante que este código rode no navegador, onde o fetch está disponível

import { useAuth } from './AuthContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * Hook customizado para fazer requisições autenticadas para o backend Express.
 * Ele anexa automaticamente o token JWT.
 */
export const useApiService = () => {
    // useAuth é um hook do React, por isso 'use client' é necessário acima.
    const { getJwt, signOut } = useAuth(); 

    const callApi = async <T>(
        endpoint: string, 
        options: RequestInit = {}
    ): Promise<{ data: T | null; error: string | null }> => {
        
        // 1. Obtém o Token JWT
        const token = await getJwt();

        // 2. Configura os Headers
        // Inicializa headers como um objeto que pode conter as chaves necessárias (string)
        const baseHeaders: Record<string, string> = { 
            'Content-Type': 'application/json',
            // Combina quaisquer headers que vieram nas options
            ...(options.headers as Record<string, string> | undefined), 
        };

        // Adiciona o token se ele existir
        if (token) {
            baseHeaders['Authorization'] = `Bearer ${token}`;
        }
        
        // 3. Monta a URL Completa
        const url = `${API_BASE_URL}${endpoint}`;
        
        try {
            // A função 'fetch' agora deve estar disponível no ambiente do cliente (navegador)
            const response = await fetch(url, {
                ...options,
                headers: baseHeaders, // Usa os headers corrigidos
            });

            if (response.status === 204) {
                return { data: null, error: null };
            }

            // O código 'response.json()' deve ser executado antes da verificação de 'ok'
            const data = await response.json();

            if (!response.ok) {
                console.error(`API Error (${response.status} ${response.statusText}):`, data);

                if (response.status === 401 && token) {
                    signOut(); 
                    return { data: null, error: 'Sessão expirada ou inválida. Faça login novamente.' };
                }
                
                return { data: null, error: data.error || `Erro desconhecido: ${response.statusText}` };
            }

            // Sucesso
            return { data, error: null };

        } catch (err) {
            console.error('Network or fetch error:', err);
            // Este erro é o que você estava vendo, causado pela falta do 'use client'
            return { data: null, error: 'Erro de rede ou falha na comunicação com o servidor Express.' };
        }
    };

    return { callApi };
};