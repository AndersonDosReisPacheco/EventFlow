
import React, { useState } from 'react';
import { Search, Calendar, Filter, X } from 'lucide-react';

interface EventFiltersProps {
  filters: {
    type: string;
    search: string;
    startDate: string;
    endDate: string;
  };
  onFilterChange: (filters: any) => void;
  availableTypes: string[];
}

export const EventFilters: React.FC<EventFiltersProps> = ({
  filters,
  onFilterChange,
  availableTypes
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleChange = (field: string, value: string) => {
    onFilterChange({ [field]: value });
  };

  const clearFilters = () => {
    onFilterChange({
      type: '',
      search: '',
      startDate: '',
      endDate: ''
    });
  };

  const hasActiveFilters = filters.type || filters.search || filters.startDate || filters.endDate;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Busca */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Buscar eventos..."
              value={filters.search}
              onChange={(e) => handleChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        {/* Tipo */}
        <div className="w-full md:w-48">
          <select
            value={filters.type}
            onChange={(e) => handleChange('type', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Todos os tipos</option>
            {availableTypes.map((type) => (
              <option key={type} value={type}>
                {type.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        {/* Botões */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <Filter className="h-5 w-5" />
            Filtros
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <X className="h-5 w-5" />
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Filtros avançados */}
      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Data inicial
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Data final
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleChange('endDate', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Filtros rápidos */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Período rápido:
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Hoje', days: 0 },
                { label: 'Últimos 7 dias', days: 7 },
                { label: 'Últimos 15 dias', days: 15 },
                { label: 'Últimos 30 dias', days: 30 }
              ].map((period) => (
                <button
                  key={period.label}
                  onClick={() => {
                    const end = new Date();
                    const start = new Date();
                    start.setDate(start.getDate() - period.days);

                    onFilterChange({
                      startDate: period.days > 0 ? start.toISOString().split('T')[0] : '',
                      endDate: end.toISOString().split('T')[0]
                    });
                  }}
                  className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
