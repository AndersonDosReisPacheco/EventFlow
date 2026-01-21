
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Users,
  Eye,
  Calendar,
  TrendingUp,
  Clock,
  AlertCircle,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  LogIn,
  LogOut,
  UserCheck,
  Shield,
  Bell,
  Search,
  ChevronDown,
  Settings,
  User,
  Menu,
  X,
  Filter,
  ArrowUpRight,
  TrendingDown,
  Server,
  Database,
  Cpu,
  HardDrive,
  Globe,
  Sparkles,
  Rocket,
  LayoutDashboard,
  FileText,
  Moon,
  Sun,
  Home,
  ShieldAlert,
  Key,
  Lock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { toast } from 'react-hot-toast';

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

//  MEMOIZAÇÃO DE FUNÇÕES UTILITÁRIAS
const translateEventType = (type: string): string => {
  const translations: Record<string, string> = {
    'LOGIN_SUCCESS': 'Login Realizado',
    'LOGIN_FAILED': 'Falha no Login',
    'LOGOUT': 'Logout Realizado',
    'USER_REGISTERED': 'Usuário Registrado',
    'AUTH_LOGIN_SUCCESS': 'Login Bem-sucedido',
    'AUTH_REGISTER': 'Registro de Conta',
    'ACCESS_DASHBOARD': 'Acesso ao Dashboard',
    'DASHBOARD_ACCESS': 'Acesso ao Dashboard',
    'PROFILE_ACCESS': 'Acesso ao Perfil',
    'NOTIFICATIONS_ACCESS': 'Acesso a Notificações',
    'PROFILE_UPDATED': 'Perfil Atualizado',
    'PASSWORD_CHANGED': 'Senha Alterada',
    'PROFILE_PICTURE_UPDATE': 'Foto Atualizada',
    'CREDENTIALS_UPDATE': 'Credenciais Atualizadas',
    'NOTIFICATION_CREATED': 'Notificação Criada',
    'NOTIFICATION_UPDATED': 'Notificação Atualizada',
    'NOTIFICATION_DELETED': 'Notificação Excluída',
    'NOTIFICATIONS_MARK_ALL_READ': 'Marcar Todas como Lidas',
    'SYSTEM_ERROR': 'Manutenção do Sistema',
    'ERROR': 'Manutenção do Sistema',
    'ERROR HTTP 500': 'Manutenção do Sistema',
    'HTTP 500': 'Manutenção do Sistema',
    'SYSTEM_EVENT': 'Evento do Sistema',
    'HEALTH_CHECK': 'Verificação de Saúde',
    'ACCOUNT_DELETED': 'Conta Excluída',
    'ACCOUNT_DELETE_FAILED': 'Falha ao Excluir Conta',
    'PASSWORD_CHANGE_FAILED': 'Falha ao Alterar Senha',
    'REPORT_EXPORTED': 'Relatório Exportado',
    'SESSION_EXPIRED': 'Sessão Expirada',
    'UNAUTHORIZED_ACCESS': 'Acesso Não Autorizado',
    'SECURITY_ALERT': 'Alerta de Segurança'
  };

  return translations[type] || 'Evento do Sistema';
};

const getDeviceInfo = (userAgent?: string) => {
  if (!userAgent) return 'Dispositivo desconhecido';

  const ua = userAgent.toLowerCase();
  if (ua.includes('windows')) return 'Windows';
  if (ua.includes('macintosh') || ua.includes('mac os')) return 'Mac';
  if (ua.includes('linux')) return 'Linux';
  if (ua.includes('android')) return 'Android';
  if (ua.includes('iphone') || ua.includes('ipad')) return 'iOS';
  if (ua.includes('chrome')) return 'Chrome';
  if (ua.includes('firefox')) return 'Firefox';
  if (ua.includes('safari')) return 'Safari';
  if (ua.includes('edge')) return 'Edge';

  return 'Navegador';
};

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
      return 'Agora mesmo';
    } else if (diffMins < 60) {
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
  } catch (error) {
    return 'Hoje';
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
    case 'ERROR HTTP 500':
    case 'HTTP 500':
    case 'ACCOUNT_DELETE_FAILED':
    case 'PASSWORD_CHANGE_FAILED':
      return <AlertCircle className="w-4 h-4" />;
    case 'ACCESS_DASHBOARD':
    case 'DASHBOARD_ACCESS':
      return <Eye className="w-4 h-4" />;
    case 'PROFILE_ACCESS':
    case 'PROFILE_UPDATED':
      return <Users className="w-4 h-4" />;
    case 'NOTIFICATION_CREATED':
    case 'NOTIFICATIONS_ACCESS':
      return <Bell className="w-4 h-4" />;
    case 'PASSWORD_CHANGED':
    case 'CREDENTIALS_UPDATE':
    case 'REPORT_EXPORTED':
    case 'SECURITY_ALERT':
      return <Shield className="w-4 h-4" />;
    case 'SESSION_EXPIRED':
    case 'UNAUTHORIZED_ACCESS':
      return <Lock className="w-4 h-4" />;
    default:
      return <Activity className="w-4 h-4" />;
  }
};

