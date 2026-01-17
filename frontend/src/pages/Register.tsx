// D:\Meu_Projetos_Pessoais\EventFlow\frontend\src\pages\Register.tsx
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
  CheckCircle,
  AlertCircle,
  ShieldCheck
} from 'lucide-react'
import toast from 'react-hot-toast'

// Schema de validação
const registerSchema = z.object({
  name: z.string()
    .min(1, 'Nome é obrigatório')
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(50, 'Nome deve ter no máximo 50 caracteres'),
  email: z.string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),
  password: z.string()
    .min(1, 'Senha é obrigatória')
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número'),
  confirmPassword: z.string()
    .min(1, 'Confirmação de senha é obrigatória'),
  socialName: z.string()
    .max(100, 'Nome social muito longo')
    .optional()
    .nullable(),
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
  const navigate = useNavigate()
  const { register: registerUser } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      socialName: '',
    },
  })

  const password = watch('password')

  const getPasswordStrength = (password: string) => {
    if (!password) return { score: 0, label: 'Vazia', color: 'gray', textColor: 'text-gray-500' }

    let score = 0
    if (password.length >= 8) score++
    if (/[A-Z]/.test(password)) score++
    if (/[a-z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++

    const levels = [
      { label: 'Muito fraca', color: 'danger', textColor: 'text-danger-600 dark:text-danger-400' },
      { label: 'Fraca', color: 'danger', textColor: 'text-danger-600 dark:text-danger-400' },
      { label: 'Regular', color: 'warning', textColor: 'text-warning-600 dark:text-warning-400' },
      { label: 'Boa', color: 'warning', textColor: 'text-warning-600 dark:text-warning-400' },
      { label: 'Forte', color: 'success', textColor: 'text-success-600 dark:text-success-400' },
      { label: 'Muito forte', color: 'success', textColor: 'text-success-600 dark:text-success-400' },
    ]

    return levels[Math.min(score, levels.length - 1)]
  }

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)

    try {
      // Usar a função register do AuthContext
      await registerUser(data.name, data.email, data.password, data.socialName || undefined)
      toast.success('Conta criada com sucesso!')

    } catch (error: any) {
      console.error('Erro no registro:', error)

      if (error.response?.status === 409 || error.response?.status === 400) {
        if (error.response?.data?.error?.includes('email') || error.response?.data?.error?.includes('Email')) {
          toast.error('Este email já está cadastrado')
        } else if (error.response?.data?.error) {
          // Corrigido: Tratar mensagem de erro interno do servidor
          if (error.response.data.error.includes('Erro interno do servidor') ||
              error.response.data.error.includes('Internal server error')) {
            toast.error('Usuário, email ou credenciais já cadastradas')
          } else {
            toast.error(error.response.data.error)
          }
        } else {
          toast.error('Usuário, email ou credenciais já cadastradas')
        }
      } else if (error.response?.data?.error) {
        // Corrigido: Tratar mensagem de erro interno do servidor
        if (error.response.data.error.includes('Erro interno do servidor') ||
            error.response.data.error.includes('Internal server error')) {
          toast.error('Usuário, email ou credenciais já cadastradas')
        } else {
          toast.error(error.response.data.error)
        }
      } else {
        toast.error('Usuário, email ou credenciais já cadastradas')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const strength = getPasswordStrength(password || '')

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
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Criar Conta
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Junte-se ao EventFlow e comece a monitorar seus eventos
            </p>
          </div>

          {/* Security Banner */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-6 p-4 rounded-xl bg-gradient-to-r from-success-50 to-primary-50 dark:from-success-900/20 dark:to-primary-900/20 border border-success-100 dark:border-success-800"
          >
            <div className="flex items-start">
              <CheckCircle className="w-5 h-5 text-success-600 dark:text-success-400 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-success-800 dark:text-success-300">
                  Segurança de Nível Empresarial
                </p>
                <p className="text-xs text-success-600 dark:text-success-400 mt-1">
                  Todos os eventos são criptografados e auditados com tecnologia de ponta
                </p>
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nome Completo
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
                  {...register('name')}
                  disabled={isLoading}
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
                Nome Social <span className="text-gray-500 text-xs">(Opcional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="socialName"
                  type="text"
                  className="input-primary pl-10"
                  placeholder="Como você gostaria de ser chamado"
                  {...register('socialName')}
                  disabled={isLoading}
                />
              </div>
            </div>

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
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Senha
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

              {/* Password Strength Meter */}
              {password && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3"
                >
                  <div className="mb-2">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium">Força da senha:</span>
                      <span className={`font-bold ${strength.textColor}`}>
                        {strength.label}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-1">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(strength.score / 5) * 100}%` }}
                        transition={{ duration: 0.5 }}
                        className={`h-full bg-${strength.color}-500`}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Password Requirements */}
              <div className="mt-3 space-y-1">
                <div className="flex items-center text-xs">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center mr-2 ${password?.length >= 8 ? 'bg-success-100 text-success-600' : 'bg-gray-100 text-gray-400'}`}>
                    {password?.length >= 8 ? <CheckCircle className="w-3 h-3" /> : '•'}
                  </div>
                  <span className={password?.length >= 8 ? 'text-success-600' : 'text-gray-500'}>
                    Mínimo 8 caracteres
                  </span>
                </div>
                <div className="flex items-center text-xs">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center mr-2 ${/[A-Z]/.test(password || '') ? 'bg-success-100 text-success-600' : 'bg-gray-100 text-gray-400'}`}>
                    {/[A-Z]/.test(password || '') ? <CheckCircle className="w-3 h-3" /> : '•'}
                  </div>
                  <span className={/[A-Z]/.test(password || '') ? 'text-success-600' : 'text-gray-500'}>
                    Pelo menos uma letra maiúscula
                  </span>
                </div>
                <div className="flex items-center text-xs">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center mr-2 ${/[0-9]/.test(password || '') ? 'bg-success-100 text-success-600' : 'bg-gray-100 text-gray-400'}`}>
                    {/[0-9]/.test(password || '') ? <CheckCircle className="w-3 h-3" /> : '•'}
                  </div>
                  <span className={/[0-9]/.test(password || '') ? 'text-success-600' : 'text-gray-500'}>
                    Pelo menos um número
                  </span>
                </div>
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

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirmar Senha
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
                  {...register('confirmPassword')}
                  disabled={isLoading}
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

            {/* Terms and Conditions */}
            <div className="flex items-start group cursor-pointer">
              <div className="relative mt-1">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="peer h-4 w-4 rounded border-2 border-gray-300 bg-white checked:border-primary-500 checked:bg-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:checked:border-primary-500 dark:checked:bg-primary-500 cursor-pointer"
                  disabled={isLoading}
                />
                <CheckCircle className="pointer-events-none absolute left-0.5 top-0.5 h-3 w-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
              </div>
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700 dark:text-gray-300 cursor-pointer group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">
                Concordo com os{' '}
                <Link to="/terms" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 underline">
                  Termos de Serviço
                </Link>{' '}
                e{' '}
                <Link to="/privacy" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 underline">
                  Política de Privacidade
                </Link>
              </label>
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
                  Criando conta...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Criar minha conta
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>

            </div>
          </div>

          {/* Social Registration */}
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
                Entre aqui
              </Link>
            </p>
          </div>

          {/* Security Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700"
          >
            <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center">
                <ShieldCheck className="w-3 h-3 mr-2 text-primary-500" />
                <span>Criptografia SSL/TLS</span>
              </div>
              <div className="flex items-center">
                <AlertCircle className="w-3 h-3 mr-2 text-success-500" />
                <span>Backup diário</span>
              </div>
              <div className="flex items-center">
                <Lock className="w-3 h-3 mr-2 text-purple-500" />
                <span>2FA Opcional</span>
              </div>
              <div className="flex items-center">
                <Eye className="w-3 h-3 mr-2 text-warning-500" />
                <span>Auditoria completa</span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

export default Register
