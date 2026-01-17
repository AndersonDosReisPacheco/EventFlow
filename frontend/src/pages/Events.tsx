import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Filter,
  Calendar,
  Search,
  Download,
  RefreshCw,
  Eye,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  X,
  Clock,
  User,
  Globe,
  Smartphone,
  Server
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';

interface Event {
  id: string;
  type: string;
  message: string;
  createdAt: string;
  ip?: string;
  userAgent?: string;
  metadata?: any;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const Events: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventTypes, setEventTypes] = useState<string[]>([]);

  const loadEvents = async (page = 1) => {
    try {
      setLoading(true);

      const params: any = {
        page,
        limit: pagination.limit
      };

      if (search) params.search = search;
      if (typeFilter) params.type = typeFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await api.get('/events', { params });

      if (response.data.success) {
        setEvents(response.data.events);
        setPagination(response.data.pagination);
      }
    } catch (error: any) {
      console.error('Erro ao carregar eventos:', error);
      toast.error('Erro ao carregar eventos');
    } finally {
      setLoading(false);
    }
  };

  const loadEventTypes = async () => {
    try {
      const response = await api.get('/events/types');
      if (response.data.success) {
        setEventTypes(response.data.eventTypes.map((et: any) => et.type));
      }
    } catch (error) {
      console.error('Erro ao carregar tipos de eventos:', error);
    }
  };

  useEffect(() => {
    loadEvents();
    loadEventTypes();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadEvents(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setTypeFilter('');
    setStartDate('');
    setEndDate('');
    loadEvents(1);
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/events', {
        params: { limit: 1000 }
      });

      if (response.data.success) {
        const csvData = response.data.events.map((event: Event) => ({
          Tipo: event.type,
          Mensagem: event.message,
          Data: new Date(event.createdAt).toLocaleString('pt-BR'),
          IP: event.ip || 'N/A',
          'User Agent': event.userAgent || 'N/A'
        }));

        const csv = convertToCSV(csvData);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `eventos-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        toast.success('Eventos exportados com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao exportar eventos:', error);
      toast.error('Erro ao exportar eventos');
    }
  };

  const convertToCSV = (data: any[]) => {
    const headers = Object.keys(data[0] || {});
    const rows = data.map(row =>
      headers.map(header => {
        const value = row[header];
        return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
      }).join(',')
    );
    return [headers.join(','), ...rows].join('\n');
  };

  const getEventColor = (type: string) => {
    if (type.includes('SUCCESS') || type.includes('REGISTERED'))
      return 'bg-green-100 text-green-800 border-green-200';
    if (type.includes('FAILED') || type.includes('ERROR'))
      return 'bg-red-100 text-red-800 border-red-200';
    if (type.includes('ACCESS') || type.includes('LOGIN'))
      return 'bg-blue-100 text-blue-800 border-blue-200';
    if (type.includes('PROFILE') || type.includes('UPDATE'))
      return 'bg-purple-100 text-purple-800 border-purple-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getEventIcon = (type: string) => {
    if (type.includes('LOGIN')) return <User className="w-4 h-4" />;
    if (type.includes('ACCESS')) return <Eye className="w-4 h-4" />;
    if (type.includes('PROFILE')) return <User className="w-4 h-4" />;
    if (type.includes('ERROR')) return <AlertCircle className="w-4 h-4" />;
    return <Server className="w-4 h-4" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getDeviceIcon = (userAgent?: string) => {
    if (!userAgent) return <Server className="w-4 h-4" />;
    if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone'))
      return <Smartphone className="w-4 h-4" />;
    return <Globe className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Eventos</h1>
              <p className="text-gray-600 mt-2">
                Histórico completo de todas as atividades do sistema
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleExport}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div className="flex items-center">
              <Filter className="w-5 h-5 text-gray-500 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
            >
              {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
              {showFilters ? <X className="w-4 h-4 ml-1" /> : <Filter className="w-4 h-4 ml-1" />}
            </button>
          </div>

          <form onSubmit={handleSearch} className="space-y-4">
            {/* Barra de busca */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Buscar eventos por mensagem ou tipo..."
              />
            </div>

            {/* Filtros avançados */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4 pt-4 border-t border-gray-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Tipo de evento */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Evento
                    </label>
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Todos os tipos</option>
                      {eventTypes.map((type) => (
                        <option key={type} value={type}>
                          {type.replace(/_/g, ' ')}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Período */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Período
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <span className="self-center text-gray-500">até</span>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Aplicar Filtros
                  </button>
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Limpar
                  </button>
                </div>
              </motion.div>
            )}

            {/* Botões de ação */}
            {!showFilters && (
              <div className="flex space-x-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Buscar
                </button>
                <button
                  type="button"
                  onClick={() => setShowFilters(true)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Filtros Avançados
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Lista de Eventos */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header da tabela */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Histórico de Eventos
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {pagination.total} eventos encontrados
                </p>
              </div>
              <button
                onClick={() => loadEvents(pagination.page)}
                disabled={loading}
                className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Tabela de eventos */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-12 text-center">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-3" />
                <p className="text-gray-600">Carregando eventos...</p>
              </div>
            ) : events.length === 0 ? (
              <div className="py-16 text-center">
                <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum evento encontrado
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  {search || typeFilter || startDate || endDate
                    ? 'Tente ajustar seus filtros de busca'
                    : 'Realize alguma atividade para ver eventos aqui'}
                </p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mensagem
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IP
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dispositivo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {events.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getEventColor(event.type)}`}>
                          {getEventIcon(event.type)}
                          <span className="ml-2">{event.type.replace(/_/g, ' ')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-md">
                        <div className="text-sm text-gray-900 truncate">
                          {event.message}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Clock className="w-4 h-4 mr-2 text-gray-400" />
                          {formatDate(event.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-mono">
                          {event.ip || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          {getDeviceIcon(event.userAgent)}
                          <span className="ml-2 truncate max-w-xs">
                            {event.userAgent ?
                              (event.userAgent.length > 50 ?
                                `${event.userAgent.substring(0, 50)}...` :
                                event.userAgent) :
                              'Desconhecido'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setSelectedEvent(event)}
                          className="text-blue-600 hover:text-blue-900 flex items-center"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Detalhes
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Paginação */}
          {pagination.pages > 1 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Página <span className="font-medium">{pagination.page}</span> de{' '}
                  <span className="font-medium">{pagination.pages}</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => loadEvents(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Anterior
                  </button>
                  <button
                    onClick={() => loadEvents(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Próxima
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de detalhes do evento */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Detalhes do Evento
                  </h3>
                  <p className="text-gray-600 mt-1">Informações completas</p>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Tipo do evento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo do Evento
                  </label>
                  <div className={`inline-flex items-center px-4 py-2 rounded-lg ${getEventColor(selectedEvent.type)}`}>
                    {getEventIcon(selectedEvent.type)}
                    <span className="ml-2 font-medium">{selectedEvent.type.replace(/_/g, ' ')}</span>
                  </div>
                </div>

                {/* Mensagem */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mensagem
                  </label>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-gray-800">{selectedEvent.message}</p>
                  </div>
                </div>

                {/* Data e hora */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data e Hora
                  </label>
                  <div className="flex items-center text-gray-900">
                    <Calendar className="w-5 h-5 mr-2 text-gray-400" />
                    {formatDate(selectedEvent.createdAt)}
                  </div>
                </div>

                {/* Informações de rede */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Endereço IP
                    </label>
                    <div className="font-mono bg-gray-50 p-3 rounded-lg border border-gray-200">
                      {selectedEvent.ip || 'Não disponível'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dispositivo
                    </label>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      {selectedEvent.userAgent || 'Não disponível'}
                    </div>
                  </div>
                </div>

                {/* Metadados */}
                {selectedEvent.metadata && Object.keys(selectedEvent.metadata).length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Metadados Adicionais
                    </label>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                        {JSON.stringify(selectedEvent.metadata, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Botões de ação */}
                <div className="flex justify-end pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Events;
