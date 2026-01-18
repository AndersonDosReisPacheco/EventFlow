import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  User, Mail, UserCircle, Camera, FileText, Key, Save, Trash2,
  AlertCircle, CheckCircle, XCircle, Calendar, Shield, LogOut,
  Eye, EyeOff, Bell, Globe, Settings, Upload, X, Download,
  Lock, Smartphone, Monitor, ExternalLink, CreditCard,
  HardDrive, Database, Zap, Moon, Sun, Languages,
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface ProfileData {
  name: string;
  email: string;
  socialName?: string | null;
  bio?: string | null;
  profilePicture?: string | null;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface DeleteData {
  password: string;
  confirmPassword: string;
}

interface Credential {
  key: string;
  value: string;
}

interface ActiveSession {
  id: string;
  device: string;
  browser: string;
  ip: string;
  lastActive: string;
  location?: string;
  current: boolean;
}

const Profile: React.FC = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'account'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
    delete: false,
    deleteConfirm: false
  });

  // Dados do perfil
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    email: '',
    socialName: null,
    bio: null,
    profilePicture: null,
  });

  // Dados de senha
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Dados de exclusão
  const [deleteData, setDeleteData] = useState<DeleteData>({
    password: '',
    confirmPassword: '',
  });

  // Credenciais
  const [credentials, setCredentials] = useState<Record<string, any>>({});
  const [newCredential, setNewCredential] = useState<Credential>({
    key: '',
    value: '',
  });

  // Notificações settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    loginAlerts: true,
    securityAlerts: true,
    newsletter: false,
    productUpdates: true,
    marketingEmails: false,
  });

  // Configurações de conta
  const [accountSettings, setAccountSettings] = useState({
    language: 'pt-BR',
    timezone: 'America/Sao_Paulo',
    theme: 'light',
    twoFactorAuth: false,
    autoLogout: true,
    sessionTimeout: 60,
    dataSharing: false,
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        socialName: user.socialName || null,
        bio: user.bio || null,
        profilePicture: user.profilePicture || null,
      });
      setCredentials(user.credentials || {});
      setImagePreview(user.profilePicture || null);
    }
    loadActiveSessions();
  }, [user]);

  // 🔥 CARREGAR SESSÕES ATIVAS
  const loadActiveSessions = async () => {
    setLoadingSessions(true);
    try {
      // Em produção, isso viria da API
      const mockSessions: ActiveSession[] = [
        {
          id: '1',
          device: 'Desktop',
          browser: 'Chrome 120',
          ip: '192.168.1.100',
          lastActive: new Date().toISOString(),
          location: 'São Paulo, BR',
          current: true,
        },
        {
          id: '2',
          device: 'Mobile',
          browser: 'Safari 17',
          ip: '177.220.180.101',
          lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          location: 'Rio de Janeiro, BR',
          current: false,
        },
        {
          id: '3',
          device: 'Tablet',
          browser: 'Firefox 121',
          ip: '45.179.185.102',
          lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          location: 'Belo Horizonte, BR',
          current: false,
        },
      ];
      setActiveSessions(mockSessions);
    } catch (error) {
      console.error('Erro ao carregar sessões:', error);
    } finally {
      setLoadingSessions(false);
    }
  };

  // 🔥 TERMINAR SESSÃO
  const terminateSession = async (sessionId: string) => {
    try {
      // Em produção, chamar API para terminar sessão
      setActiveSessions(prev => prev.filter(s => s.id !== sessionId));
      toast.success('Sessão terminada com sucesso');
    } catch (error) {
      console.error('Erro ao terminar sessão:', error);
      toast.error('Erro ao terminar sessão');
    }
  };

  // 🔥 TERMINAR TODAS AS SESSÕES
  const terminateAllSessions = async () => {
    if (!window.confirm('Tem certeza que deseja terminar todas as outras sessões?')) {
      return;
    }
    try {
      setActiveSessions(prev => prev.filter(s => s.current));
      toast.success('Todas as outras sessões foram terminadas');
    } catch (error) {
      console.error('Erro ao terminar sessões:', error);
      toast.error('Erro ao terminar sessões');
    }
  };

  // 🔥 FUNÇÃO PARA UPLOAD DE IMAGEM
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Por favor, selecione uma imagem (JPEG, PNG, GIF ou WebP)');
      return;
    }

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB');
      return;
    }

    setUploadingImage(true);

    try {
      // Criar preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result as string;
        setImagePreview(base64Image);
        setProfileData(prev => ({
          ...prev,
          profilePicture: base64Image
        }));
      };
      reader.readAsDataURL(file);

      toast.success('Imagem carregada com sucesso! Salve para confirmar.');
    } catch (error) {
      console.error('Erro ao carregar imagem:', error);
      toast.error('Erro ao carregar imagem');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setProfileData(prev => ({
      ...prev,
      profilePicture: null
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.info('Imagem removida');
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    // 🔥 VALIDAÇÃO DE BIOGRAFIA
    if (profileData.bio && profileData.bio.length > 150) {
      toast.error('A biografia deve ter no máximo 150 caracteres');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: profileData.name,
        email: profileData.email,
        socialName: profileData.socialName || null,
        bio: profileData.bio?.substring(0, 150) || null,
        profilePicture: profileData.profilePicture || null
      };

      const response = await axios.put(`${API_URL}/api/users/profile`, payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        updateUser(response.data.user);
        toast.success('Perfil atualizado com sucesso!');
        setIsEditing(false);
      } else {
        toast.error(response.data.error || 'Erro ao atualizar perfil');
      }
    } catch (error: any) {
      console.error('Erro completo:', error);

      if (error.response?.status === 413) {
        toast.error('Imagem muito grande. Use uma imagem menor (max 5MB)');
      } else if (error.code === 'ERR_NETWORK') {
        toast.error('Erro de conexão com o servidor');
      } else {
        toast.error(error.response?.data?.error || 'Erro ao atualizar perfil');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    // 🔥 VALIDAÇÃO DE SEGURANÇA DA SENHA
    const hasUpperCase = /[A-Z]/.test(passwordData.newPassword);
    const hasLowerCase = /[a-z]/.test(passwordData.newPassword);
    const hasNumbers = /\d/.test(passwordData.newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(passwordData.newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      toast.error('A senha deve conter letras maiúsculas, minúsculas, números e caracteres especiais');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.put(`${API_URL}/api/users/change-password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        toast.success('Senha alterada com sucesso!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        toast.error(response.data.error || 'Erro ao alterar senha');
      }
    } catch (error: any) {
      console.error('Erro ao alterar senha:', error);
      if (error.code === 'ERR_NETWORK') {
        toast.error('Erro de conexão com o servidor');
      } else {
        toast.error(error.response?.data?.error || 'Erro ao alterar senha');
      }
    } finally {
      setLoading(false);
    }
  };

  // 🔥 ATUALIZAR CONFIGURAÇÕES DA CONTA
  const handleAccountSettingsUpdate = async () => {
    setLoading(true);
    try {
      // Usar a rota correta para atualizar configurações
      const response = await axios.put(`${API_URL}/api/users/settings`, accountSettings, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        updateUser(response.data.user);
        toast.success('Configurações da conta atualizadas com sucesso!');
      } else {
        toast.error(response.data.error || 'Erro ao atualizar configurações');
      }
    } catch (error: any) {
      console.error('Erro ao atualizar configurações:', error);
      if (error.code === 'ERR_NETWORK') {
        toast.error('Erro de conexão com o servidor');
      } else {
        toast.error('Erro ao atualizar configurações');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddCredential = () => {
    if (!newCredential.key.trim() || !newCredential.value.trim()) {
      toast.error('Preencha todos os campos da credencial');
      return;
    }

    const updatedCredentials = {
      ...credentials,
      [newCredential.key]: newCredential.value,
    };

    setCredentials(updatedCredentials);
    setNewCredential({ key: '', value: '' });
    toast.success('Credencial adicionada!');
  };

  const handleRemoveCredential = (key: string) => {
    const updatedCredentials = { ...credentials };
    delete updatedCredentials[key];
    setCredentials(updatedCredentials);
    toast.info('Credencial removida');
  };

  const handleSaveCredentials = async () => {
    setLoading(true);

    try {
      // Usar a rota correta para salvar credenciais
      const response = await axios.put(`${API_URL}/api/users/credentials`, {
        credentials,
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        updateUser(response.data.user);
        toast.success('Credenciais salvas com sucesso!');
      } else {
        toast.error(response.data.error || 'Erro ao salvar credenciais');
      }
    } catch (error: any) {
      console.error('Erro ao salvar credenciais:', error);
      if (error.code === 'ERR_NETWORK') {
        toast.error('Erro de conexão com o servidor');
      } else {
        toast.error(error.response?.data?.error || 'Erro ao salvar credenciais');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    if (deleteData.password !== deleteData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (!window.confirm('Tem certeza que deseja excluir sua conta? Esta ação é irreversível!')) {
      return;
    }

    setLoading(true);

    try {
      const response = await axios.delete(`${API_URL}/api/users/account`, {
        data: { password: deleteData.password },
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        toast.success('Conta excluída com sucesso');
        logout();
        navigate('/login');
      } else {
        toast.error(response.data.error || 'Erro ao excluir conta');
      }
    } catch (error: any) {
      console.error('Erro ao excluir conta:', error);
      if (error.code === 'ERR_NETWORK') {
        toast.error('Erro de conexão com o servidor');
      } else {
        toast.error(error.response?.data?.error || 'Erro ao excluir conta');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationSettingsChange = (key: keyof typeof notificationSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    toast.success('Configuração de notificação atualizada!');
  };

  const handleAccountSettingsChange = (key: keyof typeof accountSettings, value: any) => {
    setAccountSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const togglePasswordVisibility = (field: keyof typeof showPassword) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // 🔥 FUNÇÃO PARA EXPORTAR DADOS
  const handleExportData = async (type: 'events' | 'profile' | 'all') => {
    setLoading(true);
    try {
      let data: any;
      let filename = '';

      switch (type) {
        case 'events':
          // Buscar eventos da API
          const eventsResponse = await axios.get(`${API_URL}/api/events`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
          data = eventsResponse.data;
          filename = `eventflow-events-${new Date().toISOString().split('T')[0]}.json`;
          break;
        case 'profile':
          data = user;
          filename = `eventflow-profile-${new Date().toISOString().split('T')[0]}.json`;
          break;
        case 'all':
          const allData = {
            profile: user,
            credentials: credentials,
            settings: {
              notifications: notificationSettings,
              account: accountSettings
            }
          };
          data = allData;
          filename = `eventflow-backup-${new Date().toISOString().split('T')[0]}.json`;
          break;
      }

      // Criar arquivo JSON para download
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`Dados exportados com sucesso! Arquivo: ${filename}`);
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      toast.error('Erro ao exportar dados');
    } finally {
      setLoading(false);
    }
  };

  // 🔥 FUNÇÃO PARA MIGRAR CONTA
  const handleMigrateAccount = () => {
    toast.info('Funcionalidade em desenvolvimento');
  };

  // 🔥 FUNÇÃO PARA HABILITAR 2FA
  const handleEnable2FA = () => {
    toast.info('Autenticação de dois fatores em desenvolvimento');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Configurações da Conta</h1>
              <p className="text-gray-600 mt-2">Gerencie suas informações pessoais, segurança e preferências</p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ← Voltar ao Dashboard
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar de Navegação */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <img
                    src={user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&size=128`}
                    alt={user.name}
                    className="h-12 w-12 rounded-full border-2 border-white shadow-sm object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">{user.name}</h3>
                    <p className="text-sm text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>
              </div>

              <nav className="p-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                    activeTab === 'profile'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <User className="h-5 w-5" />
                  <span>Perfil</span>
                </button>

                <button
                  onClick={() => setActiveTab('security')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                    activeTab === 'security'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Shield className="h-5 w-5" />
                  <span>Segurança</span>
                </button>

                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                    activeTab === 'notifications'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Bell className="h-5 w-5" />
                  <span>Notificações</span>
                </button>

                <button
                  onClick={() => setActiveTab('account')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'account'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Settings className="h-5 w-5" />
                  <span>Conta</span>
                </button>
              </nav>

              <div className="p-4 border-t border-gray-200">
                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sair</span>
                </button>
              </div>
            </div>
          </div>

          {/* Conteúdo Principal */}
          <div className="lg:col-span-3">
            {/* Tab: Perfil */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <User className="h-6 w-6 text-blue-500 mr-2" />
                      <h2 className="text-xl font-semibold text-gray-800">Informações Pessoais</h2>
                    </div>
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center"
                      >
                        <UserCircle className="h-4 w-4 mr-2" />
                        Editar Perfil
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setImagePreview(user.profilePicture || null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                        className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                      {/* UPLOAD DE FOTO DE PERFIL */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Foto de Perfil
                        </label>
                        <div className="flex flex-col items-center space-y-4">
                          <div className="relative">
                            <img
                              src={imagePreview || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name)}&background=random&size=200`}
                              alt="Preview"
                              className="h-40 w-40 rounded-full border-4 border-white shadow-lg object-cover"
                            />
                            {imagePreview && (
                              <button
                                type="button"
                                onClick={handleRemoveImage}
                                className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </div>

                          <div className="flex flex-col sm:flex-row gap-3">
                            <button
                              type="button"
                              onClick={triggerFileInput}
                              disabled={uploadingImage}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50"
                            >
                              {uploadingImage ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  Carregando...
                                </>
                              ) : (
                                <>
                                  <Upload className="h-4 w-4 mr-2" />
                                  Escolher Foto
                                </>
                              )}
                            </button>

                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleImageUpload}
                              accept="image/jpeg,image/png,image/gif,image/webp"
                              className="hidden"
                            />

                            <button
                              type="button"
                              onClick={() => {
                                setProfileData(prev => ({
                                  ...prev,
                                  profilePicture: `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name)}&background=random&size=200`
                                }));
                                setImagePreview(`https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name)}&background=random&size=200`);
                              }}
                              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                              Usar Avatar
                            </button>
                          </div>

                          <p className="text-xs text-gray-500 text-center">
                            Formatos: JPEG, PNG, GIF, WebP • Máximo: 5MB
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nome Completo *
                          </label>
                          <input
                            type="text"
                            value={profileData.name}
                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email *
                          </label>
                          <input
                            type="email"
                            value={profileData.email}
                            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nome Social
                        </label>
                        <input
                          type="text"
                          value={profileData.socialName || ''}
                          onChange={(e) => setProfileData({ ...profileData, socialName: e.target.value || null })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Opcional"
                        />
                      </div>

                      {/* BIOGRAFIA COM LIMITE DE 150 CARACTERES */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-sm font-medium text-gray-700">
                            Biografia
                          </label>
                          <span className={`text-xs ${(profileData.bio?.length || 0) > 150 ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                            {(profileData.bio?.length || 0)}/150 caracteres
                          </span>
                        </div>
                        <textarea
                          value={profileData.bio || ''}
                          onChange={(e) => {
                            const newBio = e.target.value;
                            if (newBio.length <= 150) {
                              setProfileData({ ...profileData, bio: newBio || null });
                            }
                          }}
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Conte um pouco sobre você (máximo 150 caracteres)..."
                          maxLength={150}
                        />
                        <div className="mt-1 flex justify-between text-xs">
                          <span className="text-gray-500">
                            {150 - (profileData.bio?.length || 0)} caracteres restantes
                          </span>
                          {profileData.bio && profileData.bio.length > 140 && (
                            <span className="text-yellow-600 font-medium">
                              ⚠️ Faltam {150 - (profileData.bio?.length || 0)} caracteres
                            </span>
                          )}
                          {(profileData.bio?.length || 0) > 150 && (
                            <span className="text-red-600 font-bold">
                              ❌ Limite excedido! ({profileData.bio?.length}/150)
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-end pt-4">
                        <button
                          type="submit"
                          disabled={loading || (profileData.bio?.length || 0) > 150}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Salvando...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              {profileData.bio && profileData.bio.length > 150 ? 'Limite Excedido!' : 'Salvar Alterações'}
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-start space-x-6">
                        <img
                          src={user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&size=200`}
                          alt={user.name}
                          className="h-24 w-24 rounded-full border-4 border-white shadow-lg object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-gray-900">{user.name}</h3>
                          {user.socialName && (
                            <p className="text-gray-600 mt-1">
                              <span className="font-medium">Nome Social:</span> {user.socialName}
                            </p>
                          )}
                          <p className="text-gray-600 mt-2">
                            <Mail className="h-4 w-4 inline mr-2" />
                            {user.email}
                          </p>
                          <p className="text-sm text-gray-500 mt-3">
                            <Calendar className="h-3 w-3 inline mr-1" />
                            Membro desde {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>

                      {user.bio && (
                        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                          <div className="flex items-center mb-3">
                            <FileText className="h-5 w-5 text-blue-500 mr-2" />
                            <h4 className="font-semibold text-gray-800">Biografia</h4>
                          </div>
                          <p className="text-gray-700 leading-relaxed">{user.bio}</p>
                          <div className="mt-2 text-right">
                            <span className="text-xs text-gray-500">
                              {user.bio.length}/150 caracteres
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Credenciais */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <Key className="h-6 w-6 text-green-500 mr-2" />
                      <h2 className="text-xl font-semibold text-gray-800">Credenciais</h2>
                    </div>
                    <button
                      onClick={handleSaveCredentials}
                      disabled={loading}
                      className="px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors flex items-center disabled:opacity-50"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Credenciais
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Chave
                        </label>
                        <input
                          type="text"
                          value={newCredential.key}
                          onChange={(e) => setNewCredential({ ...newCredential, key: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="ex: api_key"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Valor
                        </label>
                        <input
                          type="text"
                          value={newCredential.value}
                          onChange={(e) => setNewCredential({ ...newCredential, value: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="ex: sk_live_..."
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={handleAddCredential}
                          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Adicionar
                        </button>
                      </div>
                    </div>

                    {/* Lista de Credenciais */}
                    {Object.keys(credentials).length > 0 ? (
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                          <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-5 font-medium text-gray-700">Chave</div>
                            <div className="col-span-5 font-medium text-gray-700">Valor</div>
                            <div className="col-span-2 font-medium text-gray-700 text-right">Ações</div>
                          </div>
                        </div>
                        <div className="divide-y divide-gray-200">
                          {Object.entries(credentials).map(([key, value]) => (
                            <div key={key} className="px-4 py-3 hover:bg-gray-50">
                              <div className="grid grid-cols-12 gap-4 items-center">
                                <div className="col-span-5">
                                  <code className="text-sm font-mono text-gray-800 bg-gray-100 px-2 py-1 rounded">
                                    {key}
                                  </code>
                                </div>
                                <div className="col-span-5">
                                  <code className="text-sm font-mono text-gray-600 truncate">
                                    {typeof value === 'string' && value.length > 30
                                      ? `${value.substring(0, 30)}...`
                                      : String(value)}
                                  </code>
                                </div>
                                <div className="col-span-2 text-right">
                                  <button
                                    onClick={() => handleRemoveCredential(key)}
                                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                                    title="Remover credencial"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                        <p>Nenhuma credencial adicionada</p>
                        <p className="text-sm mt-1">Adicione suas chaves API e outras credenciais</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Segurança */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                {/* Alterar Senha */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center mb-6">
                    <Lock className="h-6 w-6 text-blue-500 mr-2" />
                    <h2 className="text-xl font-semibold text-gray-800">Alterar Senha</h2>
                  </div>

                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Senha Atual
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword.current ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('current')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword.current ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nova Senha
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword.new ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('new')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword.new ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                        <span className={`flex items-center ${/[A-Z]/.test(passwordData.newPassword) ? 'text-green-600' : 'text-gray-500'}`}>
                          {/[A-Z]/.test(passwordData.newPassword) ? '✓' : '○'} Maiúscula
                        </span>
                        <span className={`flex items-center ${/[a-z]/.test(passwordData.newPassword) ? 'text-green-600' : 'text-gray-500'}`}>
                          {/[a-z]/.test(passwordData.newPassword) ? '✓' : '○'} Minúscula
                        </span>
                        <span className={`flex items-center ${/\d/.test(passwordData.newPassword) ? 'text-green-600' : 'text-gray-500'}`}>
                          {/\d/.test(passwordData.newPassword) ? '✓' : '○'} Número
                        </span>
                        <span className={`flex items-center ${/[!@#$%^&*(),.?":{}|<>]/.test(passwordData.newPassword) ? 'text-green-600' : 'text-gray-500'}`}>
                          {/[!@#$%^&*(),.?":{}|<>]/.test(passwordData.newPassword) ? '✓' : '○'} Especial
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirmar Nova Senha
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword.confirm ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('confirm')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword.confirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      {passwordData.newPassword && passwordData.confirmPassword && (
                        <p className={`text-xs mt-1 ${passwordData.newPassword === passwordData.confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
                          {passwordData.newPassword === passwordData.confirmPassword ? '✓ Senhas coincidem' : '✗ Senhas não coincidem'}
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end pt-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {loading ? 'Alterando...' : 'Alterar Senha'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Autenticação de Dois Fatores */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <Shield className="h-6 w-6 text-purple-500 mr-2" />
                      <div>
                        <h2 className="text-xl font-semibold text-gray-800">Autenticação de Dois Fatores</h2>
                        <p className="text-sm text-gray-600 mt-1">Adicione uma camada extra de segurança à sua conta</p>
                      </div>
                    </div>
                    <button
                      onClick={handleEnable2FA}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      {accountSettings.twoFactorAuth ? 'Desativar' : 'Ativar'} 2FA
                    </button>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <Shield className="h-5 w-5 text-purple-500 mr-2 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-purple-800">Proteja sua conta com 2FA</h4>
                        <p className="text-sm text-purple-700 mt-1">
                          Com a autenticação de dois fatores ativada, você precisará de um código de verificação além da sua senha para fazer login.
                        </p>
                        <ul className="text-sm text-purple-700 mt-2 list-disc list-inside space-y-1">
                          <li>Receba códigos via app autenticador</li>
                          <li>Códigos SMS ou email</li>
                          <li>Backup codes para emergências</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sessões Ativas */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <Globe className="h-6 w-6 text-green-500 mr-2" />
                      <div>
                        <h2 className="text-xl font-semibold text-gray-800">Sessões Ativas</h2>
                        <p className="text-sm text-gray-600 mt-1">Gerencie suas sessões em dispositivos diferentes</p>
                      </div>
                    </div>
                    <button
                      onClick={terminateAllSessions}
                      className="px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Encerrar outras sessões
                    </button>
                  </div>

                  {loadingSessions ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="text-gray-600 mt-2">Carregando sessões...</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {activeSessions.map((session) => (
                        <div
                          key={session.id}
                          className={`flex items-center justify-between p-4 rounded-lg ${session.current ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 border border-gray-200'}`}
                        >
                          <div className="flex items-center space-x-4">
                            <div className={`p-2 rounded-lg ${session.current ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                              {session.device === 'Mobile' ? (
                                <Smartphone className="h-5 w-5" />
                              ) : session.device === 'Tablet' ? (
                                <Monitor className="h-5 w-5" />
                              ) : (
                                <Monitor className="h-5 w-5" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <p className="font-medium text-gray-900">
                                  {session.device} • {session.browser}
                                </p>
                                {session.current && (
                                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                                    Atual
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                IP: {session.ip} • {session.location}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Última atividade: {new Date(session.lastActive).toLocaleString('pt-BR')}
                              </p>
                            </div>
                          </div>
                          {!session.current && (
                            <button
                              onClick={() => terminateSession(session.id)}
                              className="px-3 py-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors text-sm"
                            >
                              Encerrar
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 text-center">
                    <button
                      onClick={loadActiveSessions}
                      className="text-blue-600 hover:text-blue-700 text-sm flex items-center justify-center mx-auto"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Atualizar lista
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Notificações */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center mb-6">
                    <Bell className="h-6 w-6 text-purple-500 mr-2" />
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800">Preferências de Notificação</h2>
                      <p className="text-sm text-gray-600 mt-1">Controle como e quando você recebe notificações</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Email */}
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div>
                        <div className="flex items-center">
                          <Mail className="h-5 w-5 text-blue-500 mr-2" />
                          <p className="font-medium">Notificações por Email</p>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">Receba atualizações importantes por email</p>
                      </div>
                      <button
                        onClick={() => handleNotificationSettingsChange('emailNotifications')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          notificationSettings.emailNotifications ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            notificationSettings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Push */}
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div>
                        <div className="flex items-center">
                          <Bell className="h-5 w-5 text-purple-500 mr-2" />
                          <p className="font-medium">Notificações Push</p>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">Receba notificações no navegador</p>
                      </div>
                      <button
                        onClick={() => handleNotificationSettingsChange('pushNotifications')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          notificationSettings.pushNotifications ? 'bg-purple-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            notificationSettings.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Login Alerts */}
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div>
                        <div className="flex items-center">
                          <Shield className="h-5 w-5 text-green-500 mr-2" />
                          <p className="font-medium">Alertas de Login</p>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">Notificar sobre novos logins na sua conta</p>
                      </div>
                      <button
                        onClick={() => handleNotificationSettingsChange('loginAlerts')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          notificationSettings.loginAlerts ? 'bg-green-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            notificationSettings.loginAlerts ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Security Alerts */}
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div>
                        <div className="flex items-center">
                          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                          <p className="font-medium">Alertas de Segurança</p>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">Notificar sobre atividades suspeitas</p>
                      </div>
                      <button
                        onClick={() => handleNotificationSettingsChange('securityAlerts')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          notificationSettings.securityAlerts ? 'bg-red-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            notificationSettings.securityAlerts ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Product Updates */}
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div>
                        <div className="flex items-center">
                          <Zap className="h-5 w-5 text-yellow-500 mr-2" />
                          <p className="font-medium">Atualizações do Produto</p>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">Notificar sobre novas funcionalidades</p>
                      </div>
                      <button
                        onClick={() => handleNotificationSettingsChange('productUpdates')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          notificationSettings.productUpdates ? 'bg-yellow-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            notificationSettings.productUpdates ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Newsletter */}
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div>
                        <div className="flex items-center">
                          <Mail className="h-5 w-5 text-indigo-500 mr-2" />
                          <p className="font-medium">Newsletter</p>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">Receba novidades e atualizações do EventFlow</p>
                      </div>
                      <button
                        onClick={() => handleNotificationSettingsChange('newsletter')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          notificationSettings.newsletter ? 'bg-indigo-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            notificationSettings.newsletter ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Marketing */}
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div>
                        <div className="flex items-center">
                          <CreditCard className="h-5 w-5 text-pink-500 mr-2" />
                          <p className="font-medium">Emails de Marketing</p>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">Receba ofertas especiais e promoções</p>
                      </div>
                      <button
                        onClick={() => handleNotificationSettingsChange('marketingEmails')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          notificationSettings.marketingEmails ? 'bg-pink-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            notificationSettings.marketingEmails ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Conta */}
            {activeTab === 'account' && (
              <div className="space-y-6">
                {/* Configurações da Conta */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center mb-6">
                    <Settings className="h-6 w-6 text-blue-500 mr-2" />
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800">Configurações da Conta</h2>
                      <p className="text-sm text-gray-600 mt-1">Personalize sua experiência no EventFlow</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Idioma */}
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <Languages className="h-5 w-5 text-blue-500 mr-3" />
                        <div>
                          <p className="font-medium">Idioma</p>
                          <p className="text-sm text-gray-600">Selecione o idioma da interface</p>
                        </div>
                      </div>
                      <select
                        value={accountSettings.language}
                        onChange={(e) => handleAccountSettingsChange('language', e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="pt-BR">Português (Brasil)</option>
                        <option value="en-US">English (US)</option>
                        <option value="es-ES">Español</option>
                      </select>
                    </div>

                    {/* Tema */}
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        {accountSettings.theme === 'light' ? (
                          <Sun className="h-5 w-5 text-yellow-500 mr-3" />
                        ) : (
                          <Moon className="h-5 w-5 text-indigo-500 mr-3" />
                        )}
                        <div>
                          <p className="font-medium">Tema da Interface</p>
                          <p className="text-sm text-gray-600">Escolha entre tema claro ou escuro</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleAccountSettingsChange('theme', 'light')}
                          className={`px-3 py-1 rounded-lg ${accountSettings.theme === 'light' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
                        >
                          Claro
                        </button>
                        <button
                          onClick={() => handleAccountSettingsChange('theme', 'dark')}
                          className={`px-3 py-1 rounded-lg ${accountSettings.theme === 'dark' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
                        >
                          Escuro
                        </button>
                      </div>
                    </div>

                    {/* Logout Automático */}
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <LogOut className="h-5 w-5 text-orange-500 mr-3" />
                        <div>
                          <p className="font-medium">Logout Automático</p>
                          <p className="text-sm text-gray-600">Sair automaticamente após inatividade</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => handleAccountSettingsChange('autoLogout', !accountSettings.autoLogout)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            accountSettings.autoLogout ? 'bg-green-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                              accountSettings.autoLogout ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        <select
                          value={accountSettings.sessionTimeout}
                          onChange={(e) => handleAccountSettingsChange('sessionTimeout', parseInt(e.target.value))}
                          disabled={!accountSettings.autoLogout}
                          className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                        >
                          <option value={15}>15 minutos</option>
                          <option value={30}>30 minutos</option>
                          <option value={60}>1 hora</option>
                          <option value={120}>2 horas</option>
                        </select>
                      </div>
                    </div>

                    {/* Compartilhamento de Dados */}
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <Database className="h-5 w-5 text-purple-500 mr-3" />
                        <div>
                          <p className="font-medium">Compartilhamento de Dados</p>
                          <p className="text-sm text-gray-600">Compartilhar dados anônimos para melhorias</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAccountSettingsChange('dataSharing', !accountSettings.dataSharing)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          accountSettings.dataSharing ? 'bg-purple-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            accountSettings.dataSharing ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end pt-6">
                    <button
                      onClick={handleAccountSettingsUpdate}
                      disabled={loading}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Salvar Configurações
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Migração de Conta */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <ExternalLink className="h-6 w-6 text-green-500 mr-2" />
                      <div>
                        <h2 className="text-xl font-semibold text-gray-800">Migração de Conta</h2>
                        <p className="text-sm text-gray-600 mt-1">Migre seus dados para outro email ou plataforma</p>
                      </div>
                    </div>
                    <button
                      onClick={handleMigrateAccount}
                      className="px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      Iniciar Migração
                    </button>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-800">Processo de migração</h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          A migração de conta transfere todos os seus dados para um novo email ou conta. O processo pode levar alguns minutos.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Exportar Dados */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center mb-6">
                    <Download className="h-6 w-6 text-blue-500 mr-2" />
                    <h2 className="text-xl font-semibold text-gray-800">Exportar Dados</h2>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-blue-500 mr-3" />
                        <div>
                          <p className="font-medium">Exportar Todos os Eventos</p>
                          <p className="text-sm text-gray-600">Baixe um arquivo JSON com todos os seus eventos</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleExportData('events')}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center disabled:opacity-50"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Exportar
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center">
                        <User className="h-5 w-5 text-green-500 mr-3" />
                        <div>
                          <p className="font-medium">Exportar Dados do Perfil</p>
                          <p className="text-sm text-gray-600">Baixe suas informações pessoais em formato JSON</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleExportData('profile')}
                        disabled={loading}
                        className="px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors flex items-center disabled:opacity-50"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Exportar
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center">
                        <HardDrive className="h-5 w-5 text-purple-500 mr-3" />
                        <div>
                          <p className="font-medium">Backup Completo da Conta</p>
                          <p className="text-sm text-gray-600">Exporte todos os seus dados de uma vez (perfil, eventos, configurações)</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleExportData('all')}
                        disabled={loading}
                        className="px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors flex items-center disabled:opacity-50"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Backup Completo
                      </button>
                    </div>
                  </div>
                </div>

                {/* Excluir Conta */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center mb-6">
                    <AlertCircle className="h-6 w-6 text-red-500 mr-2" />
                    <h2 className="text-xl font-semibold text-gray-800">Excluir Conta</h2>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex">
                      <AlertCircle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-red-800">Atenção! Esta ação é irreversível</h4>
                        <p className="text-sm text-red-700 mt-1">
                          Ao excluir sua conta, todos os seus dados serão permanentemente removidos, incluindo:
                        </p>
                        <ul className="text-sm text-red-700 mt-2 list-disc list-inside space-y-1">
                          <li>Seu perfil e informações pessoais</li>
                          <li>Todos os eventos registrados</li>
                          <li>Todas as notificações</li>
                          <li>Credenciais e configurações</li>
                          <li>Sessões ativas</li>
                        </ul>
                        <p className="text-sm font-medium text-red-800 mt-3">
                          ⚠️ Recomendamos fazer um backup completo antes de excluir sua conta.
                        </p>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleDeleteAccount} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Digite sua senha para confirmar
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword.delete ? "text" : "password"}
                          value={deleteData.password}
                          onChange={(e) => setDeleteData({ ...deleteData, password: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('delete')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword.delete ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirme sua senha
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword.deleteConfirm ? "text" : "password"}
                          value={deleteData.confirmPassword}
                          onChange={(e) => setDeleteData({ ...deleteData, confirmPassword: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('deleteConfirm')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword.deleteConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Excluindo...
                          </>
                        ) : (
                          'Excluir Minha Conta Permanentemente'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
