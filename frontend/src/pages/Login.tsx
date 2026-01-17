// D:\Meu_Projetos_Pessoais\EventFlow\frontend\src\pages\Login.tsx
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
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
  CheckCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

// Schema de validação
const loginSchema = z.object({
  email: z.string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),
  password: z.string()
    .min(1, 'Senha é obrigatória')
    .min(6, 'Senha deve ter no mínimo 6 caracteres'),
})

// Tipo dos dados do formulário
type LoginFormData = z.infer<typeof loginSchema>

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)

    try {
      // Usar a função login do AuthContext
      await login(data.email, data.password)

      // Se "Manter conectado" estiver marcado, salva no localStorage
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true')
        localStorage.setItem('rememberedEmail', data.email)
      } else {
        localStorage.removeItem('rememberMe')
        localStorage.removeItem('rememberedEmail')
      }

      toast.success('Login realizado com sucesso!')

    } catch (error: any) {
      console.error('Erro no login:', error)

      if (error.response?.status === 401) {
        setError('email', {
          type: 'manual',
          message: 'Credenciais inválidas'
        })
        setError('password', {
          type: 'manual',
          message: 'Credenciais inválidas'
        })
        toast.error('Credenciais inválidas')
      } else if (error.response?.status === 429) {
        toast.error('Muitas tentativas. Aguarde um momento.')
      } else if (error.response?.data?.error) {
        // Corrigido: Tratar mensagem de erro interno do servidor
        if (error.response.data.error.includes('Erro interno do servidor') ||
            error.response.data.error.includes('Internal server error')) {
          toast.error('Credenciais inválidas')
        } else {
          toast.error(error.response.data.error)
        }
      } else {
        toast.error('Credenciais inválidas')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    setIsLoading(true)
    try {
      await login('demo@eventflow.com', 'demo123')
      toast.success('Bem-vindo ao modo demonstração!')
    } catch (error: any) {
      if (error.response?.data?.error) {
        // Corrigido: Tratar mensagem de erro interno do servidor
        if (error.response.data.error.includes('Erro interno do servidor') ||
            error.response.data.error.includes('Internal server error')) {
          toast.error('Credenciais inválidas')
        } else {
          toast.error(error.response.data.error)
        }
      } else {
        toast.error('Credenciais inválidas')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdminLogin = async () => {
    setIsLoading(true)
    try {
      await login('admin@eventflow.com', 'admin123')
      toast.success('Bem-vindo como Administrador!')
    } catch (error: any) {
      if (error.response?.data?.error) {
        // Corrigido: Tratar mensagem de erro interno do servidor
        if (error.response.data.error.includes('Erro interno do servidor') ||
            error.response.data.error.includes('Internal server error')) {
          toast.error('Credenciais inválidas')
        } else {
          toast.error(error.response.data.error)
        }
      } else {
        toast.error('Credenciais inválidas')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Carrega email lembrado se existir
  React.useEffect(() => {
    const remembered = localStorage.getItem('rememberMe')
    const rememberedEmail = localStorage.getItem('rememberedEmail')

    if (remembered === 'true' && rememberedEmail) {
      setRememberMe(true)
      reset({ email: rememberedEmail, password: '' })
    }
  }, [reset])

  return (
    // ADICIONADO: Container principal para centralizar
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <div className="glass-card rounded-3xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-500 mb-4 shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Bem-vindo de volta
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Entre na sua conta do EventFlow
            </p>
          </div>

          {/* Demo Login Banner */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6 p-4 rounded-xl bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 border border-primary-100 dark:border-primary-800"
          >
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-3" />
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
                disabled={isLoading}
                className="py-2 px-4 rounded-lg bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 text-white text-sm font-medium transition-all duration-300 disabled:opacity-50 shadow-md hover:shadow-lg"
              >
                {isLoading ? 'Entrando...' : 'Usuário Demo'}
              </button>
              <button
                onClick={handleAdminLogin}
                disabled={isLoading}
                className="py-2 px-4 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-sm font-medium transition-all duration-300 disabled:opacity-50 shadow-md hover:shadow-lg"
              >
                {isLoading ? 'Entrando...' : 'Administrador'}
              </button>
            </div>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
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
                  disabled={isLoading}
                />
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

            {/* Password Field */}
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
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
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
            </div>

            {/* Remember Me */}
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
                    disabled={isLoading}
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

              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: rememberMe ? 1 : 0.5 }}
                className="flex items-center text-xs text-primary-600 dark:text-primary-400"
              >
                <motion.div
                  animate={rememberMe ? {
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5]
                  } : {}}
                  transition={rememberMe ? {
                    duration: 2,
                    repeat: Infinity
                  } : {}}
                  className="w-2 h-2 rounded-full bg-primary-500 mr-1"
                />
                <span className={rememberMe ? 'font-semibold' : ''}>
                  {rememberMe ? 'Lembrando você' : 'Lembrar neste dispositivo'}
                </span>
              </motion.div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              className="btn-primary w-full flex items-center justify-center shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Entrando...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Entrar na conta
                </>
              )}
            </motion.button>
          </form>

          {/* Social Login */}
          <div className="mt-6">
            <SocialLoginButtons type="login" />
          </div>

          {/* Register Link */}
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

          {/* Security Info */}
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
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

export default Login
