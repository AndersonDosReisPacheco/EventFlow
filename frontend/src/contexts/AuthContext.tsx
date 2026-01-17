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
  token: string | null;  // ADICIONE token
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  verifyToken: () => Promise<boolean>;  // ADICIONE verifyToken
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      verifyToken(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  const verifyToken = async (token: string) => {
    try {
      const response = await axios.get(`${API_URL}/auth/verify`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.valid && response.data.user) {
        setUser(response.data.user);
        localStorage.setItem('token', response.data.token || token);
      } else {
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });

      if (response.data.success && response.data.token) {
        const { token, user } = response.data;

        localStorage.setItem('token', token);
        setUser(user);

        toast.success('Login realizado com sucesso!');

        // AGORA REDIRECIONA CORRETAMENTE
        navigate('/');
      } else {
        throw new Error(response.data.error || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, socialName?: string): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${API_URL}/auth/register`, {
        name,
        email,
        password,
        socialName
      });

      if (response.data.success && response.data.token) {
        const { token, user } = response.data;

        localStorage.setItem('token', token);
        setUser(user);

        toast.success('Conta criada com sucesso!');

        // REDIRECIONA APÓS REGISTRO
        navigate('/');
      } else {
        throw new Error(response.data.error || 'Registration failed');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Logout realizado com sucesso');
    navigate('/login');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
