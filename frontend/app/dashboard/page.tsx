// frontend/app/dashboard/page.tsx - Versão Refatorada
"use client";

import { useEffect, useState, FormEvent } from 'react';
import { useAuth } from '@/utils/AuthContext';
import { useRouter } from 'next/navigation';
import { useApiService } from '@/utils/apiService';
import { AppLayout } from '@/components/Layout'; // NOVO
import { TaskCard } from '@/components/TaskCard'; // NOVO

interface Task {
    id: number;
    title: string;
    description: string;
    is_public: boolean;
    is_completed: boolean;
    created_at: string;
}

export default function DashboardPage() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const router = useRouter();
    const { callApi } = useApiService();

    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoadingTasks, setIsLoadingTasks] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDescription, setNewTaskDescription] = useState('');
    const [newTaskIsPublic, setNewTaskIsPublic] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    // Lógica de Redirecionamento e Busca
    useEffect(() => {
        if (!isAuthLoading && !user) {
            router.push('/login');
        } else if (user) {
            fetchUserTasks();
        }
    }, [user, isAuthLoading, router]);

    // ... (fetchUserTasks, handleCreateTask, handleAction - As funções permanecem as mesmas)
    const fetchUserTasks = async () => {
        setIsLoadingTasks(true);
        setError(null);
        
        const { data, error: apiError } = await callApi<Task[]>('/tasks/user', {
            method: 'GET',
        });

        if (apiError) {
            setError(apiError);
            setTasks([]);
        } else if (data) {
            setTasks(data);
        }
        setIsLoadingTasks(false);
    };
    
    const handleCreateTask = async (e: FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        setError(null);

        if (!newTaskTitle) {
            setError('O título da tarefa é obrigatório.');
            setIsCreating(false);
            return;
        }

        const taskData = {
            title: newTaskTitle,
            description: newTaskDescription,
            is_public: newTaskIsPublic
        };
        
        const { data, error: apiError } = await callApi<Task>('/tasks', {
            method: 'POST',
            body: JSON.stringify(taskData)
        });

        if (apiError) {
            setError(apiError);
        } else if (data) {
            setTasks([data, ...tasks]);
            setNewTaskTitle('');
            setNewTaskDescription('');
            setNewTaskIsPublic(true);
        }
        setIsCreating(false);
    };

    const handleAction = async (taskId: number, actionType: 'complete' | 'privacy', newValue?: boolean) => {
        let endpoint = '';
        let method: 'PUT' = 'PUT';
        let body = {};
        
        if (actionType === 'complete') {
            endpoint = `/tasks/${taskId}/complete`;
        } else if (actionType === 'privacy' && newValue !== undefined) {
            endpoint = `/tasks/${taskId}/privacy`;
            body = { is_public: newValue };
        } else {
            return; 
        }

        const { error: apiError } = await callApi(endpoint, {
            method,
            body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined
        });

        if (apiError) {
            setError(`Erro ao atualizar a tarefa: ${apiError}`);
        } else {
            setTasks(tasks.map(task => {
                if (task.id === taskId) {
                    if (actionType === 'complete') {
                        return { ...task, is_completed: true };
                    }
                    if (actionType === 'privacy') {
                        return { ...task, is_public: newValue! };
                    }
                }
                return task;
            }));
        }
    };
    // ----------------------------------------------------

    if (isAuthLoading || (!user && isLoadingTasks)) {
        return <div className="p-8 text-center min-h-screen bg-gray-50">Carregando Dashboard...</div>;
    }
    
    if (!user) return null; // Redirecionado pelo useEffect

    return (
        <AppLayout 
            title={`Dashboard de ${user.email?.split('@')[0]}`} 
            subtitle="Gerencie suas tarefas, defina privacidade e marque como concluídas."
        >
            
            {error && (
                <div className="p-4 bg-red-100 text-red-700 rounded-md border border-red-300 mb-6">
                    {error}
                </div>
            )}
            
            {/* Seção de Criação de Tarefas (Formulário) */}
            <div className="bg-white p-6 rounded-xl shadow-lg mb-10 border border-indigo-100">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Criar Nova Tarefa</h2>
                <form onSubmit={handleCreateTask} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Título da Tarefa (Obrigatório)"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                        disabled={isCreating}
                        required
                    />
                    <textarea
                        placeholder="Descrição da Tarefa (Opcional)"
                        value={newTaskDescription}
                        onChange={(e) => setNewTaskDescription(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                        disabled={isCreating}
                        rows={3}
                    />
                    <div className="flex items-center justify-between">
                        <label className="text-gray-700 font-medium flex items-center">
                            <input
                                type="checkbox"
                                checked={newTaskIsPublic}
                                onChange={(e) => setNewTaskIsPublic(e.target.checked)}
                                className="mr-2 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                disabled={isCreating}
                            />
                            Publicar no Feed?
                        </label>
                        <button
                            type="submit"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition disabled:opacity-50"
                            disabled={isCreating}
                        >
                            {isCreating ? 'Salvando...' : 'Criar Tarefa'}
                        </button>
                    </div>
                </form>
            </div>
            
            {/* Seção de Lista de Tarefas */}
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">Minhas Tarefas ({tasks.length})</h2>
            
            {isLoadingTasks && <p className="text-center text-gray-500 p-10">Carregando suas tarefas...</p>}

            {!isLoadingTasks && tasks.length === 0 && !error && (
                <div className="text-center text-gray-500 p-10 border border-dashed rounded-xl bg-white/50">
                    Você ainda não criou nenhuma tarefa.
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
                    >
                        {/* Ações (Botões) passados como children */}
                        <div className="space-x-2">
                            {!task.is_completed && (
                                <button 
                                    onClick={() => handleAction(task.id, 'complete')}
                                    className="text-xs text-white bg-green-500 hover:bg-green-600 px-3 py-1 rounded-lg transition shadow-sm"
                                >
                                    Feita
                                </button>
                            )}
                            <button 
                                onClick={() => handleAction(task.id, 'privacy', !task.is_public)}
                                className="text-xs text-white bg-gray-500 hover:bg-gray-600 px-3 py-1 rounded-lg transition shadow-sm"
                            >
                                {task.is_public ? 'Privada' : 'Pública'}
                            </button>
                        </div>
                    </TaskCard>
                ))}
            </div>
        </AppLayout>
    );
}