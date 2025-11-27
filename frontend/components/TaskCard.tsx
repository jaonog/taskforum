// frontend/components/TaskCard.tsx
import React from 'react';

interface TaskCardProps {
    title: string;
    description: string;
    isCompleted: boolean;
    isPublic: boolean;
    createdAt: string;
    // Opcional: Para botões de ação no Dashboard
    children?: React.ReactNode; 
}

export const TaskCard: React.FC<TaskCardProps> = ({
    title,
    description,
    isCompleted,
    isPublic,
    createdAt,
    children
}) => {
    const statusColor = isCompleted ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700';
    const privacyColor = isPublic ? 'bg-indigo-100 text-indigo-700' : 'bg-red-100 text-red-700';

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition duration-300 ease-in-out">
            <div className="flex justify-between items-start mb-3">
                <h3 className={`text-xl font-bold ${isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                    {title}
                </h3>
                <div className="flex space-x-2">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColor}`}>
                        {isCompleted ? 'Concluída' : 'Pendente'}
                    </span>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${privacyColor}`}>
                        {isPublic ? 'Pública' : 'Privada'}
                    </span>
                </div>
            </div>

            <p className="text-gray-700 mb-4 text-sm">
                {description || "Sem descrição."}
            </p>
            
            <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                <span className="text-xs text-gray-400">
                    Criada em: {new Date(createdAt).toLocaleDateString()}
                </span>
                
                {/* Área para botões de ação (usado no Dashboard) */}
                {children && <div className="space-x-2">{children}</div>}
            </div>
        </div>
    );
};