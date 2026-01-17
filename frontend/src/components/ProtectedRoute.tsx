import React, { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { Shield, Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
}) => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }

    // Remova a verificação de role se não existir
    // if (requireAdmin && user?.role !== 'ADMIN') {
    //   navigate('/dashboard');
    // }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute
