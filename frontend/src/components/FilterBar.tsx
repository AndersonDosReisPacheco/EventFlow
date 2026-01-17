// D:\Meu_Projetos_Pessoais\EventFlow\frontend\src\components\FilterBar.tsx
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Filter,
  Calendar,
  User,
  Activity,
  X,
  ChevronDown,
  Search,
  Download,
  RefreshCw,
  List,
  Eye
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { FilterOptions } from '../types'

interface FilterBarProps {
  onFilter: (filters: FilterOptions) => void
  isLoading: boolean
}

const FilterBar: React.FC<FilterBarProps> = ({ onFilter, isLoading }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [filters, setFilters] = useState<FilterOptions>({
    action: '',
    entity: '',
    startDate: '',
    endDate: '',
    page: 1,
    pageSize: 10,
  })

  const actions = [
    { value: 'LOGIN', label: 'Login' },
    { value: 'LOGOUT', label: 'Logout' },
    { value: 'CREATE', label: 'Criação' },
    { value: 'UPDATE', label: 'Atualização' },
    { value: 'DELETE', label: 'Exclusão' },
    { value: 'LOGIN_SUCCESS', label: 'Login Sucesso' },
    { value: 'LOGIN_FAILED', label: 'Login Falhou' },
    { value: 'USER_REGISTERED', label: 'Usuário Registrado' },
    { value: 'ACCESS_DASHBOARD', label: 'Acesso Dashboard' },
    { value: 'PROFILE_ACCESS', label: 'Acesso Perfil' },
    { value: 'NOTIFICATIONS_ACCESS', label: 'Acesso Notificações' },
  ]

  const entities = [
    { value: 'USER', label: 'Usuário' },
    { value: 'EVENT', label: 'Evento' },
    { value: 'AUTH', label: 'Autenticação' },
    { value: 'NOTIFICATION', label: 'Notificação' },
    { value: 'PROFILE', label: 'Perfil' },
  ]

  const pageSizes = [10, 25, 50, 100]

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilter(newFilters)
  }

  const handleClearFilters = () => {
    const clearedFilters = {
      action: '',
      entity: '',
      startDate: '',
      endDate: '',
      page: 1,
      pageSize: 10,
    }
    setFilters(clearedFilters)
    onFilter(clearedFilters)
  }

  const handleQuickDateFilter = (days: number) => {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const newFilters = {
      ...filters,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    }

    setFilters(newFilters)
    onFilter(newFilters)
  }

  const hasActiveFilters = filters.action || filters.entity || filters.startDate || filters.endDate

  return (
    <motion.div
      layout
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      {/* Filter Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30">
              <Filter className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Filtros de Eventos
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Filtre os eventos por diferentes critérios
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* BOTÃO "FILTRAR" - LINK FUNCIONAL para página de eventos com filtros */}
            <Link
              to="/events"
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 text-white rounded-lg font-medium transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtrar Eventos
            </Link>

            {/*  BOTÃO "VER TODOS" - LINK FUNCIONAL para página de eventos sem filtros */}
            <Link
              to="/events?view=all"
              className="inline-flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition-all duration-300"
            >
              <Eye className="w-4 h-4 mr-2" />
              Ver Todos
            </Link>

            {hasActiveFilters && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={handleClearFilters}
                className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20 transition-colors"
              >
                <X className="w-4 h-4 mr-1" />
                Limpar Filtros
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium transition-colors"
            >
              {isExpanded ? 'Ocultar' : 'Mostrar'} Filtros
              <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </motion.button>
          </div>
        </div>

        {/* Quick Date Filters */}
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">Período rápido:</span>
          {[1, 7, 30, 90].map((days) => (
            <button
              key={days}
              onClick={() => handleQuickDateFilter(days)}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Últimos {days} dias
            </button>
          ))}
        </div>
      </div>

      {/* Filter Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-b border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Action Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <div className="flex items-center">
                    <Activity className="w-4 h-4 mr-2" />
                    Tipo de Ação
                  </div>
                </label>
                <select
                  value={filters.action}
                  onChange={(e) => handleFilterChange('action', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Todas as ações</option>
                  {actions.map((action) => (
                    <option key={action.value} value={action.value}>
                      {action.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Entity Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Entidade
                  </div>
                </label>
                <select
                  value={filters.entity}
                  onChange={(e) => handleFilterChange('entity', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Todas as entidades</option>
                  {entities.map((entity) => (
                    <option key={entity.value} value={entity.value}>
                      {entity.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Data Inicial
                  </div>
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Data Final
                  </div>
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              {/* Page Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Itens por página
                </label>
                <select
                  value={filters.pageSize}
                  onChange={(e) => handleFilterChange('pageSize', parseInt(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                >
                  {pageSizes.map((size) => (
                    <option key={size} value={size}>
                      {size} itens
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Input */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <div className="flex items-center">
                    <Search className="w-4 h-4 mr-2" />
                    Busca por descrição
                  </div>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Digite para buscar na descrição..."
                    className="w-full px-4 py-3 pl-11 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {hasActiveFilters ? 'Filtros ativos' : 'Nenhum filtro ativo'}
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleClearFilters}
                    disabled={!hasActiveFilters}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className="w-4 h-4 mr-2 inline-block" />
                    Redefinir
                  </button>

                  <button
                    onClick={() => onFilter(filters)}
                    disabled={isLoading}
                    className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Filter className="w-4 h-4 mr-2 inline-block" />
                    Aplicar Filtros
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/*  LINKS ADICIONAIS ABAIXO DA BARRA DE FILTROS */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/30 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-4">
          <Link
            to="/events?type=LOGIN_SUCCESS&days=7"
            className="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
          >
            <Activity className="w-3 h-3 mr-1" />
            Logins Recentes
          </Link>

          <Link
            to="/events?type=ACCESS_DASHBOARD&days=7"
            className="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
          >
            <Eye className="w-3 h-3 mr-1" />
            Acessos Dashboard
          </Link>

          <Link
            to="/events?type=PROFILE_ACCESS&days=30"
            className="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
          >
            <User className="w-3 h-3 mr-1" />
            Acessos Perfil
          </Link>

          <Link
            to="/events?type=NOTIFICATIONS_ACCESS&days=30"
            className="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors"
          >
            <Filter className="w-3 h-3 mr-1" />
            Acessos Notificações
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

export default FilterBar
