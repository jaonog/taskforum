// frontend/app/page.tsx - Versão Refatorada
"use client";

import { useEffect, useState } from 'react';
import { useApiService } from '@/utils/apiService';
import { useAuth } from '@/utils/AuthContext';
import { AppLayout } from '@/components/Layout'; // NOVO: Importa o Layout
import { TaskCard } from '@/components/TaskCard'; // NOVO: Importa o Card

// Interface básica para uma tarefa
interface Task {
    id: number;
    title: string;
    description: string;
    is_completed: boolean;
    is_public: boolean; // Adicionamos 'is_public' aqui
    created_at: string;
}

export default function HomePage() {
    const { isLoading: isAuthLoading } = useAuth();
    const { callApi } = useApiService();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPublicFeed = async () => {
        setIsLoading(true);
        setError(null);
        
        const { data, error: apiError } = await callApi<Task[]>('/tasks', {
            method: 'GET',
        });

        if (apiError) {
            setError(apiError);
        } else if (data) {
            setTasks(data);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        if (!isAuthLoading) {
            fetchPublicFeed();
        }
    }, [isAuthLoading]); 

    if (isAuthLoading) {
        return <div className="p-8 text-center min-h-screen bg-gray-50">Carregando aplicação...</div>;
    }

    return (
        <AppLayout 
            title="Feed Público de Tarefas" 
            subtitle="Veja as tarefas e metas que outros usuários tornaram públicas."
        >
            {isLoading && <p className="text-center text-gray-500">Carregando feed...</p>}
            
            {error && (
                <div className="p-4 bg-red-100 text-red-700 rounded-md border border-red-300 mb-6">
                    Erro ao carregar o feed: {error}
                </div>
            )}

            {!isLoading && tasks.length === 0 && !error && (
                <div className="text-center text-gray-500 p-10 border border-dashed rounded-xl bg-white/50">
                    Nenhuma tarefa pública encontrada.
                </div>
            )}

            <div className="space-y-6">
                {tasks.map((task) => (
                    <TaskCard 
                        key={task.id}
                        title={task.title}
                        description={task.description}
                        isCompleted={task.is_completed}
                        isPublic={task.is_public}
                        createdAt={task.created_at}
                    />
                ))}
            </div>
        </AppLayout>
    );
}