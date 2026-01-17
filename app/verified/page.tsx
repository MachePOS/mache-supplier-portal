'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

const translations = {
  title: { en: 'Email Verified!', fr: 'Email vérifié!', ht: 'Imèl verifye!', es: '¡Correo verificado!' },
  subtitle: { en: 'Your email has been successfully verified.', fr: 'Votre email a été vérifié avec succès.', ht: 'Imèl ou verifye avèk siksè.', es: 'Tu correo ha sido verificado con éxito.' },
  message: { en: 'Your supplier application is now pending review. We will notify you once your account has been approved.', fr: 'Votre demande de fournisseur est en attente de révision. Nous vous informerons une fois votre compte approuvé.', ht: 'Aplikasyon founisè ou ap tann revizyon. Nou pral fè ou konnen lè kont ou apwouve.', es: 'Tu solicitud de proveedor está pendiente de revisión. Te notificaremos una vez que tu cuenta haya sido aprobada.' },
  login: { en: 'Go to Login', fr: 'Aller à la connexion', ht: 'Ale nan koneksyon', es: 'Ir al inicio de sesión' },
  thankYou: { en: 'Thank you for joining Mache Marketplace!', fr: 'Merci d\'avoir rejoint Mache Marketplace!', ht: 'Mèsi paske ou rantre nan Mache Marketplace!', es: '¡Gracias por unirte a Mache Marketplace!' },
}

export default function VerifiedPage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-800 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Success Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('title', translations.title)}
          </h1>

          <p className="text-gray-600 mb-4">
            {t('subtitle', translations.subtitle)}
          </p>

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              {t('message', translations.message)}
            </p>
          </div>

          <p className="text-gray-500 text-sm mb-6">
            {t('thankYou', translations.thankYou)}
          </p>

          <Link
            href="/login"
            className="inline-flex items-center justify-center w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          >
            {t('login', translations.login)}
          </Link>
        </div>
      </div>
    </div>
  )
}
