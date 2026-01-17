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
  requireAdmin = false
}) => {
  const { user, token, isLoading, verifyToken } = useAuth()
  const location = useLocation()

  useEffect(() => {
    // Verificar token se estiver carregando
    if (token && isLoading) {
      verifyToken()
    }
  }, [token, isLoading, verifyToken])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-950">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 animate-spin" />
            <Shield className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="mt-6 text-lg font-semibold text-gray-700 dark:text-gray-300">
            Verificando autenticação...
          </p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Aguarde enquanto validamos suas credenciais
          </p>
        </motion.div>
      </div>
    )
  }

  if (!token) {
    console.log('ProtectedRoute: Token não encontrado, redirecionando para login')
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!user) {
    console.log('ProtectedRoute: Usuário não encontrado, redirecionando para login')
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requireAdmin && user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-950">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center max-w-md"
        >
          <div className="mb-6 p-4 rounded-full bg-red-100 dark:bg-red-900 inline-block">
            <Shield className="w-12 h-12 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Acesso Restrito
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Você não tem permissão para acessar esta página. Apenas administradores podem visualizar este conteúdo.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voltar
          </button>
        </motion.div>
      </div>
    )
  }

  return <>{children}</>
}

export default ProtectedRoute
