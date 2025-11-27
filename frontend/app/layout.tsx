// frontend/app/layout.tsx (CORRIGIDO)
import './globals.css';
import { AuthProvider } from '../utils/AuthContext'; 

export const metadata = {
  title: 'Organizador Fórum',
  description: 'Um sistema de organização e interação social.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <body>
        
        <div className="mi">
          <AuthProvider>
            {children}
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}