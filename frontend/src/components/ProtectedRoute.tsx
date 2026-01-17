import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false
}) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Debug para verificar estado
    console.log('🔐 ProtectedRoute - Estado:', {
      hasUser: !!user,
      isLoading,
      path: location.pathname
    });
  }, [user, isLoading, location]);

  // Mostra loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
        <div className="relative">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-200 dark:border-gray-700"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-primary-500"></div>
          </div>
        </div>
        <p className="mt-6 text-gray-600 dark:text-gray-300 font-medium">
          Verificando autenticação...
        </p>
      </div>
    );
  }

  // Se não tem usuário, redireciona para login
  if (!user) {
    console.log('🔐 Usuário não autenticado, redirecionando para login');
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Verificação de admin (se necessário)
  if (requireAdmin) {
    // Se seu usuário tiver propriedade 'role' ou 'isAdmin'
    // if (user.role !== 'ADMIN' || !user.isAdmin) {
    //   return <Navigate to="/dashboard" replace />;
    // }
  }

  console.log('🔐 Usuário autenticado, renderizando conteúdo');
  return <>{children}</>;
};

export default ProtectedRoute;
