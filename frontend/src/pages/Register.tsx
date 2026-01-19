
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import SocialLoginButtons from '../components/SocialLoginButtons'
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  Shield,
  AlertCircle,
  CheckCircle,
  Loader2,
  ArrowLeft,
  Sparkles,
  PartyPopper
} from 'lucide-react'
import toast from 'react-hot-toast'

// Schema de validação
const registerSchema = z.object({
  name: z.string()
    .min(1, 'Nome é obrigatório')
    .min(3, 'Nome deve ter pelo menos 3 caracteres'),
  socialName: z.string().optional(),
  email: z.string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),
  password: z.string()
    .min(1, 'Senha é obrigatória')
    .min(6, 'Senha deve ter no mínimo 6 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número'),
  confirmPassword: z.string()
    .min(1, 'Confirmação de senha é obrigatória'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
})

// Tipo dos dados do formulário
type RegisterFormData = z.infer<typeof registerSchema>

const Register: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false) //  NOVO ESTADO
  const navigate = useNavigate()
  const { register } = useAuth()

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    clearErrors
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      socialName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const password = watch('password')

  const onSubmit = async (data: RegisterFormData) => {
    //  LIMPA ERROS ANTERIORES
    clearErrors()
    setIsLoading(true)
    setIsRedirecting(false)

    try {
      console.log(' Iniciando cadastro...')

      //  EXECUTA CADASTRO
      await register(data.name, data.email, data.password, data.socialName || undefined)

      //  O REDIRECIONAMENTO É FEITO DENTRO DA FUNÇÃO register DO AUTHCONTEXT
      //  MAS AQUI MOSTRAMOS A MENSAGEM DE REDIRECIONAMENTO
      setIsRedirecting(true)

      toast.success(
        <div className="flex items-center">
          <PartyPopper className="w-5 h-5 mr-2 text-yellow-500" />
          <div>
            <p className="font-medium">Cadastro realizado com sucesso!</p>
            <p className="text-sm">Redirecionando para login...</p>
          </div>
        </div>,
        {
          duration: 4000,
          icon: ''
        }
      )

    } catch (error: any) {
      console.error('Erro no cadastro:', error)
      setIsRedirecting(false)

      //  REMOVE NOTIFICAÇÕES DUPLICADAS
      toast.dismiss()

      if (error.response?.status === 409) {
        toast.error('Este email já está cadastrado. Tente fazer login.', {
          duration: 5000,
          icon: ''
        })
      } else if (error.response?.status === 400) {
        toast.error('Dados inválidos. Verifique as informações.', {
          duration: 4000,
          icon: ''
        })
      } else if (error.code === 'ERR_NETWORK') {
        toast.error('Erro de conexão. Verifique sua internet e tente novamente.', {
          duration: 5000,
          icon: ''
        })
      } else if (error.response?.data?.error) {
        const errorMsg = error.response.data.error.toLowerCase()
        if (errorMsg.includes('weak') || errorMsg.includes('fraca')) {
          toast.error('Senha muito fraca. Use letras, números e caracteres especiais.')
        } else if (errorMsg.includes('invalid') || errorMsg.includes('inválido')) {
          toast.error('Dados inválidos fornecidos.')
        } else {
          toast.error(error.response.data.error)
        }
      } else {
        toast.error('Erro ao criar conta. Tente novamente em alguns instantes.', {
          duration: 4000,
          icon: ''
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoRegister = async () => {
    //  PREENCHE COM DADOS DE DEMONSTRAÇÃO
    reset({
      name: 'Usuário Demo',
      email: `demo${Date.now()}@eventflow.com`,
      password: 'Demo@123',
      confirmPassword: 'Demo@123',
    })

    toast.success('Dados de demonstração preenchidos!', {
      icon: '',
      duration: 3000
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        {/*  BANNER DE REDIRECIONAMENTO */}
        {isRedirecting && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="mb-6 p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800"
          >
            <div className="flex items-center">
              <Loader2 className="w-5 h-5 text-green-600 dark:text-green-400 mr-3 animate-spin" />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-300">
                  Cadastro realizado!
                </p>
                <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                  Redirecionando para login em 3 segundos...
                </p>
              </div>
            </div>
          </motion.div>
        )}

        <div className="glass-card rounded-3xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-500 mb-4 shadow-lg">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Criar Nova Conta
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Junte-se ao EventFlow
            </p>
          </div>

          {/* Demo Register Banner */}
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
                  Cadastro Rápido
                </p>
                <p className="text-xs text-primary-600 dark:text-primary-400 mt-1">
                  Preencha automaticamente com dados de teste
                </p>
              </div>
            </div>

            <button
              onClick={handleDemoRegister}
              disabled={isLoading}
              className="mt-3 w-full py-2 px-4 rounded-lg bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 text-white text-sm font-medium transition-all duration-300 disabled:opacity-50 shadow-md hover:shadow-lg flex items-center justify-center"
            >
              <User className="w-4 h-4 mr-2" />
              Preencher com Dados Demo
            </button>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nome Completo *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  className={`input-primary pl-10 ${errors.name ? 'border-danger-500 focus:ring-danger-500' : ''}`}
                  placeholder="Seu nome completo"
                  {...registerField('name')}
                  disabled={isLoading}
                  onChange={() => errors.name && clearErrors('name')}
                />
              </div>
              {errors.name && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-danger-600 dark:text-danger-400"
                >
                  {errors.name.message}
                </motion.p>
              )}
            </div>

            {/* Social Name Field */}
            <div>
              <label htmlFor="socialName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nome Social (Opcional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="socialName"
                  type="text"
                  className="input-primary pl-10"
                  placeholder="Como prefere ser chamado"
                  {...registerField('socialName')}
                  disabled={isLoading}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Este nome será exibido no seu perfil
              </p>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email *
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
                  {...registerField('email')}
                  disabled={isLoading}
                  onChange={() => errors.email && clearErrors('email')}
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
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Senha *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`input-primary pl-10 pr-10 ${errors.password ? 'border-danger-500 focus:ring-danger-500' : ''}`}
                  placeholder="••••••••"
                  {...registerField('password')}
                  disabled={isLoading}
                  onChange={() => errors.password && clearErrors('password')}
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

              {/* Password Requirements */}
              <div className="mt-3 grid grid-cols-2 gap-2">
                {[
                  { condition: password?.length >= 6, text: '6+ caracteres' },
                  { condition: /[A-Z]/.test(password || ''), text: 'Letra maiúscula' },
                  { condition: /[0-9]/.test(password || ''), text: 'Número' },
                  { condition: /[^A-Za-z0-9]/.test(password || ''), text: 'Caractere especial' },
                ].map((req, idx) => (
                  <div key={idx} className="flex items-center space-x-1">
                    {req.condition ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-gray-400" />
                    )}
                    <span className={`text-xs ${req.condition ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                      {req.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirmar Senha *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`input-primary pl-10 pr-10 ${errors.confirmPassword ? 'border-danger-500 focus:ring-danger-500' : ''}`}
                  placeholder="••••••••"
                  {...registerField('confirmPassword')}
                  disabled={isLoading}
                  onChange={() => errors.confirmPassword && clearErrors('confirmPassword')}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-danger-600 dark:text-danger-400"
                >
                  {errors.confirmPassword.message}
                </motion.p>
              )}
            </div>

            {/* Important Notice */}
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30 rounded-xl">
              <div className="flex">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    <span className="font-medium">Atenção:</span> Após o cadastro, você será redirecionado para a tela de login para fazer seu primeiro acesso.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading || isRedirecting}
              whileHover={{ scale: (isLoading || isRedirecting) ? 1 : 1.02 }}
              whileTap={{ scale: (isLoading || isRedirecting) ? 1 : 0.98 }}
              className="btn-primary w-full flex items-center justify-center shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Criando conta...
                </>
              ) : isRedirecting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Redirecionando...
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5 mr-2" />
                  Criar Conta
                </>
              )}
            </motion.button>
          </form>

          {/* Social Register */}
          <div className="mt-6">
            <SocialLoginButtons type="register" />
          </div>

          {/* Login Link */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Já tem uma conta?{' '}
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 hover:underline transition-colors"
              >
                Faça login
              </Link>
            </p>
          </div>

          {/* Back Link */}
          <div className="mt-4 text-center">
            <Link
              to="/"
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Voltar para início
            </Link>
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

export default Register
