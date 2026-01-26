'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/contexts/LanguageContext'
import PasswordStrength, { checkPasswordStrength } from '@/components/PasswordStrength'

const translations = {
  title: { en: 'Set New Password', fr: 'Définir un nouveau mot de passe', ht: 'Mete yon nouvo modpas', es: 'Establecer nueva contraseña' },
  subtitle: { en: 'Enter your new password below', fr: 'Entrez votre nouveau mot de passe', ht: 'Antre nouvo modpas ou anba a', es: 'Ingresa tu nueva contraseña' },
  password: { en: 'New Password', fr: 'Nouveau mot de passe', ht: 'Nouvo modpas', es: 'Nueva contraseña' },
  confirmPassword: { en: 'Confirm Password', fr: 'Confirmer le mot de passe', ht: 'Konfime modpas', es: 'Confirmar contraseña' },
  passwordPlaceholder: { en: 'Enter new password', fr: 'Entrez le nouveau mot de passe', ht: 'Antre nouvo modpas', es: 'Ingresa nueva contraseña' },
  confirmPlaceholder: { en: 'Confirm new password', fr: 'Confirmez le mot de passe', ht: 'Konfime nouvo modpas', es: 'Confirma nueva contraseña' },
  updatePassword: { en: 'Update Password', fr: 'Mettre à jour', ht: 'Mete ajou modpas', es: 'Actualizar contraseña' },
  updating: { en: 'Updating...', fr: 'Mise à jour...', ht: 'Ap mete ajou...', es: 'Actualizando...' },
  passwordMismatch: { en: 'Passwords do not match', fr: 'Les mots de passe ne correspondent pas', ht: 'Modpas yo pa menm', es: 'Las contraseñas no coinciden' },
  passwordTooShort: { en: 'Password must be at least 8 characters with uppercase, lowercase and number', fr: 'Le mot de passe doit comporter au moins 8 caractères avec majuscule, minuscule et chiffre', ht: 'Modpas dwe gen omwen 8 karaktè ak majiskil, miniskil ak nimewo', es: 'La contraseña debe tener al menos 8 caracteres con mayúscula, minúscula y número' },
  successTitle: { en: 'Password Updated', fr: 'Mot de passe mis à jour', ht: 'Modpas mete ajou', es: 'Contraseña actualizada' },
  successMessage: { en: 'Your password has been updated successfully.', fr: 'Votre mot de passe a été mis à jour.', ht: 'Modpas ou mete ajou avèk siksè.', es: 'Tu contraseña ha sido actualizada.' },
  goToLogin: { en: 'Go to Login', fr: 'Aller à la connexion', ht: 'Ale nan koneksyon', es: 'Ir al inicio de sesión' },
  invalidLink: { en: 'Invalid or expired reset link', fr: 'Lien invalide ou expiré', ht: 'Lyen envalid oswa ekspire', es: 'Enlace inválido o expirado' },
  requestNew: { en: 'Request a new reset link', fr: 'Demander un nouveau lien', ht: 'Mande yon nouvo lyen', es: 'Solicitar un nuevo enlace' },
}

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [validSession, setValidSession] = useState(true)
  const router = useRouter()
  const { t } = useLanguage()

  useEffect(() => {
    // Check if user has a valid session from the reset link
    const checkSession = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        setValidSession(false)
      }
    }

    checkSession()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Password complexity validation using strength checker
    const { strength } = checkPasswordStrength(password)
    if (strength === 'weak') {
      setError(t('passwordTooShort', translations.passwordTooShort))
      return
    }

    if (password !== confirmPassword) {
      setError(t('passwordMismatch', translations.passwordMismatch))
      return
    }

    setLoading(true)

    const supabase = createClient()

    const { error: updateError } = await supabase.auth.updateUser({
      password: password,
    })

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)

    // Sign out and redirect to login after a delay
    setTimeout(async () => {
      await supabase.auth.signOut()
      router.push('/login')
    }, 3000)
  }

  if (!validSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('invalidLink', translations.invalidLink)}</h2>
            <Link
              href="/forgot-password"
              className="inline-block mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              {t('requestNew', translations.requestNew)}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('successTitle', translations.successTitle)}</h2>
            <p className="text-gray-600 mb-6">{t('successMessage', translations.successMessage)}</p>
            <Link
              href="/login"
              className="inline-block px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              {t('goToLogin', translations.goToLogin)}
            </Link>
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
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
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                {t('password', translations.password)}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('passwordPlaceholder', translations.passwordPlaceholder)}
                required
                minLength={8}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              />
              <PasswordStrength password={password} className="mt-2" />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                {t('confirmPassword', translations.confirmPassword)}
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('confirmPlaceholder', translations.confirmPlaceholder)}
                required
                minLength={8}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('updating', translations.updating) : t('updatePassword', translations.updatePassword)}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
