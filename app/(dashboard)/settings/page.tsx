'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/contexts/LanguageContext'
import { getSupplierInfo } from '@/lib/getSupplier'

const translations = {
  settings: { en: 'Settings', fr: 'Paramètres', ht: 'Paramèt', es: 'Configuración' },
  businessProfile: { en: 'Business Profile', fr: 'Profil d\'entreprise', ht: 'Pwofil biznis', es: 'Perfil de negocio' },
  businessInfo: { en: 'Business Information', fr: 'Informations commerciales', ht: 'Enfòmasyon biznis', es: 'Información del negocio' },
  name: { en: 'Business Name', fr: 'Nom de l\'entreprise', ht: 'Non biznis', es: 'Nombre del negocio' },
  description: { en: 'Description', fr: 'Description', ht: 'Deskripsyon', es: 'Descripción' },
  contact: { en: 'Contact Information', fr: 'Coordonnées', ht: 'Enfòmasyon kontak', es: 'Información de contacto' },
  email: { en: 'Email', fr: 'Email', ht: 'Imèl', es: 'Correo electrónico' },
  phone: { en: 'Phone', fr: 'Téléphone', ht: 'Telefòn', es: 'Teléfono' },
  website: { en: 'Website', fr: 'Site web', ht: 'Sit wèb', es: 'Sitio web' },
  location: { en: 'Location', fr: 'Emplacement', ht: 'Anplasman', es: 'Ubicación' },
  address: { en: 'Address', fr: 'Adresse', ht: 'Adrès', es: 'Dirección' },
  city: { en: 'City', fr: 'Ville', ht: 'Vil', es: 'Ciudad' },
  country: { en: 'Country', fr: 'Pays', ht: 'Peyi', es: 'País' },
  businessTerms: { en: 'Business Terms', fr: 'Conditions commerciales', ht: 'Kondisyon biznis', es: 'Términos comerciales' },
  minOrder: { en: 'Minimum Order Amount', fr: 'Montant minimum de commande', ht: 'Montan minimòm kòmand', es: 'Monto mínimo de pedido' },
  deliveryFee: { en: 'Delivery Fee', fr: 'Frais de livraison', ht: 'Frè livrezon', es: 'Costo de envío' },
  freeDelivery: { en: 'Free Delivery Threshold', fr: 'Seuil de livraison gratuite', ht: 'Limit livrezon gratis', es: 'Umbral de envío gratis' },
  deliveryDays: { en: 'Estimated Delivery Days', fr: 'Jours de livraison estimés', ht: 'Jou livrezon estime', es: 'Días de entrega estimados' },
  deliveryAreas: { en: 'Delivery Areas', fr: 'Zones de livraison', ht: 'Zòn livrezon', es: 'Áreas de entrega' },
  deliveryAreasHelp: { en: 'Comma-separated list of cities/areas you deliver to', fr: 'Liste séparée par des virgules', ht: 'Lis vil/zòn ou livre', es: 'Lista separada por comas' },
  paymentMethods: { en: 'Accepted Payment Methods', fr: 'Modes de paiement acceptés', ht: 'Metòd peman aksepte', es: 'Métodos de pago aceptados' },
  onDelivery: { en: 'Pay on Delivery', fr: 'Paiement à la livraison', ht: 'Peye nan livrezon', es: 'Pago contra entrega' },
  prepaid: { en: 'Prepaid', fr: 'Prépayé', ht: 'Peye davans', es: 'Prepago' },
  branding: { en: 'Branding', fr: 'Marque', ht: 'Mak', es: 'Marca' },
  logoUrl: { en: 'Logo URL', fr: 'URL du logo', ht: 'URL logo', es: 'URL del logo' },
  bannerUrl: { en: 'Banner URL', fr: 'URL de la bannière', ht: 'URL banyè', es: 'URL del banner' },
  visibility: { en: 'Visibility & Promotion', fr: 'Visibilité et promotion', ht: 'Vizibilite ak pwomosyon', es: 'Visibilidad y promoción' },
  featured: { en: 'Featured Supplier', fr: 'Fournisseur en vedette', ht: 'Founisè an vedèt', es: 'Proveedor destacado' },
  featuredDesc: { en: 'Display your business in the Featured Suppliers section on the marketplace homepage', fr: 'Afficher votre entreprise dans la section Fournisseurs en vedette', ht: 'Afiche biznis ou nan seksyon Founisè an vedèt', es: 'Mostrar su negocio en la sección de Proveedores destacados' },
  save: { en: 'Save Changes', fr: 'Enregistrer les modifications', ht: 'Anrejistre chanjman', es: 'Guardar cambios' },
  saving: { en: 'Saving...', fr: 'Enregistrement...', ht: 'Ap anrejistre...', es: 'Guardando...' },
  saved: { en: 'Changes saved successfully', fr: 'Modifications enregistrées', ht: 'Chanjman anrejistre', es: 'Cambios guardados' },
  error: { en: 'Error saving changes', fr: 'Erreur lors de l\'enregistrement', ht: 'Erè lè wap anrejistre', es: 'Error al guardar' },
}

