
import React, { createContext, useState, useContext, useEffect, ReactNode, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, AlertCircle, LogOut } from 'lucide-react';

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
  clearAuthData: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://eventflow-backend-tsf2.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
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
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  //  REFs para controle
  const hasInitialized = useRef(false);
  const isProcessingAuth = useRef(false);

  //  FUNÇÃO PARA LIMPAR DADOS DE AUTENTICAÇÃO
  const clearAuthData = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('rememberedEmail');
    setToken(null);
    setUser(null);
  };

  //  INTERCEPTOR PARA REQUESTS
  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
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

    //  INTERCEPTOR PARA RESPONSES - TRATAMENTO DE ERROS
    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        //  SE FOR ERRO 401 (NÃO AUTORIZADO)
        if (error.response?.status === 401 && !originalRequest._retry) {
          console.log(' Token expirado/inválido (401)');

          if (isProcessingAuth.current) {
            return Promise.reject(error);
          }

          isProcessingAuth.current = true;

          try {
            // TENTA RENOVAR O TOKEN SE TIVER UM REFRESH TOKEN
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
              const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
                refreshToken
              });

              if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
                originalRequest._retry = true;
                return api(originalRequest);
              }
            }
          } catch (refreshError) {
            console.log(' Falha ao renovar token');
          }

          //  SE NÃO CONSEGUIR RENOVAR, FAZ LOGOUT
          clearAuthData();

          //  REDIRECIONA PARA LOGIN SE NÃO ESTIVER EM PÁGINA PÚBLICA
          if (location.pathname !== '/login' && location.pathname !== '/register') {
            toast.error(
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
                <div>
                  <p className="font-medium">Sessão expirada</p>
                  <p className="text-sm">Faça login novamente</p>
                </div>
              </div>,
              { duration: 4000 }
            );
            navigate('/login', { replace: true });
          }
        }

        //  SE FOR ERRO 403 (PROIBIDO)
        if (error.response?.status === 403) {
          toast.error('Acesso negado. Permissões insuficientes.');
        }

        //  SE FOR ERRO 429 (MUITAS REQUISIÇÕES)
        if (error.response?.status === 429) {
          toast.error('Muitas tentativas. Aguarde um momento.');
        }

        isProcessingAuth.current = false;
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [navigate, location.pathname]);

  //  VERIFICAÇÃO INICIAL DE AUTENTICAÇÃO
  useEffect(() => {
    const initializeAuth = async () => {
      if (hasInitialized.current || isProcessingAuth.current) return;

      console.log(' Iniciando verificação de autenticação...');
      hasInitialized.current = true;
      isProcessingAuth.current = true;

      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        console.log(` Token no localStorage: ${storedToken ? 'EXISTE' : 'NÃO EXISTE'}`);
        console.log(` Página atual: ${location.pathname}`);

        // SE NÃO TEM TOKEN, FORÇA LOGIN
        if (!storedToken) {
          console.log(' Nenhum token encontrado - Forçando tela de login');
          clearAuthData();

          if (location.pathname !== '/login' && location.pathname !== '/register' && location.pathname !== '/') {
            console.log(' Redirecionando para /login...');
            navigate('/login', { replace: true });
          }
        } else {
          //  SE TEM TOKEN, VERIFICA SE É VÁLIDO
          console.log(' Verificando token com backend...');

          try {
            // TENTA UMA REQUISIÇÃO SIMPLES PARA VERIFICAR O TOKEN
            const response = await api.get('/api/auth/verify', {
              headers: { Authorization: `Bearer ${storedToken}` },
              timeout: 5000
            });

            if (response.data.valid && response.data.user) {
              console.log(' Token válido! Mantendo usuário logado');

              if (storedUser) {
                try {
                  const parsedUser = JSON.parse(storedUser);
                  setUser(parsedUser);
                  setToken(storedToken);
                } catch (parseError) {
                  console.error(' Erro ao parsear usuário:', parseError);
                  clearAuthData();
                }
              }

              //  SE ESTÁ EM LOGIN/REGISTER, REDIRECIONA PARA DASHBOARD
              if ((location.pathname === '/login' || location.pathname === '/register') && !isProcessingAuth.current) {
                console.log(' Já autenticado - Redirecionando para dashboard...');
                setTimeout(() => {
                  navigate('/dashboard', { replace: true });
                }, 100);
              }
            } else {
              throw new Error('Token inválido');
            }
          } catch (verifyError) {
            console.log(' Token inválido ou erro na verificação:', verifyError);
            clearAuthData();

            if (location.pathname !== '/login' && location.pathname !== '/register') {
              navigate('/login', { replace: true });
            }
          }
        }
      } catch (error) {
        console.error(' Erro na inicialização:', error);
        clearAuthData();

        if (location.pathname !== '/login' && location.pathname !== '/register') {
          navigate('/login', { replace: true });
        }
      } finally {
        setIsLoading(false);
        isProcessingAuth.current = false;
        console.log(' Verificação inicial concluída');
      }
    };

    if (!hasInitialized.current) {
      initializeAuth();
    }

    //  RESETA O FLAG QUANDO A PÁGINA MUDA
    return () => {
      if (location.pathname === '/login' || location.pathname === '/register') {
        hasInitialized.current = false;
      }
    };
  }, [navigate, location.pathname]);

  //  FUNÇÃO DE LOGIN - COMPLETA E FUNCIONAL
  const login = async (email: string, password: string): Promise<void> => {
    if (isProcessingAuth.current) return;

    isProcessingAuth.current = true;
    setIsLoading(true);

    try {
      console.log(` Tentando login para: ${email}`);

      //  FAZ A REQUISIÇÃO DE LOGIN
      const response = await api.post('/api/auth/login', { email, password });

      console.log(' Resposta do login:', response.data);

      if (response.data.success && response.data.token) {
        const { token, user } = response.data;

        //  SALVA O TOKEN E USUÁRIO
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setToken(token);
        setUser(user);

        toast.success(
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
            <div>
              <p className="font-medium">Login realizado com sucesso!</p>
              <p className="text-sm">Redirecionando para dashboard...</p>
            </div>
          </div>,
          {
            duration: 3000,
            icon: ''
          }
        );

        console.log(' Login bem-sucedido!');

        //  AGUARDA UM POUCO ANTES DE REDIRECIONAR
        await new Promise(resolve => setTimeout(resolve, 1000));

        //  REDIRECIONA PARA DASHBOARD
        console.log(' Redirecionando para /dashboard...');
        navigate('/dashboard', { replace: true });

      } else {
        throw new Error(response.data.error || 'Falha no login');
      }
    } catch (error: any) {
      console.error(' Erro no login:', error);

      //  LIMPA DADOS EM CASO DE ERRO
      clearAuthData();

      //  TRATAMENTO DE ERROS ESPECÍFICOS
      if (error.response?.status === 401) {
        toast.error(
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
            <div>
              <p className="font-medium">Email ou senha incorretos</p>
              <p className="text-sm">Verifique suas credenciais</p>
            </div>
          </div>,
          { duration: 4000 }
        );
      } else if (error.response?.status === 423) {
        toast.error('Conta bloqueada. Entre em contato com o suporte.');
      } else if (error.response?.status === 429) {
        toast.error('Muitas tentativas. Aguarde 5 minutos.');
      } else if (error.code === 'ERR_NETWORK') {
        toast.error('Erro de conexão. Verifique sua internet.');
      } else if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Erro ao fazer login. Tente novamente.');
      }

      throw error;
    } finally {
      setIsLoading(false);
      isProcessingAuth.current = false;
    }
  };

  //  FUNÇÃO DE REGISTRO - SEMPRE REDIRECIONA PARA LOGIN
  const register = async (name: string, email: string, password: string, socialName?: string): Promise<void> => {
    if (isProcessingAuth.current) return;

    isProcessingAuth.current = true;
    setIsLoading(true);

    try {
      console.log(' Iniciando processo de cadastro...');

      //  FAZ O CADASTRO NO BACKEND
      const response = await api.post('/api/auth/register', {
        name, email, password, socialName
      });

      console.log(' Resposta do cadastro:', response.data);

      if (response.data.success) {
        //  MOSTRA MENSAGEM DE SUCESSO COM REDIRECIONAMENTO
        toast.success(
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
            <div>
              <p className="font-medium">Cadastro realizado com sucesso!</p>
              <p className="text-sm">Redirecionando para login em 3 segundos...</p>
            </div>
          </div>,
          {
            duration: 4000,
            icon: ''
          }
        );

        console.log(' Cadastro bem-sucedido! Redirecionando para login...');

        //  IMPORTANTE: NÃO SALVA O TOKEN, NÃO SALVA O USER, NÃO SETA O STATE
        //  O USUÁRIO DEVE FAZER LOGIN MANUALMENTE

        //  AGUARDA 3 SEGUNDOS PARA USUÁRIO VER A MENSAGEM
        await new Promise(resolve => setTimeout(resolve, 3000));

        //  GARANTE QUE NÃO HÁ DADOS DE SESSÃO (SEGURANÇA EXTRA)
        clearAuthData();

        //  REDIRECIONA PARA LOGIN (NÃO PARA DASHBOARD)
        console.log(' Redirecionando para /login...');
        navigate('/login', {
          replace: true,
          state: {
            fromRegister: true,
            registeredEmail: email,
            message: 'Cadastro realizado com sucesso! Faça login para continuar.'
          }
        });

      } else {
        throw new Error(response.data.error || 'Falha no cadastro');
      }
    } catch (error: any) {
      console.error(' Erro no cadastro:', error);

      //  LIMPA QUALQUER DADO EM CASO DE ERRO
      clearAuthData();

      //  TRATAMENTO DE ERROS ESPECÍFICOS
      if (error.response?.status === 400) {
        toast.error('Dados inválidos. Verifique as informações.');
      } else if (error.response?.status === 409) {
        toast.error('Este email já está cadastrado. Tente fazer login.');
      } else if (error.code === 'ERR_NETWORK') {
        toast.error('Erro de conexão. Verifique sua internet.');
      } else if (error.response?.data?.error) {
        const errorMsg = error.response.data.error.toLowerCase();
        if (errorMsg.includes('senha') && errorMsg.includes('fraca')) {
          toast.error('Senha muito fraca. Use letras, números e caracteres especiais.');
        } else if (errorMsg.includes('email') && errorMsg.includes('inválido')) {
          toast.error('Email inválido. Use um email válido.');
        } else {
          toast.error(error.response.data.error);
        }
      } else {
        toast.error('Erro ao criar conta. Tente novamente.');
      }

      throw error;
    } finally {
      setIsLoading(false);
      isProcessingAuth.current = false;
    }
  };

  //  FUNÇÃO DE LOGOUT - COMPLETA
  const logout = async (): Promise<void> => {
    if (isProcessingAuth.current) return;

    isProcessingAuth.current = true;

    try {
      console.log(' Executando logout...');

      //  TENTA LOGOUT NO BACKEND
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          await api.post('/api/auth/logout', {}, {
            headers: { Authorization: `Bearer ${storedToken}` },
            timeout: 5000
          });
        } catch (apiError) {
          console.log(' Logout do backend falhou, continuando...');
        }
      }
    } catch (error) {
      console.error(' Erro no logout do backend:', error);
    } finally {
      //  SEMPRE LIMPA OS DADOS LOCAIS
      clearAuthData();

      toast.success(
        <div className="flex items-center">
          <LogOut className="w-5 h-5 mr-2 text-green-500" />
          <div>
            <p className="font-medium">Logout realizado</p>
            <p className="text-sm">Redirecionando para login...</p>
          </div>
        </div>,
        { duration: 3000 }
      );

      console.log(' Logout bem-sucedido!');

      //  REDIRECIONA PARA LOGIN
      navigate('/login', { replace: true });

      isProcessingAuth.current = false;
    }
  };

  //  FUNÇÃO PARA VERIFICAR TOKEN
  const verifyToken = async (): Promise<boolean> => {
    try {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) return false;

      const response = await api.get('/api/auth/verify', {
        headers: { Authorization: `Bearer ${storedToken}` },
        timeout: 5000
      });

      return response.data.valid === true;
    } catch (error) {
      console.log(' Erro na verificação do token:', error);
      return false;
    }
  };

  //  FUNÇÃO PARA ATUALIZAR DADOS DO USUÁRIO
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  //  VALOR DO CONTEXTO
  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
    verifyToken,
    updateUser,
    clearAuthData
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
