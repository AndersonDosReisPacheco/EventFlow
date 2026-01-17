import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  Home,
  Search,
  RefreshCw,
  Shield
} from 'lucide-react'

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full text-center"
      >
        {/* 404 Graphic */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-64 rounded-full bg-gradient-to-r from-primary-500/20 via-purple-500/20 to-pink-500/20 blur-2xl" />
          </div>

          <motion.div
            animate={{
              rotate: [0, 10, -10, 10, 0],
              scale: [1, 1.1, 1, 1.1, 1]
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className="relative"
          >
            <AlertTriangle className="w-32 h-32 text-warning-500 mx-auto" />
          </motion.div>

          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-8"
          >
            <h1 className="text-9xl font-bold gradient-text">404</h1>
          </motion.div>
        </div>

        {/* Message */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Página não encontrada
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
            Ops! Parece que você se perdeu. A página que você está procurando não existe ou foi movida.
          </p>
        </motion.div>

        {/* Security Message */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-900/30 border border-primary-100 dark:border-primary-800">
            <Shield className="w-4 h-4 text-primary-600 dark:text-primary-400 mr-2" />
            <span className="text-sm text-primary-700 dark:text-primary-300">
              Este evento foi registrado em nosso sistema de auditoria
            </span>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            to="/dashboard"
            className="btn-primary inline-flex items-center justify-center"
          >
            <Home className="w-5 h-5 mr-2" />
            Voltar ao Dashboard
          </Link>

          <button
            onClick={() => window.history.back()}
            className="btn-outline inline-flex items-center justify-center"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Voltar à página anterior
          </button>

          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Search className="w-5 h-5 mr-2" />
            Buscar conteúdo
          </Link>
        </motion.div>

        {/* Help Links */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Precisa de ajuda? Tente uma dessas opções:
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <a
              href="#"
              className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              Centro de Ajuda
            </a>
            <a
              href="#"
              className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              Suporte Técnico
            </a>
            <a
              href="#"
              className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              Documentação
            </a>
            <a
              href="#"
              className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              Contato
            </a>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default NotFound
