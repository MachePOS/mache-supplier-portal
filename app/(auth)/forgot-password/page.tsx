'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/contexts/LanguageContext'

const translations = {
  title: { en: 'Reset Password', fr: 'Réinitialiser le mot de passe', ht: 'Reyinisyalize modpas', es: 'Restablecer contraseña' },
  subtitle: { en: 'Enter your email and we\'ll send you a reset link', fr: 'Entrez votre email et nous vous enverrons un lien', ht: 'Antre imèl ou e nou pral voye ou yon lyen', es: 'Ingresa tu correo y te enviaremos un enlace' },
  email: { en: 'Email', fr: 'Email', ht: 'Imèl', es: 'Correo electrónico' },
  emailPlaceholder: { en: 'you@company.com', fr: 'vous@entreprise.com', ht: 'ou@konpayi.com', es: 'tu@empresa.com' },
  sendLink: { en: 'Send Reset Link', fr: 'Envoyer le lien', ht: 'Voye lyen', es: 'Enviar enlace' },
  sending: { en: 'Sending...', fr: 'Envoi...', ht: 'Ap voye...', es: 'Enviando...' },
  backToLogin: { en: 'Back to login', fr: 'Retour à la connexion', ht: 'Retounen nan koneksyon', es: 'Volver al inicio de sesión' },
  successTitle: { en: 'Check your email', fr: 'Vérifiez votre email', ht: 'Tcheke imèl ou', es: 'Revisa tu correo' },
  successMessage: { en: 'We\'ve sent a password reset link to your email address.', fr: 'Nous avons envoyé un lien de réinitialisation.', ht: 'Nou voye yon lyen reyinisyalizasyon nan imèl ou.', es: 'Hemos enviado un enlace de restablecimiento.' },
  tryAgain: { en: 'Try again', fr: 'Réessayer', ht: 'Eseye ankò', es: 'Intentar de nuevo' },
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const { t } = useLanguage()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (resetError) {
      setError(resetError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('successTitle', translations.successTitle)}</h2>
            <p className="text-gray-600 mb-6">{t('successMessage', translations.successMessage)}</p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setSuccess(false)
                  setEmail('')
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {t('tryAgain', translations.tryAgain)}
              </button>
              <Link
                href="/login"
                className="block w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-center"
              >
                {t('backToLogin', translations.backToLogin)}
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-600 mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{t('title', translations.title)}</h1>
          <p className="text-gray-600 mt-2">{t('subtitle', translations.subtitle)}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {t('email', translations.email)}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('emailPlaceholder', translations.emailPlaceholder)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('sending', translations.sending) : t('sendLink', translations.sendLink)}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {t('backToLogin', translations.backToLogin)}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
