import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

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
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, socialName?: string) => Promise<void>;
  logout: () => void;
  verifyToken: () => Promise<boolean>;
  updateUser: (userData: Partial<User>) => void;
}

// ✅ CORREÇÃO CRÍTICA: URL SEM "/api" no final
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ✅ Configuração do axios com baseURL correta
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
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
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // ✅ Interceptor para adicionar token automaticamente
  api.interceptors.request.use(
    (config) => {
      const storedToken = localStorage.getItem('token');
      if (storedToken && config.headers) {
        config.headers.Authorization = `Bearer ${storedToken}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // ✅ Interceptor para tratar erros de autenticação
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        if (!window.location.pathname.includes('/login')) {
          navigate('/login');
        }
      }
      return Promise.reject(error);
    }
  );

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      verifyTokenOnLoad(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const verifyTokenOnLoad = async (storedToken: string) => {
    try {
      const response = await api.get('/api/auth/verify', {
        headers: { Authorization: `Bearer ${storedToken}` }
      });

      if (response.data.valid && response.data.user) {
        setUser(response.data.user);
        setToken(response.data.token || storedToken);
        localStorage.setItem('token', response.data.token || storedToken);
      } else {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

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

      // ✅ CORREÇÃO: Usando "/api/auth/login" (com "/api/")
      const response = await api.post('/api/auth/login', {
        email,
        password
      });

      console.log('Login response:', response.data); // Debug

      if (response.data.success && response.data.token) {
        const { token, user } = response.data;

        localStorage.setItem('token', token);
        setToken(token);
        setUser(user);

        toast.success('Login realizado com sucesso!');
        navigate('/dashboard'); // ✅ Redireciona para dashboard
      } else {
        throw new Error(response.data.error || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error details:', error.response?.data || error.message);

      // ✅ Mensagens de erro mais específicas
      if (error.response?.status === 401) {
        toast.error('Credenciais inválidas. Verifique email e senha.');
      } else if (error.response?.status === 404) {
        toast.error('Serviço de autenticação indisponível. Tente novamente.');
      } else if (error.code === 'ERR_NETWORK') {
        toast.error('Erro de conexão. Verifique sua internet.');
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

      console.log('📤 Enviando registro para:', `${API_URL}/api/auth/register`);
      console.log('📝 Dados:', { name, email, password: '***', socialName });

      const response = await api.post('/api/auth/register', {
        name,
        email,
        password,
        socialName
      });

      console.log('✅ Resposta do registro:', response.data);

      if (response.data.success && response.data.token) {
        const { token, user } = response.data;

        localStorage.setItem('token', token);
        setToken(token);
        setUser(user);

        toast.success('Conta criada com sucesso!');
        navigate('/dashboard'); // ✅ Redireciona para dashboard
      } else {
        throw new Error(response.data.error || 'Registration failed');
      }
    } catch (error: any) {
      console.error('Registration error details:', error.response?.data || error.message);

      // ✅ Mensagens de erro mais específicas
      if (error.response?.status === 400) {
        const errorMsg = error.response.data.error || error.response.data.details?.message;
        if (errorMsg?.includes('Email') || errorMsg?.includes('email')) {
          toast.error('Este email já está cadastrado.');
        } else if (errorMsg?.includes('Nome') || errorMsg?.includes('name')) {
          toast.error('Nome inválido ou muito curto.');
        } else {
          toast.error(errorMsg || 'Dados inválidos. Verifique as informações.');
        }
      } else if (error.response?.status === 409) {
        toast.error('Este email já está em uso.');
      } else if (error.code === 'ERR_NETWORK') {
        toast.error('Erro de conexão. Verifique sua internet.');
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
      setToken(null);
      setUser(null);
      toast.success('Logout realizado com sucesso');
      navigate('/login');
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    verifyToken,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
