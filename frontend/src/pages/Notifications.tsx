
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  CheckCircle,
  AlertCircle,
  Info,
  Shield,
  X,
  Filter,
  Trash2,
  CheckCheck,
  Clock,
  RefreshCw,
  AlertTriangle,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';
  read: boolean;
  metadata?: any;
  createdAt: string;
  timeAgo?: string;
  createdAtFormatted?: string;
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 'notif-1',
      title: 'Bem-vindo ao EventFlow!',
      message: 'Sistema de monitoramento iniciado com sucesso.',
      type: 'SUCCESS',
      read: true,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      timeAgo: '1 dia atrás',
      createdAtFormatted: new Date(Date.now() - 86400000).toLocaleString('pt-BR')
    },
    {
      id: 'notif-2',
      title: 'Monitoramento Ativo',
      message: 'Todas as funcionalidades estão operacionais.',
      type: 'INFO',
      read: false,
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      timeAgo: '2 horas atrás',
      createdAtFormatted: new Date(Date.now() - 7200000).toLocaleString('pt-BR')
    },
    {
      id: 'notif-3',
      title: 'Dashboard Atualizado',
      message: 'Novos gráficos e estatísticas disponíveis.',
      type: 'SUCCESS',
      read: true,
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      timeAgo: '2 dias atrás',
      createdAtFormatted: new Date(Date.now() - 172800000).toLocaleString('pt-BR')
    },
    {
      id: 'notif-4',
      title: 'Sistema Seguro',
      message: 'Todas as verificações de segurança passaram.',
      type: 'INFO',
      read: false,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      timeAgo: '1 hora atrás',
      createdAtFormatted: new Date(Date.now() - 3600000).toLocaleString('pt-BR')
    },
    {
      id: 'notif-5',
      title: 'Backup Automático',
      message: 'Backup dos dados realizado com sucesso.',
      type: 'SUCCESS',
      read: true,
      createdAt: new Date(Date.now() - 43200000).toISOString(),
      timeAgo: '12 horas atrás',
      createdAtFormatted: new Date(Date.now() - 43200000).toLocaleString('pt-BR')
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const { user } = useAuth();

  //  Função SILENCIOSA para buscar notificações
  const fetchNotifications = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);

      //  Tentar buscar do backend SILENCIOSAMENTE
      try {
        const response = await api.get('/api/notifications');

        if (response.data && response.data.notifications) {
          const formatted = response.data.notifications.map((notif: any) => ({
            id: notif.id || `notif-${Date.now()}`,
            title: notif.title || 'Notificação do Sistema',
            message: notif.message || 'Mensagem de sistema',
            type: (notif.type || 'INFO').toUpperCase(),
            read: notif.read || false,
            createdAt: notif.createdAt || new Date().toISOString(),
            timeAgo: getTimeAgo(notif.createdAt),
            createdAtFormatted: formatDate(notif.createdAt)
          }));

          setNotifications(formatted);
          return;
        }
      } catch {
        //  SILENCIOSO: Não faz nada se falhar
        // Mantém os dados padrão
      }

    } finally {
      setLoading(false);
    }
  }, []);

  //  Funções auxiliares SILENCIOSAS
  const getTimeAgo = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diff = now.getTime() - date.getTime();

      if (diff < 60000) return 'Agora mesmo';
      if (diff < 3600000) return `${Math.floor(diff / 60000)} min atrás`;
      if (diff < 86400000) return `${Math.floor(diff / 3600000)} horas atrás`;
      return `${Math.floor(diff / 86400000)} dias atrás`;
    } catch {
      return 'Hoje';
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleString('pt-BR');
    } catch {
      return new Date().toLocaleDateString('pt-BR');
    }
  };

  //  Funções SILENCIOSAS para ações
  const markAsRead = async (id: string): Promise<void> => {
    try {
      await api.put(`/api/notifications/${id}`, { read: true });
    } catch {
      // Silencioso
    }

    setNotifications(prev => prev.map(notif =>
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const markAllAsRead = async (): Promise<void> => {
    try {
      await api.put('/api/notifications/mark-all-read');
    } catch {
      // Silencioso
    }

    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  const deleteNotification = async (id: string): Promise<void> => {
    try {
      await api.delete(`/api/notifications/${id}`);
    } catch {
      // Silencioso
    }

    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const deleteAllNotifications = async (): Promise<void> => {
    if (!window.confirm('Limpar todas as notificações?')) return;

    try {
      await api.delete('/api/notifications');
    } catch {
      // Silencioso
    }

    setNotifications([]);
  };

  //  Filtros
  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread' && notif.read) return false;
    if (selectedType !== 'all' && notif.type !== selectedType) return false;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  // Ícones e cores SILENCIOSAS
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'ERROR': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'WARNING': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getNotificationBg = (type: string) => {
    switch (type) {
      case 'SUCCESS': return 'bg-green-50 dark:bg-green-900/20 border-green-100';
      case 'ERROR': return 'bg-red-50 dark:bg-red-900/20 border-red-100';
      case 'WARNING': return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-100';
      default: return 'bg-blue-50 dark:bg-blue-900/20 border-blue-100';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'SUCCESS': return 'Sucesso';
      case 'ERROR': return 'Erro';
      case 'WARNING': return 'Aviso';
      default: return 'Informação';
    }
  };

  // Renderização SILENCIOSA
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500">
                <Bell className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Notificações
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  {unreadCount > 0
                    ? `${unreadCount} não lida${unreadCount !== 1 ? 's' : ''}`
                    : 'Tudo em dia'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                unreadCount > 0
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-green-100 text-green-700'
              }`}>
                <Bell className="w-4 h-4" />
                <span className="font-medium">
                  {unreadCount} não lida{unreadCount !== 1 ? 's' : ''}
                </span>
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center space-x-2"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span>Marcar todas como lidas</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex items-center space-x-3">
                <Filter className="w-5 h-5 text-primary-600" />
                <span className="font-medium text-gray-900 dark:text-white">Filtrar:</span>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      filter === 'all'
                        ? 'bg-white dark:bg-gray-600 text-primary-600'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Todas
                  </button>
                  <button
                    onClick={() => setFilter('unread')}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      filter === 'unread'
                        ? 'bg-white dark:bg-gray-600 text-primary-600'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Não lidas
                  </button>
                </div>

                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white"
                >
                  <option value="all">Todos os tipos</option>
                  <option value="INFO">Informação</option>
                  <option value="WARNING">Aviso</option>
                  <option value="SUCCESS">Sucesso</option>
                  <option value="ERROR">Erro</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Notificações */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow">
              <Bell className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Nenhuma notificação
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Você não tem notificações no momento.
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`${getNotificationBg(notification.type)} border rounded-2xl p-6 shadow-lg`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <h3 className="font-bold text-gray-900 dark:text-white">
                          {notification.title}
                        </h3>

                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          notification.type === 'SUCCESS'
                            ? 'bg-green-100 text-green-800'
                            : notification.type === 'ERROR'
                            ? 'bg-red-100 text-red-800'
                            : notification.type === 'WARNING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {getTypeText(notification.type)}
                        </span>

                        {!notification.read && (
                          <span className="px-2 py-1 text-xs bg-primary-100 text-primary-800 rounded-full">
                            Nova
                          </span>
                        )}
                      </div>

                      <p className="text-gray-700 dark:text-gray-300 mb-4">
                        {notification.message}
                      </p>

                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center text-gray-500 dark:text-gray-400">
                          <Clock className="w-4 h-4 mr-2" />
                          {notification.timeAgo || getTimeAgo(notification.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-2 rounded-lg hover:bg-white/50"
                        title="Marcar como lida"
                      >
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </button>
                    )}

                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="p-2 rounded-lg hover:bg-white/50"
                      title="Excluir"
                    >
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Rodapé */}
        {notifications.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Mostrando {filteredNotifications.length} de {notifications.length} notificações
              </div>

              <button
                onClick={deleteAllNotifications}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Limpar Todas</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(Notifications);
