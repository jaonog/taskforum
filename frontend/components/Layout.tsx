// frontend/components/Layout.tsx
"use client";

import Link from 'next/link';
import { useAuth } from '@/utils/AuthContext';
import { useRouter } from 'next/navigation';

interface LayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
    showContainer?: boolean; // Define se deve envolver o conteúdo em um container mx-auto
}

// Componente Header/Navigation
const AppHeader: React.FC = () => {
    const { user, signOut } = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        signOut();
        router.push('/login');
    };

    return (
        <header className="bg-white shadow-lg sticky top-0 z-20">
            <div className="container mx-auto p-4 flex justify-between items-center max-w-7xl">
                {/* Logo e Link Home */}
                <Link href="/" className="text-3xl font-extrabold tracking-tight text-blue-700 hover:text-blue-900 transition duration-200">
                    Task<span className='text-gray-900'>Forum</span>
                </Link>

                {/* Navegação e Status do Usuário */}
                <nav className="flex items-center space-x-4">
                    {user ? (
                        <>
                            <span className="text-gray-600 text-sm hidden sm:inline">
                                Olá, {user.email?.split('@')[0]}!
                            </span>
                            <Link 
                                href="/dashboard" 
                                className="text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg font-medium shadow-md transition duration-200"
                            >
                                Meu Dashboard
                            </Link>
                            <button 
                                onClick={handleLogout} 
                                className="text-gray-600 hover:text-red-500 px-3 py-2 rounded-lg transition duration-200 text-sm"
                            >
                                Sair
                            </button>
                        </>
                    ) : (
                        <div className="space-x-2">
                            <Link href="/login" className="text-indigo-600 hover:text-indigo-800 font-medium px-4 py-2 rounded-lg transition duration-200">
                                Entrar
                            </Link>
                            <Link 
                                href="/register" 
                                className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium shadow-md transition duration-200"
                            >
                                Cadastro
                            </Link>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    );
};


// Componente de Layout Principal
export const AppLayout: React.FC<LayoutProps> = ({ children, title, subtitle, showContainer = true }) => {
    return (
        <div className="min-h-screen bg-gray-50">
            <AppHeader />
            
            <main className={`p-8 ${showContainer ? 'container mx-auto max-w-4xl' : ''}`}>
                <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{title}</h1>
                <p className="text-gray-600 text-lg mb-8 border-b pb-4">{subtitle}</p>
                
                {children}
            </main>
        </div>
    );
};