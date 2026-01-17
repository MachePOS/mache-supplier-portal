'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/contexts/LanguageContext'

const translations = {
  title: { en: 'Supplier Login', fr: 'Connexion fournisseur', ht: 'Konekte kòm founisè', es: 'Inicio de sesión' },
  subtitle: { en: 'Access your supplier dashboard', fr: 'Accédez à votre tableau de bord', ht: 'Jwenn aksè nan tablo bò ou', es: 'Accede a tu panel' },
  email: { en: 'Email', fr: 'Email', ht: 'Imèl', es: 'Correo electrónico' },
  emailPlaceholder: { en: 'you@company.com', fr: 'vous@entreprise.com', ht: 'ou@konpayi.com', es: 'tu@empresa.com' },
  password: { en: 'Password', fr: 'Mot de passe', ht: 'Modpas', es: 'Contraseña' },
  signIn: { en: 'Sign In', fr: 'Connexion', ht: 'Konekte', es: 'Iniciar sesión' },
  signingIn: { en: 'Signing in...', fr: 'Connexion en cours...', ht: 'Ap konekte...', es: 'Iniciando sesión...' },
  noAccount: { en: "Don't have an account?", fr: "Vous n'avez pas de compte?", ht: 'Ou pa gen yon kont?', es: '¿No tienes una cuenta?' },
  signUp: { en: 'Apply to become a supplier', fr: 'Postuler pour devenir fournisseur', ht: 'Aplike pou vin founisè', es: 'Solicitar ser proveedor' },
  forgotPassword: { en: 'Forgot password?', fr: 'Mot de passe oublié?', ht: 'Bliye modpas?', es: '¿Olvidaste tu contraseña?' },
}

export default function SupplierLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { t } = useLanguage()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (!data.user) {
      setError('Login failed')
      setLoading(false)
      return
    }

    // Check if user is a supplier
    const { data: supplierUser } = await supabase
      .from('supplier_users')
      .select('supplier_id, supplier:platform_suppliers(status)')
      .eq('auth_user_id', data.user.id)
      .single()

    if (!supplierUser) {
      // Maybe they signed up but supplier_user wasn't created
      // Check if there's a pending supplier with their email
      const { data: supplier } = await supabase
        .from('platform_suppliers')
        .select('id, status')
        .eq('contact_email', email)
        .single()

      if (supplier) {
        if (supplier.status === 'pending') {
          router.push('/pending')
          return
        } else if (supplier.status === 'rejected') {
          setError('Your application was not approved. Please contact support.')
          setLoading(false)
          return
        } else if (supplier.status === 'suspended') {
          setError('Your account has been suspended. Please contact support.')
          setLoading(false)
          return
        }
      } else {
        setError('No supplier account found. Please sign up first.')
        setLoading(false)
        return
      }
    }

    // Check supplier status
    const supplierStatus = (supplierUser?.supplier as any)?.status
    if (supplierStatus === 'pending') {
      router.push('/pending')
      return
    } else if (supplierStatus === 'rejected') {
      setError('Your application was not approved. Please contact support.')
      setLoading(false)
      return
    } else if (supplierStatus === 'suspended') {
      setError('Your account has been suspended. Please contact support.')
      setLoading(false)
      return
    }

    // Redirect to dashboard
    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-800 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-4">
              <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{t('title', translations.title)}</h1>
            <p className="text-gray-500 mt-2">{t('subtitle', translations.subtitle)}</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {t('email', translations.email)}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder={t('emailPlaceholder', translations.emailPlaceholder)}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {t('password', translations.password)}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div className="flex items-center justify-end">
              <Link href="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700">
                {t('forgotPassword', translations.forgotPassword)}
              </Link>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? t('signingIn', translations.signingIn) : t('signIn', translations.signIn)}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {t('noAccount', translations.noAccount)}{' '}
              <Link href="/signup" className="font-medium text-primary-600 hover:text-primary-700">
                {t('signUp', translations.signUp)}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