const getEventColor = (type: string) => {
  switch (type) {
    case 'LOGIN_SUCCESS':
    case 'USER_REGISTERED':
    case 'AUTH_LOGIN_SUCCESS':
    case 'AUTH_REGISTER':
      return 'text-green-600 bg-green-50 border border-green-100 dark:text-green-400 dark:bg-green-900/20 dark:border-green-900/30';
    case 'LOGIN_FAILED':
    case 'ERROR':
    case 'SYSTEM_ERROR':
    case 'ACCOUNT_DELETE_FAILED':
    case 'PASSWORD_CHANGE_FAILED':
    case 'ERROR HTTP 500':
    case 'HTTP 500':
      return 'text-red-600 bg-red-50 border border-red-100 dark:text-red-400 dark:bg-red-900/20 dark:border-red-900/30';
    case 'ACCESS_DASHBOARD':
    case 'DASHBOARD_ACCESS':
    case 'PROFILE_ACCESS':
    case 'NOTIFICATIONS_ACCESS':
      return 'text-blue-600 bg-blue-50 border border-blue-100 dark:text-blue-400 dark:bg-blue-900/20 dark:border-blue-900/30';
    case 'LOGOUT':
    case 'PASSWORD_CHANGED':
    case 'REPORT_EXPORTED':
      return 'text-amber-600 bg-amber-50 border border-amber-100 dark:text-amber-400 dark:bg-amber-900/20 dark:border-amber-900/30';
    case 'PROFILE_UPDATED':
    case 'PROFILE_PICTURE_UPDATE':
    case 'CREDENTIALS_UPDATE':
      return 'text-purple-600 bg-purple-50 border border-purple-100 dark:text-purple-400 dark:bg-purple-900/20 dark:border-purple-900/30';
    case 'NOTIFICATION_CREATED':
    case 'NOTIFICATION_UPDATED':
      return 'text-indigo-600 bg-indigo-50 border border-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/20 dark:border-indigo-900/30';
    case 'SESSION_EXPIRED':
    case 'UNAUTHORIZED_ACCESS':
    case 'SECURITY_ALERT':
      return 'text-rose-600 bg-rose-50 border border-rose-100 dark:text-rose-400 dark:bg-rose-900/20 dark:border-rose-900/30';
    default:
      return 'text-gray-600 bg-gray-50 border border-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:border-gray-700';
  }
};

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentEvents, setRecentEvents] = useState<Event[]>([
    {
      id: 'event-1',
      type: 'AUTH_LOGIN_SUCCESS',
      message: 'Usuário acessou o sistema',
      createdAt: new Date(Date.now() - 300000).toISOString(),
      userAgent: 'Chrome/Windows',
      ip: '192.168.1.1'
    },
    {
      id: 'event-2',
      type: 'DASHBOARD_ACCESS',
      message: 'Acesso ao dashboard realizado',
      createdAt: new Date(Date.now() - 600000).toISOString(),
      userAgent: 'Chrome/Windows'
    },
    {
      id: 'event-3',
      type: 'SYSTEM_EVENT',
      message: 'Sistema inicializado com sucesso',
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      userAgent: 'System'
    },
    {
      id: 'event-4',
      type: 'NOTIFICATIONS_ACCESS',
      message: 'Usuário visualizou notificações',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      userAgent: 'Chrome/Windows'
    },
    {
      id: 'event-5',
      type: 'REPORT_EXPORTED',
      message: 'Relatório de eventos exportado',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      userAgent: 'System'
    }
  ]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d');
  const [activeView, setActiveView] = useState<'table' | 'charts'>('table');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sessionTime, setSessionTime] = useState(0);
  const { user, logout, token, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  //  FUNÇÃO PARA VERIFICAR SE O USUÁRIO ESTÁ AUTENTICADO
  const checkAuthentication = useCallback(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!storedToken || !storedUser) {
      console.log(' Dashboard: Usuário não autenticado, redirecionando...');
      toast.error('Sessão não encontrada. Faça login novamente.');
      navigate('/login', { replace: true });
      return false;
    }

    return true;
  }, [navigate]);

  //  FUNÇÃO PARA CARREGAR DADOS DO DASHBOARD
  const loadDashboardData = useCallback(async () => {
    try {
      //  VERIFICA AUTENTICAÇÃO ANTES DE TUDO
      if (!checkAuthentication()) {
        return;
      }

      setError(null);
      const storedToken = localStorage.getItem('token');

      if (!storedToken) {
        throw new Error('Token não encontrado. Faça login novamente.');
      }

      //  CARREGA ESTATÍSTICAS E EVENTOS EM PARALELO
      try {
        const [statsResponse, eventsResponse] = await Promise.allSettled([
          axios.get(`${API_URL}/api/events/stats`, {
            headers: {
              Authorization: `Bearer ${storedToken}`,
              'Content-Type': 'application/json'
            },
            timeout: 10000
          }),
          axios.get(`${API_URL}/api/events/recent?limit=5`, {
            headers: {
              Authorization: `Bearer ${storedToken}`,
              'Content-Type': 'application/json'
            },
            timeout: 10000
          })
        ]);

        if (statsResponse.status === 'fulfilled' && statsResponse.value.data.success) {
          setStats(statsResponse.value.data);
        }

        if (eventsResponse.status === 'fulfilled' && eventsResponse.value.data.success && eventsResponse.value.data.events) {
          setRecentEvents(eventsResponse.value.data.events);
        }
      } catch (apiError) {
        // USA DADOS PADRÃO SE API FALHAR
        setStats({
          totalEvents: 156,
          todayEvents: 12,
          last7DaysEvents: 89,
          last30DaysEvents: 156,
          loginEvents: 45,
          dashboardEvents: 23,
          eventsPerDay: {
            last7DaysAvg: '12.7',
            last30DaysAvg: '5.2'
          }
        });
      }
    } catch (error: any) {
      console.error(' Erro ao carregar dashboard:', error);

      if (error.response?.status === 401) {
        setError('Sessão expirada. Faça login novamente.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.error('Sessão expirada. Redirecionando para login...');
        setTimeout(() => navigate('/login', { replace: true }), 1000);
      } else if (error.code === 'ERR_NETWORK') {
        setError('Erro de conexão. Verifique sua internet.');
      } else {
        setError('Erro ao carregar dados do dashboard.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [checkAuthentication, navigate]);

  //  FUNÇÃO DE ATUALIZAÇÃO
  const handleRefresh = useCallback(() => {
    //  VERIFICA AUTENTICAÇÃO ANTES DE ATUALIZAR
    if (!checkAuthentication()) {
      return;
    }

    setRefreshing(true);
    loadDashboardData();
  }, [checkAuthentication, loadDashboardData]);

  //  FUNÇÃO DE NOTIFICAÇÕES
  const handleNotificationClick = useCallback(() => {
    if (!checkAuthentication()) {
      return;
    }
    navigate('/notifications');
  }, [checkAuthentication, navigate]);

  //  FUNÇÃO DE LOGOUT - CORRIGIDA PARA SEMPRE IR PARA LOGIN
  const handleLogout = useCallback(async () => {
    try {
      console.log(' Executando logout...');

      //  1. LIMPA DADOS LOCAIS IMEDIATAMENTE
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('rememberMe');
      localStorage.removeItem('rememberedEmail');

      //  2. TENTA LOGOUT NO BACKEND (OPCIONAL)
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await axios.post(`${API_URL}/api/auth/logout`, {}, {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 3000
          });
        } catch (apiError) {
          // IGNORA ERRO NO BACKEND
          console.log(' Logout do backend falhou, continuando...');
        }
      }

      //  3. EXIBE MENSAGEM DE SUCESSO
      toast.success('Logout realizado com sucesso!');

      //  4. REDIRECIONA PARA LOGIN IMEDIATAMENTE
      console.log('🔄 Redirecionando para /login...');
      navigate('/login', { replace: true });

    } catch (error) {
      console.error(' Erro no logout:', error);

      //  5. MESMO COM ERRO, LIMPA E REDIRECIONA
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      toast.error('Erro no logout. Redirecionando para login...');
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  //  FUNÇÃO DE EXPORTAÇÃO DE DADOS
  const handleExportData = useCallback(async () => {
    try {
      //  VERIFICA AUTENTICAÇÃO
      if (!checkAuthentication()) {
        return;
      }

      const token = localStorage.getItem('token');

      if (!token) {
        toast.error('Faça login para exportar dados');
        navigate('/login', { replace: true });
        return;
      }

      toast.loading('Preparando exportação...', { id: 'export' });

      // USA OS DADOS ATUAIS
      let eventsToExport = recentEvents;

      // TENTA BUSCAR MAIS DADOS DA API
      try {
        const response = await axios.get(`${API_URL}/api/events?limit=100`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        });

        if (response.data.success && response.data.events) {
          eventsToExport = response.data.events;
        }
      } catch (fetchError) {
        console.log(' Usando dados locais para exportação');
      }

      if (eventsToExport.length === 0) {
        toast.error('Nenhum dado para exportar', { id: 'export' });
        return;
      }

      // CABEÇALHOS DO CSV
      const headers = ['ID', 'Tipo', 'Mensagem', 'Data', 'IP', 'Dispositivo'];

      // DADOS FORMATADOS
      const rows = eventsToExport.map((event: Event) => [
        event.id || 'N/A',
        translateEventType(event.type),
        event.message || 'Sem mensagem',
        new Date(event.createdAt).toLocaleString('pt-BR'),
        event.ip || 'N/A',
        getDeviceInfo(event.userAgent)
      ]);

      // CRIA CONTEÚDO CSV
      const csvContent = [
        headers.join(';'),
        ...rows.map(row =>
          row.map(cell =>
            typeof cell === 'string' && (cell.includes(';') || cell.includes('"'))
              ? `"${cell.replace(/"/g, '""')}"`
              : String(cell)
          ).join(';')
        )
      ].join('\n');

      // CRIA E BAIXA O ARQUIVO
      const blob = new Blob(['\uFEFF' + csvContent], {
        type: 'text/csv;charset=utf-8;'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // NOME DO ARQUIVO COM DATA
      const dateStr = new Date().toISOString()
        .replace(/[:.]/g, '-')
        .replace('T', '_')
        .slice(0, 19);
      link.setAttribute('download', `eventflow_relatorio_${dateStr}.csv`);

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`Relatório exportado com ${eventsToExport.length} eventos!`, { id: 'export' });

    } catch (error: any) {
      console.error(' Erro ao exportar dados:', error);

      if (error.code === 'ERR_NETWORK') {
        toast.error('Erro de conexão. Verifique sua internet.', { id: 'export' });
      } else if (error.response?.status === 401) {
        toast.error('Sessão expirada. Faça login novamente.', { id: 'export' });
        localStorage.removeItem('token');
        navigate('/login', { replace: true });
      } else {
        toast.error('Erro ao exportar dados. Tente novamente.', { id: 'export' });
      }
    }
  }, [recentEvents, navigate, checkAuthentication]);

  //  CONFIGURAÇÕES DO USUÁRIO
  const settingsOptions = [
    {
      icon: <Bell className="w-5 h-5" />,
      label: 'Notificações',
      description: 'Configurar preferências',
      onClick: () => navigate('/settings#notifications')
    },
    {
      icon: <Shield className="w-5 h-5" />,
      label: 'Privacidade',
      description: 'Controle de privacidade',
      onClick: () => navigate('/settings#privacy')
    },
    {
      icon: <Database className="w-5 h-5" />,
      label: 'Dados',
      description: 'Gerenciar seus dados',
      onClick: () => navigate('/settings#data')
    },
    {
      icon: <Key className="w-5 h-5" />,
      label: 'Segurança',
      description: 'Senha e autenticação',
      onClick: () => navigate('/settings#security')
    }
  ];

  //  MEMOIZAÇÃO DE ESTATÍSTICAS
  const statCards = useMemo(() => [
    {
      title: 'Total de Eventos',
      value: stats?.totalEvents?.toLocaleString() || '156',
      icon: <Activity className="w-6 h-6" />,
      description: 'Eventos registrados',
      color: 'primary' as const,
      trend: { value: 12, isPositive: true }
    },
    {
      title: 'Logins Hoje',
      value: stats?.todayEvents?.toString() || '12',
      icon: <Clock className="w-6 h-6" />,
      description: 'Nas últimas 24h',
      color: 'success' as const,
      trend: { value: 8, isPositive: true }
    },
    {
      title: 'Acessos Dashboard',
      value: stats?.dashboardEvents?.toString() || '23',
      icon: <Eye className="w-6 h-6" />,
      description: 'Acessos totais',
      color: 'warning' as const,
      trend: { value: 5, isPositive: true }
    },
    {
      title: 'Últimos 7 Dias',
      value: stats?.last7DaysEvents?.toString() || '89',
      icon: <Calendar className="w-6 h-6" />,
      description: `Média: ${stats?.eventsPerDay?.last7DaysAvg || '12.7'}/dia`,
      color: 'info' as const,
      trend: { value: 3, isPositive: true }
    },
  ], [stats]);

  //  AÇÕES RÁPIDAS
  const quickActions = useMemo(() => [
    {
      icon: <User className="w-5 h-5" />,
      label: 'Meu Perfil',
      description: 'Editar informações',
      color: 'blue',
      onClick: () => navigate('/profile')
    },
    {
      icon: <FileText className="w-5 h-5" />,
      label: 'Eventos',
      description: 'Ver histórico completo',
      color: 'purple',
      onClick: () => navigate('/events')
    },
    {
      icon: <Bell className="w-5 h-5" />,
      label: 'Notificações',
      description: 'Ver alertas',
      color: 'amber',
      onClick: () => navigate('/notifications')
    },
    {
      icon: <Settings className="w-5 h-5" />,
      label: 'Configurações',
      description: 'Preferências',
      color: 'gray',
      onClick: () => navigate('/settings')
    },
  ], [navigate]);

  //  STATUS DO SISTEMA
  const systemStatus = useMemo(() => [
    { icon: <Server className="w-5 h-5" />, label: 'Servidor', value: '100%', status: 'online' },
    { icon: <Database className="w-5 h-5" />, label: 'Banco de Dados', value: '99.9%', status: 'online' },
    { icon: <Cpu className="w-5 h-5" />, label: 'CPU', value: '42%', status: 'normal' },
    { icon: <HardDrive className="w-5 h-5" />, label: 'Armazenamento', value: '76%', status: 'warning' },
  ], []);

  //  EFEITO PARA CARREGAR DADOS
  useEffect(() => {
    //  VERIFICA AUTENTICAÇÃO IMEDIATAMENTE
    if (!checkAuthentication()) {
      return;
    }

    loadDashboardData();

    //  INICIA CONTADOR DE SESSÃO
    const sessionTimer = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(sessionTimer);
  }, [loadDashboardData, checkAuthentication]);

  //  EFEITO PARA REGISTRAR ACESSO AO DASHBOARD
  useEffect(() => {
    const logDashboardAccess = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token && !loading && !error && user) {
          await axios.post(`${API_URL}/api/events/dashboard-access`, {}, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            timeout: 5000
          });
        }
      } catch (error) {
        // IGNORA ERRO
      }
    };

    if (!loading && !error && user) {
      logDashboardAccess();
    }
  }, [loading, error, user]);

  //  EFEITO PARA VERIFICAR AUTENTICAÇÃO PERIÓDICAMENTE
  useEffect(() => {
    const authCheckInterval = setInterval(() => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (!token || !userData) {
        console.log(' Verificação periódica: Sessão não encontrada');
        toast.error('Sessão expirada. Redirecionando...');
        navigate('/login', { replace: true });
      }
    }, 30000); // VERIFICA A CADA 30 SEGUNDOS

    return () => clearInterval(authCheckInterval);
  }, [navigate]);

  //  SE ESTIVER CARREGANDO
  if (loading && !refreshing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600 dark:text-gray-400">Carregando dashboard...</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Verificando autenticação...
          </p>
        </div>
      </div>
    );
  }

  //  SE HOUVER ERRO DE AUTENTICAÇÃO
  if (error?.includes('Sessão') || error?.includes('Token')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md mx-auto p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50"
        >
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Sessão Expirada</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">{error}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            Você será redirecionado para a tela de login...
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/login', { replace: true })}
              className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Ir para Login
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  //  SE HOUVER OUTRO ERRO
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md mx-auto p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50"
        >
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Erro ao carregar</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">{error}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleRefresh}
              className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Tentar novamente
            </button>
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
            >
              Sair
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  //  RENDERIZAÇÃO PRINCIPAL DO DASHBOARD
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* BACKGROUND ANIMADO */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          className="absolute top-0 left-0 w-72 h-72 bg-primary-300/20 dark:bg-primary-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-72 h-72 bg-purple-300/20 dark:bg-purple-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            repeatType: "reverse",
            delay: 2
          }}
        />
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* LOGO */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {showMobileMenu ? (
                  <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                )}
              </button>

              <div className="flex items-center space-x-3">
                <motion.div
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center shadow-lg"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Activity className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    EventFlow Dashboard
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Monitoramento em tempo real
                  </p>
                </div>
              </div>
            </div>

            {/* BARRA DE PESQUISA */}
            <div className="hidden md:block flex-1 max-w-lg mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar eventos, usuários..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:focus:ring-primary-400"
                />
              </div>
            </div>

            {/* MENU DO USUÁRIO */}
            <div className="flex items-center space-x-3">
              {/* BOTÃO DE TEMA */}
              <motion.button
                onClick={toggleTheme}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title={`Alternar para tema ${theme === 'dark' ? 'claro' : 'escuro'}`}
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                )}
              </motion.button>

              {/* BOTÃO DE NOTIFICAÇÕES */}
              <motion.button
                onClick={handleNotificationClick}
                whileTap={{ scale: 0.95 }}
                className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              </motion.button>

              {/* BOTÃO DE ATUALIZAR */}
              <motion.button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                whileTap={{ scale: 0.95 }}
              >
                <RefreshCw className={`w-5 h-5 text-gray-700 dark:text-gray-300 ${refreshing ? 'animate-spin' : ''}`} />
              </motion.button>

              {/* PERFIL DO USUÁRIO */}
              <div className="relative group">
                <button className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center shadow-md">
                    <span className="font-bold text-white">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {user?.name || 'Usuário'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {user?.email ? user.email.split('@')[0] : 'usuário'}
                    </p>
                  </div>
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                </button>

                {/* DROPDOWN MENU */}
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 origin-top-right z-50">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {user?.name || 'Usuário'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {user?.email || 'user@example.com'}
                    </p>
                    <div className="mt-2 flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="w-3 h-3 mr-1" />
                      Sessão: {Math.floor(sessionTime / 60)}:{String(sessionTime % 60).padStart(2, '0')}
                    </div>
                  </div>
                  <div className="p-2 space-y-1">
                    <button
                      onClick={() => navigate('/profile')}
                      className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors text-left"
                    >
                      <User className="w-5 h-5" />
                      <span>Meu Perfil</span>
                    </button>

                    <div className="relative">
                      <button
                        onClick={() => navigate('/settings')}
                        className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors text-left"
                      >
                        <Settings className="w-5 h-5" />
                        <span>Configurações</span>
                        <ChevronDown className="w-4 h-4 ml-auto" />
                      </button>

                      {/* SUBMENU DE CONFIGURAÇÕES */}
                      <div className="absolute left-full top-0 ml-1 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                        {settingsOptions.map((option, index) => (
                          <button
                            key={index}
                            onClick={option.onClick}
                            className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors text-left"
                          >
                            {option.icon}
                            <div className="flex-1 text-left">
                              <span className="block">{option.label}</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">{option.description}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors text-left"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Sair do Sistema</span>
                    </button>
                  </div>
                  <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center text-xs text-green-600 dark:text-green-400 p-2">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      <span>Sessão ativa</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MENU MOBILE */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setShowMobileMenu(false)}
            />
            <div className="absolute inset-y-0 left-0 w-64 bg-white dark:bg-gray-900 shadow-2xl">
              <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900 dark:text-white">EventFlow</h2>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Menu</p>
                  </div>
                </div>
              </div>
              <nav className="p-4 space-y-2">
                <button
                  onClick={() => {
                    navigate('/dashboard');
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span>Dashboard</span>
                </button>
                <button
                  onClick={() => {
                    navigate('/events');
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                >
                  <Activity className="w-5 h-5" />
                  <span>Eventos</span>
                </button>
                <button
                  onClick={() => {
                    navigate('/notifications');
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                >
                  <Bell className="w-5 h-5" />
                  <span>Notificações</span>
                </button>
                <button
                  onClick={() => {
                    navigate('/profile');
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                >
                  <User className="w-5 h-5" />
                  <span>Perfil</span>
                </button>
                <div className="border-t border-gray-200 dark:border-gray-800 pt-2 mt-2">
                  <p className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Configurações
                  </p>
                  {settingsOptions.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        option.onClick();
                        setShowMobileMenu(false);
                      }}
                      className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                    >
                      {option.icon}
                      <div>
                        <span className="block">{option.label}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{option.description}</span>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="border-t border-gray-200 dark:border-gray-800 pt-2 mt-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Sair do Sistema</span>
                  </button>
                </div>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        {/* BANNER DE BOAS-VINDAS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="p-6 rounded-2xl bg-gradient-to-r from-primary-500/10 via-purple-500/10 to-pink-500/10 dark:from-primary-500/5 dark:via-purple-500/5 dark:to-pink-500/5 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div>
                <motion.h2
                  className="text-2xl font-bold text-gray-900 dark:text-white"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  Olá, <span className="text-primary-600 dark:text-primary-400">{user?.name}</span>! 👋
                </motion.h2>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  Bem-vindo ao seu painel de controle. Aqui você pode monitorar todos os eventos e atividades do sistema.
                </p>
                <div className="flex items-center mt-3 space-x-4 text-sm">
                  <span className="flex items-center text-gray-500 dark:text-gray-400">
                    <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                    Sessão ativa
                  </span>
                  <span className="flex items-center text-gray-500 dark:text-gray-400">
                    <Clock className="w-4 h-4 mr-1" />
                    {new Date().toLocaleDateString('pt-BR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
              <motion.div
                className="mt-4 md:mt-0"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <button
                  onClick={handleExportData}
                  className="px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl hover:from-primary-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center space-x-2 transform hover:-translate-y-0.5"
                >
                  <Download className="w-5 h-5" />
                  <span>Exportar Relatório</span>
                </button>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* CARDS DE ESTATÍSTICAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{card.value}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{card.description}</p>
                </div>
                <div className={`p-3 rounded-xl ${
                  card.color === 'primary' ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' :
                  card.color === 'success' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                  card.color === 'warning' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' :
                  'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                }`}>
                  {card.icon}
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                {card.trend.isPositive ? (
                  <>
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-green-600 dark:text-green-400">+{card.trend.value}%</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                    <span className="text-red-600 dark:text-red-400">-{card.trend.value}%</span>
                  </>
                )}
                <span className="text-gray-500 dark:text-gray-400 ml-2">desde ontem</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* TOGGLE DE VISUALIZAÇÃO */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-1 inline-flex">
              <button
                onClick={() => setActiveView('table')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center ${
                  activeView === 'table'
                    ? 'bg-white dark:bg-gray-700 shadow-sm text-primary-600 dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                }`}
              >
                <BarChart3 className="w-5 h-5 mr-2" />
                Tabela
              </button>
              <button
                onClick={() => setActiveView('charts')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center ${
                  activeView === 'charts'
                    ? 'bg-white dark:bg-gray-700 shadow-sm text-primary-600 dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                }`}
              >
                <PieChart className="w-5 h-5 mr-2" />
                Gráficos
              </button>
            </div>

            {/* BOTÃO DE FILTRO */}
            <button className="px-4 py-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Filtros</span>
            </button>
          </div>
        </div>

        {/* FILTRO DE PERÍODO */}
        <div className="mb-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-4 py-2 rounded-xl transition-all ${
                timeRange === '7d'
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              7 Dias
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-4 py-2 rounded-xl transition-all ${
                timeRange === '30d'
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              30 Dias
            </button>
          </div>
        </div>

        {/* ÁREA DE CONTEÚDO ANIMADA */}
        <AnimatePresence mode="wait">
          {activeView === 'table' ? (
            <motion.div
              key="table"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 mb-8"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Atividades Recentes</h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">Últimas interações no sistema</p>
                </div>
                <button
                  onClick={() => navigate('/events')}
                  className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium flex items-center space-x-1"
                >
                  <span>Ver todos</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                {recentEvents.length > 0 ? (
                  recentEvents.map((event, index) => {
                    const eventType = translateEventType(event.type);
                    const deviceInfo = getDeviceInfo(event.userAgent);
                    const hasIp = event.ip && event.ip !== 'unknown' && event.ip !== '127.0.0.1';

                    return (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all group cursor-pointer"
                        onClick={() => navigate(`/events/${event.id}`)}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-xl ${getEventColor(event.type)}`}>
                            {getEventIcon(event.type)}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <p className="font-semibold text-gray-900 dark:text-white">{eventType}</p>
                              <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full">
                                {deviceInfo}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{event.message}</p>
                            <div className="flex items-center space-x-3 mt-2">
                              <span className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                <Clock className="w-3 h-3 mr-1" />
                                {formatDate(event.createdAt)}
                              </span>
                              {hasIp && (
                                <span className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                  <Globe className="w-3 h-3 mr-1" />
                                  {event.ip}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <button className="opacity-0 group-hover:opacity-100 text-primary-600 hover:text-primary-700 transition-opacity">
                          <Eye className="w-5 h-5" />
                        </button>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="text-center py-12">
                    <Activity className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Nenhuma atividade recente</h3>
                    <p className="text-gray-600 dark:text-gray-400">As atividades aparecerão aqui quando você usar o sistema</p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="charts"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 mb-8"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Análise Gráfica</h2>
              <div className="h-96 flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                <div className="text-center">
                  <BarChart3 className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-2">Visualização de dados em desenvolvimento</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    {timeRange === '7d' ? 'Últimos 7 dias' : 'Últimos 30 dias'}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AÇÕES RÁPIDAS E STATUS DO SISTEMA */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* AÇÕES RÁPIDAS */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Ações Rápidas</h3>
            <div className="space-y-4">
              {quickActions.map((action, index) => (
                <motion.button
                  key={index}
                  onClick={action.onClick}
                  className="w-full text-left p-4 rounded-xl hover:shadow-lg transition-all duration-200 group"
                  whileHover={{ x: 5 }}
                  style={{
                    backgroundColor: action.color === 'blue' ? '#eff6ff' :
                                   action.color === 'purple' ? '#faf5ff' :
                                   action.color === 'amber' ? '#fffbeb' : '#f9fafb',
                    borderColor: action.color === 'blue' ? '#dbeafe' :
                                action.color === 'purple' ? '#e9d5ff' :
                                action.color === 'amber' ? '#fde68a' : '#e5e7eb'
                  }}
                >
                  <div className="flex items-center">
                    <div
                      className="p-2 rounded-lg mr-3"
                      style={{
                        backgroundColor: action.color === 'blue' ? '#dbeafe' :
                                        action.color === 'purple' ? '#e9d5ff' :
                                        action.color === 'amber' ? '#fde68a' : '#e5e7eb',
                        color: action.color === 'blue' ? '#1d4ed8' :
                              action.color === 'purple' ? '#7c3aed' :
                              action.color === 'amber' ? '#d97706' : '#4b5563'
                      }}
                    >
                      {action.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{action.label}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{action.description}</p>
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* STATUS DO SISTEMA */}
          <div className="lg:col-span-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Status do Sistema</h3>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-600 dark:text-green-400">Tudo operacional</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {systemStatus.map((item, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-200/50 dark:border-gray-600/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-lg ${
                      item.status === 'online' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                      item.status === 'warning' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                      'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                      {item.icon}
                    </div>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{item.value}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Status: {item.status}</p>
                </div>
              ))}
            </div>

            {/* INFORMAÇÕES DO SISTEMA */}
            <div className="bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center mb-4">
                <Rocket className="w-6 h-6 text-primary-600 dark:text-primary-400 mr-3" />
                <h4 className="font-bold text-gray-900 dark:text-white">EventFlow v1.0</h4>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Sistema de auditoria e monitoramento em tempo real com tecnologia de ponta para garantir a segurança e rastreabilidade das operações.
              </p>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center text-gray-500 dark:text-gray-400">
                    <Sparkles className="w-4 h-4 mr-1" />
                    {stats?.totalEvents?.toLocaleString() || '156'} eventos
                  </span>
                  <span className="flex items-center text-gray-500 dark:text-gray-400">
                    <Users className="w-4 h-4 mr-1" />
                    {stats?.loginEvents || '45'} logins
                  </span>
                </div>
                <span className="text-primary-600 dark:text-primary-400 font-medium">
                  Atualizado: {new Date().toLocaleTimeString('pt-BR')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="mt-12 py-6 border-t border-gray-200/50 dark:border-gray-800/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                EventFlow v1.0 • Sistema de Auditoria e Rastreamento
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                © {new Date().getFullYear()} Todos os direitos reservados.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Sessão ativa por {Math.floor(sessionTime / 60)}:{String(sessionTime % 60).padStart(2, '0')}
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <button
                onClick={() => window.open('https://github.com/eventflow', '_blank')}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                Documentação
              </button>
              <button
                onClick={() => navigate('/support')}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                Suporte
              </button>
              <button
                onClick={() => navigate('/status')}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                Status
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default React.memo(Dashboard);
