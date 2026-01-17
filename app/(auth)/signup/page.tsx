'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/contexts/LanguageContext'

const translations = {
  title: { en: 'Become a Supplier', fr: 'Devenir fournisseur', ht: 'Vin yon founisè', es: 'Conviértete en proveedor' },
  subtitle: { en: 'Join the Mache Marketplace and reach more businesses', fr: 'Rejoignez Mache Marketplace et atteignez plus d\'entreprises', ht: 'Rantre nan Mache Marketplace epi rive plis biznis', es: 'Únete al Mache Marketplace y llega a más negocios' },
  businessName: { en: 'Business Name', fr: 'Nom de l\'entreprise', ht: 'Non biznis', es: 'Nombre del negocio' },
  businessPlaceholder: { en: 'Your Company Name', fr: 'Nom de votre entreprise', ht: 'Non konpayi ou', es: 'Nombre de tu empresa' },
  contactName: { en: 'Contact Name', fr: 'Nom du contact', ht: 'Non kontak', es: 'Nombre de contacto' },
  namePlaceholder: { en: 'John Doe', fr: 'Jean Dupont', ht: 'Jan Batis', es: 'Juan Pérez' },
  email: { en: 'Email', fr: 'Email', ht: 'Imèl', es: 'Correo electrónico' },
  emailPlaceholder: { en: 'you@company.com', fr: 'vous@entreprise.com', ht: 'ou@konpayi.com', es: 'tu@empresa.com' },
  phone: { en: 'Phone Number', fr: 'Numéro de téléphone', ht: 'Nimewo telefòn', es: 'Número de teléfono' },
  phonePlaceholder: { en: '+509 0000-0000', fr: '+509 0000-0000', ht: '+509 0000-0000', es: '+509 0000-0000' },
  password: { en: 'Password', fr: 'Mot de passe', ht: 'Modpas', es: 'Contraseña' },
  passwordPlaceholder: { en: 'At least 6 characters', fr: 'Au moins 6 caractères', ht: 'Omwen 6 karaktè', es: 'Al menos 6 caracteres' },
  confirmPassword: { en: 'Confirm Password', fr: 'Confirmer le mot de passe', ht: 'Konfime modpas', es: 'Confirmar contraseña' },
  country: { en: 'Country', fr: 'Pays', ht: 'Peyi', es: 'País' },
  city: { en: 'City', fr: 'Ville', ht: 'Vil', es: 'Ciudad' },
  cityPlaceholder: { en: 'Enter your city', fr: 'Entrez votre ville', ht: 'Antre vil ou', es: 'Ingresa tu ciudad' },
  address: { en: 'Business Address', fr: 'Adresse de l\'entreprise', ht: 'Adrès biznis', es: 'Dirección del negocio' },
  addressPlaceholder: { en: 'Street address', fr: 'Adresse', ht: 'Adrès', es: 'Dirección' },
  description: { en: 'Business Description', fr: 'Description de l\'entreprise', ht: 'Deskripsyon biznis', es: 'Descripción del negocio' },
  descriptionPlaceholder: { en: 'Tell us about your business and products...', fr: 'Parlez-nous de votre entreprise...', ht: 'Pale nou de biznis ou...', es: 'Cuéntanos sobre tu negocio...' },
  submit: { en: 'Apply to Become a Supplier', fr: 'Postuler pour devenir fournisseur', ht: 'Aplike pou vin founisè', es: 'Solicitar ser proveedor' },
  submitting: { en: 'Submitting...', fr: 'Envoi en cours...', ht: 'Ap voye...', es: 'Enviando...' },
  haveAccount: { en: 'Already have an account?', fr: 'Vous avez déjà un compte?', ht: 'Ou gentan gen yon kont?', es: '¿Ya tienes una cuenta?' },
  signIn: { en: 'Sign in', fr: 'Connexion', ht: 'Konekte', es: 'Iniciar sesión' },
  terms: { en: 'By signing up, you agree to our Terms of Service and Privacy Policy', fr: 'En vous inscrivant, vous acceptez nos conditions', ht: 'Lè ou enskri, ou aksepte kondisyon nou yo', es: 'Al registrarte, aceptas nuestros términos' },
  passwordMismatch: { en: 'Passwords do not match', fr: 'Les mots de passe ne correspondent pas', ht: 'Modpas yo pa matche', es: 'Las contraseñas no coinciden' },
  passwordLength: { en: 'Password must be at least 6 characters', fr: 'Le mot de passe doit comporter au moins 6 caractères', ht: 'Modpas dwe gen omwen 6 karaktè', es: 'La contraseña debe tener al menos 6 caracteres' },
}