export default function SettingsPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [supplierId, setSupplierId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    contact_email: '',
    contact_phone: '',
    website_url: '',
    address: '',
    city: '',
    country: 'Haiti',
    minimum_order_amount: '',
    delivery_fee: '',
    free_delivery_threshold: '',
    delivery_days_estimate: '3',
    delivery_areas: '',
    accepted_payment_methods: ['on_delivery', 'prepaid'],
    logo_url: '',
    banner_url: '',
    is_featured: false,
  })

  useEffect(() => {
    loadSupplierData()
  }, [])

  const loadSupplierData = async () => {
    try {
      const supplierInfo = await getSupplierInfo()

      if (!supplierInfo) {
        router.push('/pending')
        return
      }

      // Load full supplier data
      const supabase = createClient()
      const { data: supplier } = await supabase
        .from('platform_suppliers')
        .select('*')
        .eq('id', supplierInfo.id)
        .single()

      if (!supplier) {
        router.push('/pending')
        return
      }

      setSupplierId(supplier.id)
      setFormData({
        name: supplier.name || '',
        description: supplier.description || '',
        contact_email: supplier.contact_email || '',
        contact_phone: supplier.contact_phone || '',
        website_url: supplier.website_url || '',
        address: supplier.address || '',
        city: supplier.city || '',
        country: supplier.country || 'Haiti',
        minimum_order_amount: supplier.minimum_order_amount?.toString() || '',
        delivery_fee: supplier.delivery_fee?.toString() || '',
        free_delivery_threshold: supplier.free_delivery_threshold?.toString() || '',
        delivery_days_estimate: supplier.delivery_days_estimate?.toString() || '3',
        delivery_areas: (supplier.delivery_areas || []).join(', '),
        accepted_payment_methods: supplier.accepted_payment_methods || ['on_delivery', 'prepaid'],
        logo_url: supplier.logo_url || '',
        banner_url: supplier.banner_url || '',
        is_featured: supplier.is_featured || false,
      })
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    if (type === 'checkbox' && name === 'payment_method') {
      const method = value
      setFormData(prev => ({
        ...prev,
        accepted_payment_methods: checked
          ? [...prev.accepted_payment_methods, method]
          : prev.accepted_payment_methods.filter(m => m !== method)
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supplierId) return

    setSaving(true)
    setMessage(null)

    try {
      const supabase = createClient()

      const updateData = {
        name: formData.name,
        description: formData.description || null,
        contact_phone: formData.contact_phone || null,
        website_url: formData.website_url || null,
        address: formData.address || null,
        city: formData.city || null,
        country: formData.country,
        minimum_order_amount: formData.minimum_order_amount ? parseFloat(formData.minimum_order_amount) : 0,
        delivery_fee: formData.delivery_fee ? parseFloat(formData.delivery_fee) : 0,
        free_delivery_threshold: formData.free_delivery_threshold ? parseFloat(formData.free_delivery_threshold) : null,
        delivery_days_estimate: parseInt(formData.delivery_days_estimate) || 3,
        delivery_areas: formData.delivery_areas.split(',').map(a => a.trim()).filter(a => a),
        accepted_payment_methods: formData.accepted_payment_methods,
        logo_url: formData.logo_url || null,
        banner_url: formData.banner_url || null,
        is_featured: formData.is_featured,
      }

      const { error: updateError } = await supabase
        .from('platform_suppliers')
        .update(updateData)
        .eq('id', supplierId)

      if (updateError) throw updateError

      setMessage({ type: 'success', text: t('saved', translations.saved) })
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || t('error', translations.error) })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header with Save Button */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{t('settings', translations.settings)}</h1>
          <p className="text-sm text-gray-500">{t('businessProfile', translations.businessProfile)}</p>
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="px-5 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 text-sm font-medium"
        >
          {saving ? t('saving', translations.saving) : t('save', translations.save)}
        </button>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-5">
            {/* Business Info */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                {t('businessInfo', translations.businessInfo)}
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    {t('name', translations.name)} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    {t('description', translations.description)}
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {t('contact', translations.contact)}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{t('email', translations.email)}</label>
                  <input
                    type="email"
                    name="contact_email"
                    value={formData.contact_email}
                    disabled
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{t('phone', translations.phone)}</label>
                  <input
                    type="tel"
                    name="contact_phone"
                    value={formData.contact_phone}
                    onChange={handleChange}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">{t('website', translations.website)}</label>
                  <input
                    type="url"
                    name="website_url"
                    value={formData.website_url}
                    onChange={handleChange}
                    placeholder="https://..."
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                {t('location', translations.location)}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">{t('address', translations.address)}</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{t('city', translations.city)}</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{t('country', translations.country)}</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* Branding */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {t('branding', translations.branding)}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{t('logoUrl', translations.logoUrl)}</label>
                  <input
                    type="url"
                    name="logo_url"
                    value={formData.logo_url}
                    onChange={handleChange}
                    placeholder="https://..."
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  {formData.logo_url && (
                    <img src={formData.logo_url} alt="Logo" className="w-16 h-16 object-contain rounded border mt-2" />
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{t('bannerUrl', translations.bannerUrl)}</label>
                  <input
                    type="url"
                    name="banner_url"
                    value={formData.banner_url}
                    onChange={handleChange}
                    placeholder="https://..."
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  {formData.banner_url && (
                    <img src={formData.banner_url} alt="Banner" className="w-full h-16 object-cover rounded border mt-2" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-5">
            {/* Business Terms */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t('businessTerms', translations.businessTerms)}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{t('minOrder', translations.minOrder)}</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1.5 text-gray-500 text-sm">$</span>
                    <input
                      type="number"
                      name="minimum_order_amount"
                      value={formData.minimum_order_amount}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="w-full pl-7 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{t('deliveryFee', translations.deliveryFee)}</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1.5 text-gray-500 text-sm">$</span>
                    <input
                      type="number"
                      name="delivery_fee"
                      value={formData.delivery_fee}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="w-full pl-7 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{t('freeDelivery', translations.freeDelivery)}</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1.5 text-gray-500 text-sm">$</span>
                    <input
                      type="number"
                      name="free_delivery_threshold"
                      value={formData.free_delivery_threshold}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="w-full pl-7 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{t('deliveryDays', translations.deliveryDays)}</label>
                  <input
                    type="number"
                    name="delivery_days_estimate"
                    value={formData.delivery_days_estimate}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">{t('deliveryAreas', translations.deliveryAreas)}</label>
                  <input
                    type="text"
                    name="delivery_areas"
                    value={formData.delivery_areas}
                    onChange={handleChange}
                    placeholder="Port-au-Prince, Pétion-Ville, Delmas..."
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">{t('deliveryAreasHelp', translations.deliveryAreasHelp)}</p>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-2">{t('paymentMethods', translations.paymentMethods)}</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="payment_method"
                        value="on_delivery"
                        checked={formData.accepted_payment_methods.includes('on_delivery')}
                        onChange={handleChange}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">{t('onDelivery', translations.onDelivery)}</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="payment_method"
                        value="prepaid"
                        checked={formData.accepted_payment_methods.includes('prepaid')}
                        onChange={handleChange}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">{t('prepaid', translations.prepaid)}</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Visibility */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {t('visibility', translations.visibility)}
              </h3>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{t('featured', translations.featured)}</p>
                    <p className="text-xs text-gray-500">{t('featuredDesc', translations.featuredDesc)}</p>
                  </div>
                </div>
                {formData.is_featured && (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Your business will appear in Featured Suppliers
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
