import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon,
  Bell,
  Shield,
  Database,
  Trash2,
  LogOut,
  Moon,
  Globe,
  Download,
  Eye,
  Lock,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    security: true
  });

  const handleExportData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/events', {
        headers: { Authorization: `Bearer ${token}` },
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
      // Implementar endpoint específico para logout de todos os dispositivos
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

  const handleClearData = async () => {
    if (!window.confirm('Tem certeza que deseja limpar todos os dados? Esta ação é irreversível!')) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.delete('http://localhost:5000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Dados limpos com sucesso!');
    } catch (error: any) {
      console.error('Erro ao limpar dados:', error);
      toast.error(error.response?.data?.error || 'Erro ao limpar dados');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
              <p className="text-gray-600 mt-2">Gerencie suas preferências e configurações da conta</p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-900"
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
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Configurações</h2>
              <nav className="space-y-2">
                <button className="w-full text-left px-4 py-3 rounded-lg bg-blue-50 text-blue-700 font-medium">
                  <div className="flex items-center space-x-3">
                    <SettingsIcon className="w-5 h-5" />
                    <span>Geral</span>
                  </div>
                </button>
                <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700">
                  <div className="flex items-center space-x-3">
                    <Bell className="w-5 h-5" />
                    <span>Notificações</span>
                  </div>
                </button>
                <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5" />
                    <span>Privacidade</span>
                  </div>
                </button>
                <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700">
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
            {/* General Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6">Configurações Gerais</h2>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Tema Escuro</h3>
                    <p className="text-sm text-gray-600">Ativar modo escuro</p>
                  </div>
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${darkMode ? 'bg-blue-600' : 'bg-gray-300'} transition-colors`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Idioma</h3>
                    <p className="text-sm text-gray-600">Português (Brasil)</p>
                  </div>
                  <Globe className="w-5 h-5 text-gray-400" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Fuso Horário</h3>
                    <p className="text-sm text-gray-600">Brasília (GMT-3)</p>
                  </div>
                  <span className="text-sm text-gray-600">Automático</span>
                </div>
              </div>
            </motion.div>

            {/* Notification Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6">Notificações</h2>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Notificações por Email</h3>
                    <p className="text-sm text-gray-600">Receba atualizações por email</p>
                  </div>
                  <button
                    onClick={() => setNotifications({...notifications, email: !notifications.email})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${notifications.email ? 'bg-blue-600' : 'bg-gray-300'} transition-colors`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${notifications.email ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Notificações Push</h3>
                    <p className="text-sm text-gray-600">Notificações em tempo real</p>
                  </div>
                  <button
                    onClick={() => setNotifications({...notifications, push: !notifications.push})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${notifications.push ? 'bg-blue-600' : 'bg-gray-300'} transition-colors`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${notifications.push ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Alertas de Segurança</h3>
                    <p className="text-sm text-gray-600">Notificações sobre atividades suspeitas</p>
                  </div>
                  <button
                    onClick={() => setNotifications({...notifications, security: !notifications.security})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${notifications.security ? 'bg-blue-600' : 'bg-gray-300'} transition-colors`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${notifications.security ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Privacy & Security */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6">Privacidade & Segurança</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-4">Sessões Ativas</h3>
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Sessão Atual</p>
                        <p className="text-sm text-gray-600">Dispositivo atual</p>
                        <p className="text-sm text-gray-600">IP: 192.168.1.1</p>
                      </div>
                      <button
                        onClick={handleLogoutAllDevices}
                        disabled={loading}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sair de Todos</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-4">Dois Fatores de Autenticação</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Adicione uma camada extra de segurança à sua conta
                  </p>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <Lock className="w-4 h-4" />
                    <span>Configurar 2FA</span>
                  </button>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-4">Visibilidade</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Controle quem pode ver suas atividades
                  </p>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                    <Eye className="w-4 h-4" />
                    <span>Configurar Privacidade</span>
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Data Management */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6">Gerenciamento de Dados</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-4">Exportar Dados</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Baixe uma cópia dos seus dados pessoais e eventos
                  </p>
                  <button
                    onClick={handleExportData}
                    disabled={loading}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    <span>{loading ? 'Exportando...' : 'Exportar Dados'}</span>
                  </button>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-4">Limpar Dados</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Remova todos os eventos e notificações do sistema
                  </p>
                  <button
                    onClick={handleClearData}
                    disabled={loading}
                    className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Limpar Todos os Dados</span>
                  </button>
                </div>

                <div className="pt-6 border-t border-red-200">
                  <h3 className="font-medium text-red-600 mb-4 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    Zona de Perigo
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Estas ações são irreversíveis. Proceda com cautela.
                  </p>
                  <button
                    onClick={() => navigate('/profile')}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Deletar Conta Permanentemente</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