export default function SupplierSignupPage() {
  const [formData, setFormData] = useState({
    businessName: '',
    contactName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    country: 'Haiti',
    city: '',
    address: '',
    description: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { t } = useLanguage()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError(t('passwordMismatch', translations.passwordMismatch))
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError(t('passwordLength', translations.passwordLength))
      setLoading(false)
      return
    }

    const supabase = createClient()

    // Get the current origin for redirect
    const origin = window.location.origin

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
        data: {
          name: formData.contactName,
          user_type: 'supplier',
        },
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (!authData.user) {
      setError('Failed to create account')
      setLoading(false)
      return
    }

    // Generate slug from business name
    const slug = formData.businessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Create supplier record using RPC function (bypasses RLS)
    const { error: supplierError } = await supabase
      .rpc('create_supplier_on_signup', {
        p_name: formData.businessName,
        p_slug: slug + '-' + Date.now().toString(36),
        p_description: formData.description,
        p_contact_email: formData.email,
        p_contact_phone: formData.phone,
        p_address: formData.address,
        p_city: formData.city,
        p_country: formData.country,
      })

    if (supplierError) {
      console.error('Supplier creation error:', supplierError)
      setError('Failed to create supplier profile. Please contact support.')
      setLoading(false)
      return
    }

    // Redirect to pending approval page
    router.push('/pending')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-800 py-12 px-4">
      <div className="max-w-lg w-full">
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

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
                {t('businessName', translations.businessName)} *
              </label>
              <input
                id="businessName"
                name="businessName"
                type="text"
                value={formData.businessName}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder={t('businessPlaceholder', translations.businessPlaceholder)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="contactName" className="block text-sm font-medium text-gray-700">
                  {t('contactName', translations.contactName)} *
                </label>
                <input
                  id="contactName"
                  name="contactName"
                  type="text"
                  value={formData.contactName}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder={t('namePlaceholder', translations.namePlaceholder)}
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  {t('phone', translations.phone)} *
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder={t('phonePlaceholder', translations.phonePlaceholder)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {t('email', translations.email)} *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder={t('emailPlaceholder', translations.emailPlaceholder)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                  {t('country', translations.country)} *
                </label>
                <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                >
                  <option value="Haiti">Haiti</option>
                  <option value="Dominican Republic">Dominican Republic</option>
                  <option value="Jamaica">Jamaica</option>
                  <option value="USA">USA</option>
                  <option value="Canada">Canada</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                  {t('city', translations.city)} *
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder={t('cityPlaceholder', translations.cityPlaceholder)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                {t('address', translations.address)}
              </label>
              <input
                id="address"
                name="address"
                type="text"
                value={formData.address}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder={t('addressPlaceholder', translations.addressPlaceholder)}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                {t('description', translations.description)}
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder={t('descriptionPlaceholder', translations.descriptionPlaceholder)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  {t('password', translations.password)} *
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder={t('passwordPlaceholder', translations.passwordPlaceholder)}
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  {t('confirmPassword', translations.confirmPassword)} *
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? t('submitting', translations.submitting) : t('submit', translations.submit)}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {t('haveAccount', translations.haveAccount)}{' '}
              <Link href="/login" className="font-medium text-primary-600 hover:text-primary-700">
                {t('signIn', translations.signIn)}
              </Link>
            </p>
          </div>

          <p className="mt-4 text-xs text-center text-gray-500">
            {t('terms', translations.terms)}
          </p>
        </div>
      </div>
    </div>
  )
}
