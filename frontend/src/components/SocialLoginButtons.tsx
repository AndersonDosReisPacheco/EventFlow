import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Chrome as Google,
  Github,
  Twitter,
  Linkedin,
  MessageCircle as Discord,
  Facebook,
  Apple,
  Loader2,
  CheckCircle,
  Building2, // Para Microsoft (substituição)
  Mail // Para Apple se não tiver
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

interface SocialLoginButtonsProps {
  type?: 'login' | 'register'
}

const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({
  type = 'login'
}) => {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null)
  const { login } = useAuth()
  const navigate = useNavigate()

  const providers = [
    {
      id: 'google',
      name: 'Google',
      icon: Google,
      color: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 border-red-600',
      demoEmail: 'demo.google@eventflow.com'
    },
    {
      id: 'github',
      name: 'GitHub',
      icon: Github,
      color: 'bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black border-gray-900',
      demoEmail: 'demo.github@eventflow.com'
    },
    {
      id: 'twitter',
      name: 'Twitter',
      icon: Twitter,
      color: 'bg-gradient-to-r from-black to-gray-900 hover:from-gray-900 hover:to-black border-gray-800',
      demoEmail: 'demo.twitter@eventflow.com'
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900 border-blue-800',
      demoEmail: 'demo.linkedin@eventflow.com'
    },
    {
      id: 'discord',
      name: 'Discord',
      icon: Discord,
      color: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-purple-600 hover:to-indigo-700 border-purple-600',
      demoEmail: 'demo.discord@eventflow.com'
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-blue-700',
      demoEmail: 'demo.facebook@eventflow.com'
    },
    {
      id: 'microsoft',
      name: 'Microsoft',
      icon: Building2, // Usando Building2 como substituto
      color: 'bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 border-gray-800',
      demoEmail: 'demo.microsoft@eventflow.com'
    },
    {
      id: 'apple',
      name: 'Apple',
      icon: Apple,
      color: 'bg-gradient-to-r from-black to-gray-900 hover:from-gray-900 hover:to-black border-gray-900',
      demoEmail: 'demo.apple@eventflow.com'
    },
  ]

  const handleSocialLogin = async (provider: string, providerName: string, demoEmail: string) => {
    setLoadingProvider(provider)

    try {
      // Simulação de login social com dados de demonstração
      const demoCredentials = {
        email: demoEmail,
        password: 'demo123'
      }

      // Tenta fazer login com credenciais de demo
      await login(demoCredentials)

      toast.success(
        <div className="flex items-center">
          <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
          <span>{type === 'login' ? 'Login' : 'Cadastro'} com {providerName} realizado!</span>
        </div>
      )

      navigate('/dashboard')
    } catch (error) {
      // Se falhar, mostra sucesso em modo demo
      setTimeout(() => {
        setLoadingProvider(null)
        toast.success(
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
            <span>{type === 'login' ? 'Login' : 'Cadastro'} com {providerName} realizado! (Modo Demo)</span>
          </div>
        )

        // Em produção real, aqui você integraria com backend OAuth
        console.log(`Social ${type} with ${provider} - Integre com backend OAuth`)

        // Para demo, vamos navegar para dashboard automaticamente
        setTimeout(() => {
          navigate('/dashboard')
        }, 1000)
      }, 1000)
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-600" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
            Ou continue com
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {providers.map((provider, index) => {
          const Icon = provider.icon
          const isLoading = loadingProvider === provider.id

          return (
            <motion.button
              key={provider.id}
              type="button"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: isLoading ? 1 : 1.05 }}
              whileTap={{ scale: isLoading ? 1 : 0.95 }}
              onClick={() => handleSocialLogin(provider.id, provider.name, provider.demoEmail)}
              disabled={isLoading}
              className={`
                relative group flex flex-col items-center justify-center p-3 rounded-xl
                transition-all duration-300 text-white font-medium border
                ${provider.color}
                ${isLoading ? 'opacity-80 cursor-not-allowed' : 'shadow-md hover:shadow-lg'}
              `}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Icon className="w-5 h-5 mb-1" />
                  <span className="text-xs">{provider.name}</span>
                </>
              )}

              {/* Efeito de brilho no hover */}
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-20 bg-white transition-opacity duration-300" />
            </motion.button>
          )
        })}
      </div>

      {/* Informações de segurança */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-4 p-3 rounded-lg bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 border border-primary-100 dark:border-primary-800"
      >
        <div className="flex items-center justify-center text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-1" />
              Criptografado
            </span>
            <span className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-blue-500 mr-1" />
              Seguro
            </span>
            <span className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-purple-500 mr-1" />
              Privado
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default SocialLoginButtons
