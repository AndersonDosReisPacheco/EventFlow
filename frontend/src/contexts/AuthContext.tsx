// src/contexts/AuthContext.tsx - VERSÃO SIMPLIFICADA E CORRETA
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';

interface User {
  id: string;
  email: string;
  name: string;
  socialName?: string | null;
  profilePicture?: string | null;
  bio?: string | null;
  credentials?: any;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, socialName?: string) => Promise<void>;
  logout: () => Promise<void>;
  verifyToken: () => Promise<boolean>;
  updateUser: (userData: Partial<User>) => void;
}

// ✅ URL SEM "/api" NO FINAL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ✅ CRIAR INSTÂNCIA DO AXIOS AQUI (igual ao services/api.ts)
const api = axios.create({
  baseURL: API_BASE_URL, // SEM "/api" no final
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token');
  });

  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ INTERCEPTOR PARA ADICIONAR TOKEN
  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        const storedToken = localStorage.getItem('token');
        if (storedToken && config.headers) {
          config.headers.Authorization = `Bearer ${storedToken}`;
        }
        return config;
      }
    );

    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
          if (!location.pathname.includes('/login')) {
            navigate('/login', { replace: true });
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [navigate, location]);

  // ✅ VERIFICA TOKEN AO CARREGAR
  useEffect(() => {
    const verifyStoredToken = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const response = await api.get('/api/auth/verify');
          if (response.data.valid && response.data.user) {
            setUser(response.data.user);
            setToken(storedToken);
            localStorage.setItem('user', JSON.stringify(response.data.user));
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setIsLoading(false);
    };

    verifyStoredToken();
  }, []);

  const verifyToken = async (): Promise<boolean> => {
    try {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) return false;
      const response = await api.get('/api/auth/verify');
      return response.data.valid;
    } catch (error) {
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      console.log('🔐 Tentando login...');

      // ✅ USAR API INSTANCE COM "/api/auth/login"
      const response = await api.post('/api/auth/login', { email, password });
      console.log('✅ Login response:', response.data);

      if (response.data.success && response.data.token) {
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setToken(token);
        setUser(user);
        toast.success('Login realizado com sucesso!');

        const from = location.state?.from?.pathname || '/dashboard';
        console.log('🔄 Redirecionando para:', from);
        navigate(from, { replace: true });
      } else {
        throw new Error(response.data.error || 'Login failed');
      }
    } catch (error: any) {
      console.error('❌ Login error:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        toast.error('Credenciais inválidas');
      } else if (error.code === 'ERR_NETWORK') {
        toast.error('Erro de conexão. Verifique se o backend está online.');
      } else {
        toast.error(error.response?.data?.error || 'Erro ao fazer login');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, socialName?: string): Promise<void> => {
    try {
      setIsLoading(true);
      console.log('📝 Tentando registro...');

      const response = await api.post('/api/auth/register', {
        name, email, password, socialName
      });

      console.log('✅ Register response:', response.data);

      if (response.data.success && response.data.token) {
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setToken(token);
        setUser(user);
        toast.success('Conta criada com sucesso!');
        console.log('🔄 Redirecionando para /dashboard');
        navigate('/dashboard', { replace: true });
      } else {
        throw new Error(response.data.error || 'Registration failed');
      }
    } catch (error: any) {
      console.error('❌ Registration error:', error.response?.data || error.message);
      if (error.response?.status === 400) {
        toast.error('Dados inválidos');
      } else if (error.response?.status === 409) {
        toast.error('Email já cadastrado');
      } else {
        toast.error(error.response?.data?.error || 'Erro ao criar conta');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
      toast.success('Logout realizado com sucesso');
      navigate('/login', { replace: true });
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    verifyToken,
    updateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ✅ EXPORTAR A INSTÂNCIA DO AXIOS PARA USO EM OUTROS ARQUIVOS
export { api as authApi };
