import React from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Filter,
  RefreshCw,
  Database,
  AlertCircle
} from 'lucide-react'

interface EmptyStateProps {
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  type?: 'data' | 'search' | 'error' | 'info'
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Nenhum dado encontrado',
  description = 'Não encontramos registros com os filtros atuais.',
  actionLabel = 'Recarregar dados',
  onAction,
  type = 'data'
}) => {
  const getIcon = () => {
    switch (type) {
      case 'search':
        return <Search className="w-12 h-12" />
      case 'error':
        return <AlertCircle className="w-12 h-12" />
      case 'info':
        return <Database className="w-12 h-12" />
      default:
        return <Database className="w-12 h-12" />
    }
  }

  const getColor = () => {
    switch (type) {
      case 'search':
        return 'text-primary-600 dark:text-primary-400'
      case 'error':
        return 'text-danger-600 dark:text-danger-400'
      case 'info':
        return 'text-warning-600 dark:text-warning-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getBgColor = () => {
    switch (type) {
      case 'search':
        return 'bg-primary-50 dark:bg-primary-900/20'
      case 'error':
        return 'bg-danger-50 dark:bg-danger-900/20'
      case 'info':
        return 'bg-warning-50 dark:bg-warning-900/20'
      default:
        return 'bg-gray-50 dark:bg-gray-800'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-12 px-4"
    >
      {/* Icon Container */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className={`inline-flex p-6 rounded-2xl ${getBgColor()} ${getColor()} mb-6`}
      >
        {getIcon()}
      </motion.div>

      {/* Title */}
      <motion.h3
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-2xl font-bold text-gray-900 dark:text-white mb-2"
      >
        {title}
      </motion.h3>

      {/* Description */}
      <motion.p
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-8"
      >
        {description}
      </motion.p>

      {/* Actions */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-3 justify-center"
      >
        {onAction && (
          <button
            onClick={onAction}
            className="btn-primary inline-flex items-center justify-center"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            {actionLabel}
          </button>
        )}

        <button className="btn-outline inline-flex items-center justify-center">
          <Filter className="w-5 h-5 mr-2" />
          Ajustar Filtros
        </button>
      </motion.div>

      {/* Tips */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800"
      >
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Dicas para encontrar dados:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
            <div className="font-medium mb-1">Verifique os filtros</div>
            <p className="text-xs">Tente usar filtros mais amplos ou diferentes critérios</p>
          </div>
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
            <div className="font-medium mb-1">Atualize a página</div>
            <p className="text-xs">Às vezes uma atualização pode resolver o problema</p>
          </div>
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
            <div className="font-medium mb-1">Verifique o período</div>
            <p className="text-xs">Certifique-se de que está buscando no período correto</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default EmptyState
