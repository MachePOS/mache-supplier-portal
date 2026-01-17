'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

const translations = {
  title: { en: 'Application Pending', fr: 'Demande en attente', ht: 'Aplikasyon an atant', es: 'Solicitud pendiente' },
  subtitle: { en: 'Your supplier application is under review', fr: 'Votre demande de fournisseur est en cours d\'examen', ht: 'Aplikasyon founisè ou ap revize', es: 'Tu solicitud de proveedor está en revisión' },
  message: { en: 'Thank you for applying to become a supplier on Mache Marketplace! Our team is reviewing your application and will get back to you within 24-48 hours.', fr: 'Merci d\'avoir postulé pour devenir fournisseur sur Mache Marketplace! Notre équipe examine votre demande et vous répondra dans les 24-48 heures.', ht: 'Mèsi paske w aplike pou vin yon founisè sou Mache Marketplace! Ekip nou an ap revize aplikasyon ou epi y ap reponn ou nan 24-48 èdtan.', es: 'Gracias por solicitar ser proveedor en Mache Marketplace! Nuestro equipo está revisando tu solicitud y te responderá en 24-48 horas.' },
  whatHappens: { en: 'What happens next?', fr: 'Que se passe-t-il ensuite?', ht: 'Kisa k ap pase apre sa?', es: '¿Qué pasa después?' },
  step1: { en: 'Our team reviews your business information', fr: 'Notre équipe examine vos informations', ht: 'Ekip nou an revize enfòmasyon biznis ou', es: 'Nuestro equipo revisa tu información' },
  step2: { en: 'You receive an email notification when approved', fr: 'Vous recevez un email quand approuvé', ht: 'Ou resevwa yon imèl lè yo apwouve w', es: 'Recibirás un email cuando seas aprobado' },
  step3: { en: 'Start adding your products and receiving orders!', fr: 'Commencez à ajouter vos produits!', ht: 'Kòmanse ajoute pwodui ou yo!', es: '¡Comienza a agregar tus productos!' },
  questions: { en: 'Have questions?', fr: 'Vous avez des questions?', ht: 'Ou gen kesyon?', es: '¿Tienes preguntas?' },
  contact: { en: 'Contact us at support@machepos.com', fr: 'Contactez-nous à support@machepos.com', ht: 'Kontakte nou nan support@machepos.com', es: 'Contáctanos en support@machepos.com' },
  backToLogin: { en: 'Back to Login', fr: 'Retour à la connexion', ht: 'Retounen nan koneksyon', es: 'Volver al inicio de sesión' },
}

export default function PendingApprovalPage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-800 py-12 px-4">
      <div className="max-w-lg w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-100 mb-6">
            <svg className="w-10 h-10 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('title', translations.title)}
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            {t('subtitle', translations.subtitle)}
          </p>

          <p className="text-gray-500 mb-8">
            {t('message', translations.message)}
          </p>

          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h2 className="font-semibold text-gray-900 mb-4">
              {t('whatHappens', translations.whatHappens)}
            </h2>
            <div className="space-y-4 text-left">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-sm font-medium">
                  1
                </div>
                <p className="text-gray-600">{t('step1', translations.step1)}</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-sm font-medium">
                  2
                </div>
                <p className="text-gray-600">{t('step2', translations.step2)}</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-sm font-medium">
                  3
                </div>
                <p className="text-gray-600">{t('step3', translations.step3)}</p>
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-500 mb-6">
            <p className="font-medium">{t('questions', translations.questions)}</p>
            <p>{t('contact', translations.contact)}</p>
          </div>

          <Link
            href="/login"
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {t('backToLogin', translations.backToLogin)}
          </Link>
        </div>
      </div>
    </div>
  )
}
