import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity,
  Users,
  Eye,
  Calendar,
  TrendingUp,
  Clock,
  AlertCircle,
  Filter,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  LogIn,
  LogOut,
  UserCheck,
  Shield,
  Bell
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface DashboardStats {
  totalEvents: number;
  todayEvents: number;
  last7DaysEvents: number;
  last30DaysEvents: number;
  loginEvents: number;
  dashboardEvents: number;
  eventsPerDay: {
    last7DaysAvg: string;
    last30DaysAvg: string;
  };
}

interface Event {
  id: string;
  type: string;
  message: string;
  createdAt: string;
  ip?: string;
  userAgent?: string;
  metadata?: any;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentEvents, setRecentEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d');
  const { user } = useAuth();
  const navigate = useNavigate();

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      // Carregar estatísticas
      const statsResponse = await axios.get(`${API_URL}/api/events/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Carregar eventos recentes
      const eventsResponse = await axios.get(`${API_URL}/api/events/recent?limit=5`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (statsResponse.data.success) {
        setStats(statsResponse.data);
      }

      if (eventsResponse.data.success) {
        setRecentEvents(eventsResponse.data.events);
      }
    } catch (error: any) {
      console.error('Erro ao carregar dashboard:', error);
      if (error.code === 'ERR_NETWORK') {
        setError('Não foi possível conectar ao servidor. Verifique sua conexão ou tente novamente mais tarde.');
      } else {
        setError(error.response?.data?.error || 'Erro ao carregar dados');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Função para traduzir tipos de eventos
  const translateEventType = (type: string): string => {
    const translations: Record<string, string> = {
      // Autenticação
      'LOGIN_SUCCESS': 'Login Realizado',
      'LOGIN_FAILED': 'Falha no Login',
      'LOGOUT': 'Logout Realizado',
      'USER_REGISTERED': 'Usuário Registrado',
      'AUTH_LOGIN_SUCCESS': 'Login Bem-sucedido',
      'AUTH_REGISTER': 'Registro de Conta',

      // Acesso
      'ACCESS_DASHBOARD': 'Acesso ao Dashboard',
      'DASHBOARD_ACCESS': 'Acesso ao Dashboard',
      'PROFILE_ACCESS': 'Acesso ao Perfil',
      'NOTIFICATIONS_ACCESS': 'Acesso a Notificações',

      // Perfil
      'PROFILE_UPDATE': 'Perfil Atualizado',
      'PASSWORD_CHANGE': 'Senha Alterada',
      'PROFILE_PICTURE_UPDATE': 'Foto Atualizada',
      'CREDENTIALS_UPDATE': 'Credenciais Atualizadas',

      // Notificações
      'NOTIFICATION_CREATED': 'Notificação Criada',
      'NOTIFICATION_UPDATED': 'Notificação Atualizada',
      'NOTIFICATION_DELETED': 'Notificação Excluída',
      'NOTIFICATIONS_MARK_ALL_READ': 'Marcar Todas como Lidas',

      // Sistema
      'SYSTEM_ERROR': 'Erro do Sistema',
      'ERROR': 'Erro',
      'SYSTEM_EVENT': 'Evento do Sistema',
      'HEALTH_CHECK': 'Verificação de Saúde',

      // Segurança
      'ACCOUNT_DELETED': 'Conta Excluída',
      'ACCOUNT_DELETE_FAILED': 'Falha ao Excluir Conta',
      'PASSWORD_CHANGE_FAILED': 'Falha ao Alterar Senha'
    };

    return translations[type] || type.replace(/_/g, ' ');
  };

  // Função para extrair mensagem limpa
  const getCleanMessage = (message: string): string => {
    // Remove prefixos repetitivos
    const cleanMessage = message
      .replace('Notificação criada: ', '')
      .replace('Login realizado com sucesso', 'Sessão iniciada')
      .replace('Usuário acessou o dashboard', 'Dashboard acessado')
      .replace('Usuário acessou p?gina de perfil', 'Perfil visualizado');

    return cleanMessage;
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'LOGIN_SUCCESS':
      case 'USER_REGISTERED':
      case 'AUTH_LOGIN_SUCCESS':
      case 'AUTH_REGISTER':
        return 'text-green-600 bg-green-50 border border-green-100';
      case 'LOGIN_FAILED':
      case 'ERROR':
      case 'SYSTEM_ERROR':
      case 'ACCOUNT_DELETE_FAILED':
        return 'text-red-600 bg-red-50 border border-red-100';
      case 'ACCESS_DASHBOARD':
      case 'DASHBOARD_ACCESS':
      case 'PROFILE_ACCESS':
      case 'NOTIFICATIONS_ACCESS':
        return 'text-blue-600 bg-blue-50 border border-blue-100';
      case 'LOGOUT':
      case 'PASSWORD_CHANGE':
        return 'text-amber-600 bg-amber-50 border border-amber-100';
      case 'PROFILE_UPDATE':
      case 'PROFILE_PICTURE_UPDATE':
      case 'CREDENTIALS_UPDATE':
        return 'text-purple-600 bg-purple-50 border border-purple-100';
      case 'NOTIFICATION_CREATED':
      case 'NOTIFICATION_UPDATED':
        return 'text-indigo-600 bg-indigo-50 border border-indigo-100';
      default:
        return 'text-gray-600 bg-gray-50 border border-gray-100';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'LOGIN_SUCCESS':
      case 'AUTH_LOGIN_SUCCESS':
        return <LogIn className="w-4 h-4" />;
      case 'LOGOUT':
        return <LogOut className="w-4 h-4" />;
      case 'USER_REGISTERED':
      case 'AUTH_REGISTER':
        return <UserCheck className="w-4 h-4" />;
      case 'LOGIN_FAILED':
      case 'ERROR':
      case 'SYSTEM_ERROR':
        return <AlertCircle className="w-4 h-4" />;
      case 'ACCESS_DASHBOARD':
      case 'DASHBOARD_ACCESS':
        return <Eye className="w-4 h-4" />;
      case 'PROFILE_ACCESS':
      case 'PROFILE_UPDATE':
        return <Users className="w-4 h-4" />;
      case 'NOTIFICATION_CREATED':
      case 'NOTIFICATIONS_ACCESS':
        return <Bell className="w-4 h-4" />;
      case 'PASSWORD_CHANGE':
      case 'CREDENTIALS_UPDATE':
        return <Shield className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? 's' : ''} atrás`;
    } else if (diffHours < 24) {
      return `${diffHours} hora${diffHours !== 1 ? 's' : ''} atrás`;
    } else if (diffDays < 7) {
      return `${diffDays} dia${diffDays !== 1 ? 's' : ''} atrás`;
    } else {
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date);
    }
  };

  const getDeviceInfo = (userAgent?: string) => {
    if (!userAgent) return 'Dispositivo desconhecido';

    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Macintosh') || userAgent.includes('Mac OS')) return 'Mac';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS';

    return 'Navegador';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-2">
                Bem-vindo, <span className="font-semibold">{user?.name}</span>!
                Aqui está o resumo das suas atividades.
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={loadDashboardData}
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </button>
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Eventos</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.totalEvents?.toLocaleString() || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-blue-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>Atividade registrada</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Logins Hoje</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.todayEvents || 0}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <Clock className="w-4 h-4 inline mr-1" />
              <span>Últimas 24 horas</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Acessos Dashboard</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.dashboardEvents || 0}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Eye className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-purple-600">
              <span>Monitoramento ativo</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Últimos 7 Dias</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.last7DaysEvents || 0}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <span>Média: {stats?.eventsPerDay?.last7DaysAvg || '0'}/dia</span>
            </div>
          </motion.div>
        </div>

        {/* Charts and Recent Events */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Visão Geral</h2>
                  <p className="text-gray-600">Estatísticas de eventos</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setTimeRange('7d')}
                    className={`px-4 py-2 rounded-lg transition ${timeRange === '7d' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    7 Dias
                  </button>
                  <button
                    onClick={() => setTimeRange('30d')}
                    className={`px-4 py-2 rounded-lg transition ${timeRange === '30d' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    30 Dias
                  </button>
                </div>
              </div>

              {/* Placeholder para gráfico */}
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Gráfico de eventos em desenvolvimento</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {timeRange === '7d' ? 'Últimos 7 dias' : 'Últimos 30 dias'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Resumo Rápido</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Total Logins</span>
                <span className="font-bold text-blue-600">{stats?.loginEvents || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Últimos 30 Dias</span>
                <span className="font-bold text-green-600">{stats?.last30DaysEvents || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Média Diária</span>
                <span className="font-bold text-purple-600">{stats?.eventsPerDay?.last30DaysAvg || '0'}/dia</span>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="font-medium text-gray-900 mb-4">Distribuição</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Logins</span>
                    <span>{stats?.loginEvents || 0}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${((stats?.loginEvents || 0) / (stats?.totalEvents || 1)) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Acessos</span>
                    <span>{stats?.dashboardEvents || 0}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${((stats?.dashboardEvents || 0) / (stats?.totalEvents || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Events */}
        <div className="mt-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Atividades Recentes</h2>
                <p className="text-gray-600">Últimas interações no sistema</p>
              </div>
              <Link
                to="/events"
                className="flex items-center text-blue-600 hover:text-blue-700 font-medium transition"
              >
                Ver histórico completo
                <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className="space-y-4">
              {recentEvents.length > 0 ? (
                recentEvents.map((event, index) => {
                  const eventType = translateEventType(event.type);
                  const cleanMessage = getCleanMessage(event.message);
                  const deviceInfo = getDeviceInfo(event.userAgent);
                  const hasIp = event.ip && event.ip !== 'unknown' && event.ip !== '127.0.0.1';

                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-start justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition group"
                    >
                      <div className="flex items-start space-x-4">
                        <div className={`p-2 rounded-lg ${getEventColor(event.type)}`}>
                          {getEventIcon(event.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-gray-900">{eventType}</span>
                            <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full">
                              {deviceInfo}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{cleanMessage}</p>
                          <div className="flex items-center mt-2 space-x-4 text-xs text-gray-500">
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {formatDate(event.createdAt)}
                            </span>
                            {hasIp && (
                              <span className="flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                                {event.ip}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/events/${event.id}`)}
                        className="opacity-0 group-hover:opacity-100 text-blue-600 hover:text-blue-700 transition"
                        title="Ver detalhes"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </motion.div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma atividade recente</p>
                  <p className="text-sm mt-1">As atividades aparecerão aqui quando você usar o sistema</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-bold text-gray-900 mb-4">Ações Rápidas</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/profile')}
                className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition group"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Meu Perfil</p>
                    <p className="text-sm text-gray-600">Editar informações pessoais</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>

              <button
                onClick={() => navigate('/events')}
                className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition group"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-gray-100 rounded-lg mr-3">
                    <Activity className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Histórico Completo</p>
                    <p className="text-sm text-gray-600">Ver todos os eventos</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>

              <button
                onClick={() => navigate('/notifications')}
                className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition group"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg mr-3">
                    <Bell className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Notificações</p>
                    <p className="text-sm text-gray-600">Ver alertas do sistema</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            </div>
          </div>

          <div className="md:col-span-2 bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-bold text-gray-900 mb-4">Sistema EventFlow</h3>
            <p className="text-gray-600 mb-4">
              Bem-vindo ao seu painel de monitoramento de eventos. Aqui você pode acompanhar todas as atividades do sistema, desde logins até acessos ao dashboard.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Monitoramento</h4>
                <p className="text-sm text-blue-700">
                  Todas as atividades são registradas e auditadas em tempo real.
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Segurança</h4>
                <p className="text-sm text-green-700">
                  Sistema protegido com autenticação JWT e logs de auditoria.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
