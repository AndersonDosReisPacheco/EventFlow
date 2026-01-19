
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import Login from './pages/Login';
import Register from './pages/Register';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { Toaster } from 'react-hot-toast';
import {
  LayoutDashboard,
  User,
  Bell,
  Settings as SettingsIcon,
  LogOut,
  Moon,
  Sun,
  Activity,
  Home
} from 'lucide-react';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
};

//  COMPONENTE QUE VERIFICA AUTENTICAÇÃO EM TODAS AS ROTAS
const AuthChecker: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    //  SE NÃO ESTIVER CARREGANDO E NÃO TEM USUÁRIO, FORÇA LOGIN
    if (!isLoading && !user) {
      console.log(' AuthChecker: Nenhum usuário autenticado');

      //  SE NÃO ESTIVER EM LOGIN/REGISTER, REDIRECIONA PARA LOGIN
      if (location.pathname !== '/login' && location.pathname !== '/register') {
        console.log(` Redirecionando de ${location.pathname} para /login`);
        navigate('/login', { replace: true });
      }
    }
  }, [user, isLoading, location.pathname, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  //  SE NÃO TEM USUÁRIO E NÃO ESTÁ EM PÁGINA PÚBLICA, NÃO RENDERIZA NADA
  if (!user && location.pathname !== '/login' && location.pathname !== '/register') {
    return null;
  }

  return <>{children}</>;
};

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  //  NÃO MOSTRAR NAVBAR NAS PÁGINAS DE LOGIN/REGISTER OU SE NÃO TIVER USUÁRIO
  if (location.pathname === '/login' || location.pathname === '/register' || !user) {
    return null;
  }

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
              EventFlow
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            <Link
              to="/dashboard"
              className={`px-3 py-2 rounded-lg transition-colors ${location.pathname === '/dashboard' ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300' : 'hover:text-primary-600 dark:hover:text-primary-400'}`}
            >
              <div className="flex items-center space-x-1">
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </div>
            </Link>
            <Link
              to="/profile"
              className={`px-3 py-2 rounded-lg transition-colors ${location.pathname === '/profile' ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300' : 'hover:text-primary-600 dark:hover:text-primary-400'}`}
            >
              <div className="flex items-center space-x-1">
                <User className="w-4 h-4" />
                <span>Perfil</span>
              </div>
            </Link>
            <Link
              to="/notifications"
              className={`px-3 py-2 rounded-lg transition-colors ${location.pathname === '/notifications' ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300' : 'hover:text-primary-600 dark:hover:text-primary-400'}`}
            >
              <div className="flex items-center space-x-1">
                <Bell className="w-4 h-4" />
                <span>Notificações</span>
              </div>
            </Link>
            <Link
              to="/settings"
              className={`px-3 py-2 rounded-lg transition-colors ${location.pathname === '/settings' ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300' : 'hover:text-primary-600 dark:hover:text-primary-400'}`}
            >
              <div className="flex items-center space-x-1">
                <SettingsIcon className="w-4 h-4" />
                <span>Configurações</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600 dark:text-gray-300 hidden md:block">
              <span className="font-medium">{user?.name}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">({user?.email})</span>
            </div>

            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              title={`Alternar para tema ${theme === 'dark' ? 'claro' : 'escuro'}`}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700" />
              )}
            </button>

            <button
              onClick={() => logout()}
              className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all flex items-center space-x-2 shadow-md hover:shadow-lg"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

//  ROTAS PROTEGIDAS - SÓ ACESSÍVEIS COM LOGIN
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  //  SE NÃO TEM USUÁRIO, SEMPRE VAI PARA LOGIN
  if (!user) {
    console.log(' ProtectedRoute: Acesso negado - redirecionando para login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

//  ROTAS PÚBLICAS - SÓ ACESSÍVEIS SEM LOGIN
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  //  SE TEM USUÁRIO, VAI PARA DASHBOARD (APENAS SE JÁ ESTIVER LOGADO)
  if (user) {
    console.log(' PublicRoute: Já autenticado - redirecionando para dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Componente principal
const AppContent: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
      <AuthChecker>
        <Navbar />

        <Routes>
          {/*  PÁGINAS PÚBLICAS (só acessíveis SEM login) */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

          {/*  PÁGINAS PROTEGIDAS (só acessíveis COM login) */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

          {/*  REDIRECIONAMENTOS */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthChecker>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1f2937',
            color: '#fff',
            borderRadius: '12px',
            padding: '16px',
          },
          success: {
            style: {
              background: '#059669',
            },
          },
          error: {
            style: {
              background: '#dc2626',
            },
          },
        }}
      />
    </div>
  );
};

export default App;
