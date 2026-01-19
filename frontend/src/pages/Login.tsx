
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import SocialLoginButtons from '../components/SocialLoginButtons'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  Shield,
  AlertCircle,
  CheckCircle,
  UserCog,
  Loader2,
  PartyPopper,
  Sparkles,
  Key,
  User,
  Home
} from 'lucide-react'
import toast from 'react-hot-toast'

//  SCHEMA DE VALIDAÇÃO
const loginSchema = z.object({
  email: z.string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),
  password: z.string()
    .min(1, 'Senha é obrigatória')
    .min(6, 'Senha deve ter no mínimo 6 caracteres'),
})

//  TIPO DOS DADOS DO FORMULÁRIO
type LoginFormData = z.infer<typeof loginSchema>

const Login: React.FC = () => {
  //  ESTADOS
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false)
  const [redirectingToDashboard, setRedirectingToDashboard] = useState(false)
  const [loginAttempts, setLoginAttempts] = useState(0)

  //  HOOKS
  const navigate = useNavigate()
  const location = useLocation()
  const { login, user, isLoading: authLoading } = useAuth()

  //  FORM HOOK
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
    clearErrors,
    setValue,
    watch
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const emailValue = watch('email')
  const passwordValue = watch('password')

  //  EFEITO: VERIFICA SE JÁ ESTÁ AUTENTICADO
  useEffect(() => {
    if (user && !authLoading) {
      console.log(' Usuário já autenticado, redirecionando para dashboard...')
      setRedirectingToDashboard(true)

      toast.success(
        <div className="flex items-center">
          <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
          <div>
            <p className="font-medium">Já autenticado!</p>
            <p className="text-sm">Redirecionando para dashboard...</p>
          </div>
        </div>,
        { duration: 2000 }
      )

      const timer = setTimeout(() => {
        navigate('/dashboard', { replace: true })
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [user, authLoading, navigate])

  //  EFEITO: VERIFICA SE VEIO DO CADASTRO
  useEffect(() => {
    console.log(' Estado da localização no Login:', location.state)

    if (location.state?.fromRegister) {
      const registeredEmail = location.state.registeredEmail
      const message = location.state.message

      console.log(' Login: Veio do cadastro! Email:', registeredEmail)

      if (registeredEmail) {
        //  PREENCHE AUTOMATICAMENTE O EMAIL
        setValue('email', registeredEmail)
        console.log(' Email pré-preenchido do cadastro:', registeredEmail)
      }

      //  MOSTRA MENSAGEM DE BOAS-VINDAS
      setShowWelcomeMessage(true)

      toast.success(
        <div className="flex items-center">
          <PartyPopper className="w-5 h-5 mr-2 text-yellow-500" />
          <div>
            <p className="font-medium">{message || 'Cadastro realizado com sucesso!'}</p>
            <p className="text-sm">Faça login para acessar sua conta</p>
          </div>
        </div>,
        {
          duration: 5000,
          icon: ''
        }
      )

      //  LIMPA O STATE PARA NÃO REPETIR
      const timer = setTimeout(() => {
        navigate(location.pathname, { replace: true, state: {} })
        setShowWelcomeMessage(false)
      }, 5000)

      return () => clearTimeout(timer)
    }

    //  VERIFICA SE TEM EMAIL SALVO NO LOCALSTORAGE (LEMBRAR DE MIM)
    const rememberedEmail = localStorage.getItem('rememberedEmail')
    const shouldRemember = localStorage.getItem('rememberMe') === 'true'

    if (rememberedEmail && shouldRemember && !location.state?.fromRegister) {
      console.log(' Email lembrado encontrado:', rememberedEmail)
      setValue('email', rememberedEmail)
      setRememberMe(true)
    }
  }, [location, navigate, setValue])

  //  EFEITO: VERIFICA TENTATIVAS DE LOGIN
  useEffect(() => {
    if (loginAttempts >= 3) {
      toast.error(
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
          <div>
            <p className="font-medium">Muitas tentativas falhas</p>
            <p className="text-sm">Aguarde 30 segundos antes de tentar novamente</p>
          </div>
        </div>,
        { duration: 5000 }
      )

      const timer = setTimeout(() => {
        setLoginAttempts(0)
        toast.success('Você pode tentar novamente agora.', { duration: 3000 })
      }, 30000)

      return () => clearTimeout(timer)
    }
  }, [loginAttempts])

  //  FUNÇÃO PRINCIPAL DE LOGIN
  const onSubmit = async (data: LoginFormData) => {
    if (isLoading || redirectingToDashboard) return

    // LIMPA ERROS ANTERIORES
    clearErrors()
    setIsLoading(true)

    try {
      console.log(' Tentando login...')

      //  SALVA EMAIL SE "LEMBRAR DE MIM" ESTIVER MARCADO
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true')
        localStorage.setItem('rememberedEmail', data.email)
      } else {
        localStorage.removeItem('rememberMe')
        localStorage.removeItem('rememberedEmail')
      }

      //  EXECUTA LOGIN
      await login(data.email, data.password)

      //  RESETA CONTADOR DE TENTATIVAS
      setLoginAttempts(0)

      //  O REDIRECIONAMENTO É FEITO DENTRO DA FUNÇÃO login DO AUTHCONTEXT

    } catch (error: any) {
      console.error('Erro no login:', error)

      //  INCREMENTA CONTADOR DE TENTATIVAS
      setLoginAttempts(prev => prev + 1)

      //  REMOVE NOTIFICAÇÕES DUPLICADAS
      toast.dismiss()

      if (error.response?.status === 401) {
        toast.error(
          <div className="flex items-center">
            <Key className="w-5 h-5 mr-2 text-red-500" />
            <div>
              <p className="font-medium">Email ou senha incorretos</p>
              <p className="text-sm">Verifique suas credenciais</p>
            </div>
          </div>,
          { duration: 4000 }
        )

        setError('email', {
          type: 'manual',
          message: 'Credenciais inválidas'
        })
        setError('password', {
          type: 'manual',
          message: 'Credenciais inválidas'
        })
      } else if (error.response?.status === 423) {
        toast.error('Conta bloqueada temporariamente. Entre em contato com o suporte.', {
          duration: 5000,
          icon: ''
        })
      } else if (error.response?.status === 429) {
        toast.error('Muitas tentativas. Aguarde 1 minuto antes de tentar novamente.', {
          duration: 5000,
          icon: ''
        })
      } else if (error.code === 'ERR_NETWORK') {
        toast.error('Erro de conexão. Verifique sua internet e tente novamente.', {
          duration: 5000,
          icon: ''
        })
      } else if (error.response?.data?.error) {
        const errorMsg = error.response.data.error.toLowerCase()
        if (errorMsg.includes('not found') || errorMsg.includes('não encontrado')) {
          toast.error('Usuário não encontrado. Verifique o email informado.')
        } else if (errorMsg.includes('inactive') || errorMsg.includes('inativo')) {
          toast.error('Conta inativa. Entre em contato com o suporte.')
        } else if (errorMsg.includes('locked') || errorMsg.includes('bloqueada')) {
          toast.error('Conta temporariamente bloqueada por segurança.')
        } else if (errorMsg.includes('verification') || errorMsg.includes('verificação')) {
          toast.error('Email não verificado. Verifique sua caixa de entrada.')
        } else {
          toast.error(error.response.data.error)
        }
      } else {
        toast.error('Erro ao fazer login. Tente novamente em alguns instantes.', {
          duration: 4000,
          icon: ''
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  //  FUNÇÃO DE LOGIN DEMO
  const handleDemoLogin = async () => {
    if (isLoading || redirectingToDashboard) return

    toast.dismiss()
    setIsLoading(true)

    try {
      //  LIMPA O FORMULÁRIO PRIMEIRO
      reset({
        email: 'demo@eventflow.com',
        password: 'demo123'
      })

      //  AGUARDA UM POUCO PARA ANIMAÇÃO
      await new Promise(resolve => setTimeout(resolve, 500))

      //  EXECUTA LOGIN
      await login('demo@eventflow.com', 'demo123')

      toast.success(
        <div className="flex items-center">
          <Sparkles className="w-5 h-5 mr-2 text-yellow-500" />
          <div>
            <p className="font-medium">Bem-vindo ao modo demonstração!</p>
            <p className="text-sm">Aproveite para explorar o sistema</p>
          </div>
        </div>,
        {
          duration: 4000,
          icon: ''
        }
      )
    } catch (error: any) {
      console.error('Erro no login demo:', error)

      if (error.response?.status === 401) {
        toast.error('Credenciais de demonstração inválidas. Contate o suporte.', {
          icon: ''
        })
      } else if (error.code === 'ERR_NETWORK') {
        toast.error('Erro de conexão. Verifique sua internet.')
      } else if (error.response?.data?.error) {
        toast.error(error.response.data.error)
      } else {
        toast.error('Erro ao acessar modo demonstração.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  //  FUNÇÃO DE LOGIN ADMIN
  const handleAdminLogin = async () => {
    if (isLoading || redirectingToDashboard) return

    toast.dismiss()
    setIsLoading(true)

    try {
      //  LIMPA O FORMULÁRIO PRIMEIRO
      reset({
        email: 'admin@eventflow.com',
        password: 'admin123'
      })

      //  AGUARDA UM POUCO PARA ANIMAÇÃO
      await new Promise(resolve => setTimeout(resolve, 500))

      //  EXECUTA LOGIN
      await login('admin@eventflow.com', 'admin123')

      toast.success(
        <div className="flex items-center">
          <Shield className="w-5 h-5 mr-2 text-blue-500" />
          <div>
            <p className="font-medium">Bem-vindo como Administrador!</p>
            <p className="text-sm">Acesso completo ao sistema</p>
          </div>
        </div>,
        {
          duration: 4000,
          icon: ''
        }
      )
    } catch (error: any) {
      console.error('Erro no login admin:', error)

      if (error.response?.status === 401) {
        toast.error('Credenciais de administrador inválidas.', {
          icon: ''
        })
      } else if (error.code === 'ERR_NETWORK') {
        toast.error('Erro de conexão. Verifique sua internet.')
      } else if (error.response?.data?.error) {
        toast.error(error.response.data.error)
      } else {
        toast.error('Erro ao acessar como administrador.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  //  FUNÇÃO PARA LIMPAR FORMULÁRIO
  const handleClearForm = () => {
    reset()
    clearErrors()
    setRememberMe(false)
    localStorage.removeItem('rememberMe')
    localStorage.removeItem('rememberedEmail')
    toast.success('Formulário limpo!', { duration: 2000 })
  }

  // SE ESTIVER REDIRECIONANDO PARA DASHBOARD
  if (redirectingToDashboard) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-300 text-lg">Redirecionando para dashboard...</p>
          <p className="text-gray-500 text-sm mt-2">Aguarde um momento</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        {/*  MENSAGEM DE BOAS-VINDAS DO CADASTRO */}
        {showWelcomeMessage && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="mb-6 p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800"
          >
            <div className="flex items-center">
              <PartyPopper className="w-5 h-5 text-green-600 dark:text-green-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-300">
                  Cadastro realizado com sucesso!
                </p>
                <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                  Faça login para acessar sua conta
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/*  BANNER DE TENTATIVAS FALHAS */}
        {loginAttempts >= 2 && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-6 p-4 rounded-xl bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border border-red-200 dark:border-red-800"
          >
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-300">
                  {loginAttempts} tentativa(s) falha(s)
                </p>
                <p className="text-xs text-red-700 dark:text-red-400 mt-1">
                  {loginAttempts >= 3
                    ? 'Aguarde 30 segundos para tentar novamente'
                    : 'Verifique suas credenciais'
                  }
                </p>
              </div>
            </div>
          </motion.div>
        )}

        <div className="glass-card rounded-3xl p-8 shadow-2xl">
          {/* HEADER */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-block">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-500 mb-4 shadow-lg"
              >
                <Shield className="w-8 h-8 text-white" />
              </motion.div>
            </Link>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Bem-vindo de volta
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Entre na sua conta do EventFlow
            </p>
          </div>

          {/* DEMO LOGIN BANNER */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6 p-4 rounded-xl bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 border border-primary-100 dark:border-primary-800"
          >
            <div className="flex items-center">
              <Sparkles className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-primary-800 dark:text-primary-300">
                  Modo Demonstração
                </p>
                <p className="text-xs text-primary-600 dark:text-primary-400 mt-1">
                  Teste o sistema com credenciais pré-definidas
                </p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                onClick={handleDemoLogin}
                disabled={isLoading || redirectingToDashboard || loginAttempts >= 3}
                className="py-2 px-4 rounded-lg bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 text-white text-sm font-medium transition-all duration-300 disabled:opacity-50 shadow-md hover:shadow-lg flex items-center justify-center"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <User className="w-4 h-4 mr-1" />
                    Usuário Demo
                  </>
                )}
              </button>
              <button
                onClick={handleAdminLogin}
                disabled={isLoading || redirectingToDashboard || loginAttempts >= 3}
                className="py-2 px-4 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-sm font-medium transition-all duration-300 disabled:opacity-50 shadow-md hover:shadow-lg flex items-center justify-center"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-1" />
                    Administrador
                  </>
                )}
              </button>
            </div>
          </motion.div>

          {/* FORM */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* EMAIL FIELD */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={`input-primary pl-10 ${errors.email ? 'border-danger-500 focus:ring-danger-500' : ''}`}
                  placeholder="seu@email.com"
                  {...register('email')}
                  disabled={isLoading || redirectingToDashboard || loginAttempts >= 3}
                  onChange={() => errors.email && clearErrors('email')}
                />
                {emailValue && (
                  <button
                    type="button"
                    onClick={() => setValue('email', '')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={isLoading}
                  >
                    <AlertCircle className="h-5 w-5" />
                  </button>
                )}
              </div>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-danger-600 dark:text-danger-400"
                >
                  {errors.email.message}
                </motion.p>
              )}
            </div>

            {/* PASSWORD FIELD */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Senha
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 hover:underline transition-colors"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={`input-primary pl-10 pr-10 ${errors.password ? 'border-danger-500 focus:ring-danger-500' : ''}`}
                  placeholder="••••••••"
                  {...register('password')}
                  disabled={isLoading || redirectingToDashboard || loginAttempts >= 3}
                  onChange={() => errors.password && clearErrors('password')}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading || redirectingToDashboard || loginAttempts >= 3}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  )}
                </button>
              </div>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-danger-600 dark:text-danger-400"
                >
                  {errors.password.message}
                </motion.p>
              )}

              {/* PASSWORD STRENGTH INDICATOR */}
              {passwordValue && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Força da senha:</span>
                    <span className={`text-xs font-medium ${
                      passwordValue.length >= 8 ? 'text-green-600 dark:text-green-400' :
                      passwordValue.length >= 6 ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-red-600 dark:text-red-400'
                    }`}>
                      {passwordValue.length >= 8 ? 'Forte' : passwordValue.length >= 6 ? 'Média' : 'Fraca'}
                    </span>
                  </div>
                  <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        passwordValue.length >= 8 ? 'bg-green-500' :
                        passwordValue.length >= 6 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${Math.min((passwordValue.length / 12) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* REMEMBER ME & CLEAR */}
            <div className="flex items-center justify-between">
              <div className="flex items-center group cursor-pointer">
                <div className="relative">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="peer h-5 w-5 rounded border-2 border-gray-300 bg-white transition-all checked:border-primary-500 checked:bg-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:checked:border-primary-500 dark:checked:bg-primary-500 cursor-pointer"
                    disabled={isLoading || redirectingToDashboard || loginAttempts >= 3}
                  />
                  <CheckCircle className="pointer-events-none absolute left-1 top-1 h-3 w-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                </div>
                <label
                  htmlFor="remember-me"
                  className="ml-3 text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors"
                >
                  <span className="font-medium">Manter conectado</span>
                  <span className="ml-1 text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300">
                    (por 7 dias)
                  </span>
                </label>
              </div>

              <button
                type="button"
                onClick={handleClearForm}
                disabled={isLoading || redirectingToDashboard || (!emailValue && !passwordValue)}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Limpar
              </button>
            </div>

            {/* SUBMIT BUTTON */}
            <motion.button
              type="submit"
              disabled={isLoading || redirectingToDashboard || loginAttempts >= 3}
              whileHover={{ scale: (isLoading || redirectingToDashboard || loginAttempts >= 3) ? 1 : 1.02 }}
              whileTap={{ scale: (isLoading || redirectingToDashboard || loginAttempts >= 3) ? 1 : 0.98 }}
              className="btn-primary w-full flex items-center justify-center shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Entrando...
                </>
              ) : redirectingToDashboard ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Redirecionando...
                </>
              ) : loginAttempts >= 3 ? (
                <>
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Aguarde 30s
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Entrar na conta
                </>
              )}
            </motion.button>
          </form>

          {/* SOCIAL LOGIN */}
          <div className="mt-6">
            <SocialLoginButtons
              type="login"
              disabled={isLoading || redirectingToDashboard || loginAttempts >= 3}
            />
          </div>

          {/* REGISTER LINK */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Não tem uma conta?{' '}
              <Link
                to="/register"
                className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 hover:underline transition-colors"
              >
                Cadastre-se agora
              </Link>
            </p>
          </div>

          {/* HOME LINK */}
          <div className="mt-4 text-center">
            <Link
              to="/"
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
            >
              <Home className="w-4 h-4 mr-1" />
              Voltar para início
            </Link>
          </div>

          {/* SECURITY INFO */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
              <Shield className="w-3 h-3 mr-1 text-primary-500" />
              <span>Seus dados estão protegidos com criptografia de ponta a ponta</span>
            </div>

            {/* LOGIN ATTEMPTS INFO */}
            {loginAttempts > 0 && (
              <div className="mt-2 text-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Tentativas falhas: {loginAttempts}/3
                </span>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

export default Login
