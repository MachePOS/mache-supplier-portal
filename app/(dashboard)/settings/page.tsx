'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/contexts/LanguageContext'

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
  })

  useEffect(() => {
    loadSupplierData()
  }, [])

  const loadSupplierData = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const { data: supplier } = await supabase
      .from('platform_suppliers')
      .select('*')
      .eq('contact_email', user.email)
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
    })
    setLoading(false)
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
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t('settings', translations.settings)}</h1>
        <p className="text-gray-500">{t('businessProfile', translations.businessProfile)}</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Business Information */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('businessInfo', translations.businessInfo)}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('name', translations.name)} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('description', translations.description)}
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('contact', translations.contact)}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('email', translations.email)}
              </label>
              <input
                type="email"
                name="contact_email"
                value={formData.contact_email}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('phone', translations.phone)}
              </label>
              <input
                type="tel"
                name="contact_phone"
                value={formData.contact_phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('website', translations.website)}
              </label>
              <input
                type="url"
                name="website_url"
                value={formData.website_url}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('location', translations.location)}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('address', translations.address)}
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('city', translations.city)}
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('country', translations.country)}
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Business Terms */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('businessTerms', translations.businessTerms)}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('minOrder', translations.minOrder)}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  name="minimum_order_amount"
                  value={formData.minimum_order_amount}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('deliveryFee', translations.deliveryFee)}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  name="delivery_fee"
                  value={formData.delivery_fee}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('freeDelivery', translations.freeDelivery)}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  name="free_delivery_threshold"
                  value={formData.free_delivery_threshold}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('deliveryDays', translations.deliveryDays)}
              </label>
              <input
                type="number"
                name="delivery_days_estimate"
                value={formData.delivery_days_estimate}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('deliveryAreas', translations.deliveryAreas)}
              </label>
              <input
                type="text"
                name="delivery_areas"
                value={formData.delivery_areas}
                onChange={handleChange}
                placeholder="Port-au-Prince, Pétion-Ville, Delmas..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <p className="text-sm text-gray-500 mt-1">{t('deliveryAreasHelp', translations.deliveryAreasHelp)}</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('paymentMethods', translations.paymentMethods)}
              </label>
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

        {/* Branding */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('branding', translations.branding)}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('logoUrl', translations.logoUrl)}
              </label>
              <input
                type="url"
                name="logo_url"
                value={formData.logo_url}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              {formData.logo_url && (
                <div className="mt-2">
                  <img src={formData.logo_url} alt="Logo preview" className="w-24 h-24 object-contain rounded-lg border" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('bannerUrl', translations.bannerUrl)}
              </label>
              <input
                type="url"
                name="banner_url"
                value={formData.banner_url}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              {formData.banner_url && (
                <div className="mt-2">
                  <img src={formData.banner_url} alt="Banner preview" className="w-full h-32 object-cover rounded-lg border" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {saving ? t('saving', translations.saving) : t('save', translations.save)}
          </button>
        </div>
      </form>
    </div>
  )
}
