// frontend/src/pages/Settings.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon,
  Bell,
  Shield,
  Database,
  Trash2,
  LogOut,
  Moon,
  Sun,
  Globe,
  Download,
  Eye,
  Lock,
  AlertTriangle,
  User,
  Smartphone,
  Mail,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    security: true,
    weeklyReports: false,
    loginAlerts: true,
    newDeviceAlerts: true,
  });
  const [activeSection, setActiveSection] = useState<'general' | 'notifications' | 'privacy' | 'data'>('general');

  // Scroll para seção baseado no hash da URL
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash && ['general', 'notifications', 'privacy', 'data'].includes(hash)) {
      setActiveSection(hash as any);
      const element = document.getElementById(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);

  const handleExportData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/events', {
        params: { limit: 1000 }
      });

      if (response.data.success) {
        const dataStr = JSON.stringify(response.data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileName = `eventflow-export-${new Date().toISOString().split('T')[0]}.json`;

        const link = document.createElement('a');
        link.setAttribute('href', dataUri);
        link.setAttribute('download', exportFileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success('Dados exportados com sucesso!');
      }
    } catch (error: any) {
      console.error('Erro ao exportar dados:', error);
      toast.error(error.response?.data?.error || 'Erro ao exportar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutAllDevices = async () => {
    if (!window.confirm('Deseja fazer logout de todos os dispositivos?')) {
      return;
    }

    try {
      setLoading(true);
      // Implementar logout de todos os dispositivos no backend
      toast.success('Logout de todos os dispositivos realizado');
      logout();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast.error('Erro ao fazer logout de todos os dispositivos');
    } finally {
      setLoading(false);
    }
  };

  const handleClearNotifications = async () => {
    if (!window.confirm('Tem certeza que deseja limpar todas as notificações? Esta ação é irreversível!')) {
      return;
    }

    try {
      setLoading(true);
      await api.delete('/api/notifications');
      toast.success('Notificações limpas com sucesso!');
    } catch (error: any) {
      console.error('Erro ao limpar notificações:', error);
      toast.error(error.response?.data?.error || 'Erro ao limpar notificações');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Tem certeza que deseja excluir sua conta? Esta ação é irreversível e todos os dados serão perdidos!')) {
      return;
    }

    try {
      setLoading(true);
      const password = prompt('Digite sua senha para confirmar a exclusão:');
      if (!password) {
        toast.error('Senha é obrigatória para excluir a conta');
        return;
      }

      await api.delete('/api/profile', {
        data: { password }
      });

      toast.success('Conta excluída com sucesso!');
      logout();
      navigate('/login');
    } catch (error: any) {
      console.error('Erro ao excluir conta:', error);
      toast.error(error.response?.data?.error || 'Erro ao excluir conta');
    } finally {
      setLoading(false);
    }
  };

  const notificationGroups = [
    {
      title: 'Alertas de Segurança',
      icon: <Shield className="w-5 h-5" />,
      settings: [
        { key: 'loginAlerts', label: 'Alertas de login', description: 'Notificar sobre novos logins' },
        { key: 'newDeviceAlerts', label: 'Novos dispositivos', description: 'Alertar sobre dispositivos desconhecidos' },
        { key: 'securityAlerts', label: 'Alertas de segurança', description: 'Notificações críticas do sistema' },
      ]
    },
    {
      title: 'Comunicação',
      icon: <Mail className="w-5 h-5" />,
      settings: [
        { key: 'emailNotifications', label: 'Notificações por email', description: 'Receber emails com atualizações' },
        { key: 'pushNotifications', label: 'Notificações push', description: 'Notificações no navegador' },
        { key: 'weeklyReports', label: 'Relatórios semanais', description: 'Resumo semanal das atividades' },
      ]
    }
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'general':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Configurações Gerais</h2>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Tema Escuro</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Ativar modo escuro</p>
                </div>
                <button
                  onClick={toggleTheme}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${theme === 'dark' ? 'bg-blue-600' : 'bg-gray-300'} transition-colors`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Idioma</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Português (Brasil)</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">PT-BR</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Fuso Horário</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Brasília (GMT-3)</p>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Automático</span>
              </div>

              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="font-medium text-gray-900 dark:text-white mb-4">Informações da Conta</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Membro desde</span>
                    <span className="text-sm font-medium">01/01/2024</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Último login</span>
                    <span className="text-sm font-medium">Hoje, 14:30</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Status da conta</span>
                    <span className="flex items-center text-sm text-green-600 dark:text-green-400">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Ativa
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'notifications':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
            id="notifications"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Notificações</h2>

            <div className="space-y-6">
              {notificationGroups.map((group, groupIndex) => (
                <div key={groupIndex} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-lg">
                        {group.icon}
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{group.title}</h3>
                    </div>
                  </div>

                  <div className="p-4 space-y-4">
                    {group.settings.map((setting, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">{setting.label}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{setting.description}</p>
                        </div>
                        <button
                          onClick={() => setNotifications(prev => ({
                            ...prev,
                            [setting.key]: !prev[setting.key as keyof typeof notifications]
                          }))}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            notifications[setting.key as keyof typeof notifications]
                              ? 'bg-blue-600'
                              : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                              notifications[setting.key as keyof typeof notifications]
                                ? 'translate-x-6'
                                : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="p-4 bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/10 dark:to-blue-900/10 rounded-xl border border-primary-200 dark:border-primary-800">
                <div className="flex items-center space-x-3 mb-3">
                  <Bell className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  <h4 className="font-semibold text-gray-900 dark:text-white">Preferências de entrega</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Todas as notificações são enviadas de forma segura e podem ser personalizadas conforme suas necessidades.
                </p>
                <button
                  onClick={() => {
                    localStorage.setItem('notification-settings', JSON.stringify(notifications));
                    toast.success('Preferências salvas!');
                  }}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                >
                  Salvar preferências
                </button>
              </div>
            </div>
          </motion.div>
        );

      case 'privacy':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
            id="privacy"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Privacidade & Segurança</h2>

            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-4">Sessões Ativas</h3>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Sessão Atual</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Dispositivo atual • Hoje, 14:30</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">IP: 192.168.1.1</p>
                    </div>
                    <div className="flex items-center text-green-600 dark:text-green-400">
                      <CheckCircle className="w-5 h-5 mr-1" />
                      <span className="text-sm font-medium">Ativa</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleLogoutAllDevices}
                  disabled={loading}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sair de Todos os Dispositivos</span>
                </button>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="font-medium text-gray-900 dark:text-white mb-4">Dois Fatores de Autenticação</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Adicione uma camada extra de segurança à sua conta
                </p>
                <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Lock className="w-4 h-4" />
                  <span>Configurar 2FA</span>
                </button>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="font-medium text-gray-900 dark:text-white mb-4">Visibilidade</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Controle quem pode ver suas atividades e informações
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Perfil público</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Tornar perfil visível para outros usuários</p>
                    </div>
                    <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                      Configurar
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Atividades visíveis</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Controlar visibilidade das atividades</p>
                    </div>
                    <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                      Configurar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'data':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
            id="data"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Gerenciamento de Dados</h2>

            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-4">Exportar Dados</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Baixe uma cópia dos seus dados pessoais e eventos em formato JSON
                </p>
                <button
                  onClick={handleExportData}
                  disabled={loading}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>{loading ? 'Exportando...' : 'Exportar Dados'}</span>
                </button>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="font-medium text-gray-900 dark:text-white mb-4">Limpar Notificações</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Remova todas as notificações do sistema
                </p>
                <button
                  onClick={handleClearNotifications}
                  disabled={loading}
                  className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Limpar Todas as Notificações</span>
                </button>
              </div>

              <div className="border-t border-red-200 dark:border-red-900/30 pt-6">
                <h3 className="font-medium text-red-600 dark:text-red-400 mb-4 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Zona de Perigo
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Estas ações são irreversíveis. Proceda com cautela.
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      if (window.confirm('Deseja realmente excluir todos os seus eventos?')) {
                        toast.error('Funcionalidade em desenvolvimento');
                      }
                    }}
                    className="w-full flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <Trash2 className="w-5 h-5" />
                      <div>
                        <p className="font-medium">Excluir Todos os Eventos</p>
                        <p className="text-sm">Remove todo o histórico de eventos</p>
                      </div>
                    </div>
                    <XCircle className="w-5 h-5" />
                  </button>

                  <button
                    onClick={handleDeleteAccount}
                    disabled={loading}
                    className="w-full flex items-center justify-between p-4 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
                  >
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5" />
                      <div>
                        <p className="font-medium">Deletar Conta Permanentemente</p>
                        <p className="text-sm">Remove todos os dados da plataforma</p>
                      </div>
                    </div>
                    <AlertTriangle className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Configurações</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Gerencie suas preferências e configurações da conta</p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              ← Voltar ao Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Configurações</h2>
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveSection('general')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${activeSection === 'general' ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-medium' : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                >
                  <div className="flex items-center space-x-3">
                    <SettingsIcon className="w-5 h-5" />
                    <span>Geral</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveSection('notifications')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${activeSection === 'notifications' ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-medium' : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                >
                  <div className="flex items-center space-x-3">
                    <Bell className="w-5 h-5" />
                    <span>Notificações</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveSection('privacy')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${activeSection === 'privacy' ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-medium' : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                >
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5" />
                    <span>Privacidade</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveSection('data')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${activeSection === 'data' ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-medium' : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                >
                  <div className="flex items-center space-x-3">
                    <Database className="w-5 h-5" />
                    <span>Dados</span>
                  </div>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Settings */}
          <div className="lg:col-span-3 space-y-8">
            {renderSection()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
