'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/contexts/LanguageContext'
import { getSupplierId } from '@/lib/getSupplier'
import ProductSelector from '@/components/ProductSelector'

const translations = {
  createDeal: { en: 'Create Deal', fr: 'Créer une offre', ht: 'Kreye yon òf', es: 'Crear oferta' },
  back: { en: 'Back to Deals', fr: 'Retour aux offres', ht: 'Retounen nan òf', es: 'Volver a ofertas' },
  dealInfo: { en: 'Deal Information', fr: 'Informations sur l\'offre', ht: 'Enfòmasyon sou òf', es: 'Información de la oferta' },
  title: { en: 'Title', fr: 'Titre', ht: 'Tit', es: 'Título' },
  titlePlaceholder: { en: 'e.g., Summer Sale - 20% Off All Products', fr: 'ex: Soldes d\'été - 20% de réduction', ht: 'egz: Lavant ete - 20% rabè', es: 'ej: Rebajas de verano - 20% de descuento' },
  description: { en: 'Description', fr: 'Description', ht: 'Deskripsyon', es: 'Descripción' },
  dealType: { en: 'Deal Type', fr: 'Type d\'offre', ht: 'Tip òf', es: 'Tipo de oferta' },
  discountSettings: { en: 'Discount Settings', fr: 'Paramètres de réduction', ht: 'Paramèt rabè', es: 'Configuración de descuento' },
  discountPercentage: { en: 'Discount Percentage', fr: 'Pourcentage de réduction', ht: 'Pousantaj rabè', es: 'Porcentaje de descuento' },
  discountAmount: { en: 'Discount Amount ($)', fr: 'Montant de réduction ($)', ht: 'Montan rabè ($)', es: 'Monto de descuento ($)' },
  minPurchase: { en: 'Minimum Purchase Amount ($)', fr: 'Montant minimum d\'achat ($)', ht: 'Montan minimòm achte ($)', es: 'Monto mínimo de compra ($)' },
  freeDelivery: { en: 'Include Free Delivery', fr: 'Inclure livraison gratuite', ht: 'Enkli livrezon gratis', es: 'Incluir envío gratis' },
  freeDeliveryThreshold: { en: 'Free Delivery Threshold ($)', fr: 'Seuil livraison gratuite ($)', ht: 'Limit livrezon gratis ($)', es: 'Umbral de envío gratis ($)' },
  scheduling: { en: 'Scheduling', fr: 'Planification', ht: 'Pwogramasyon', es: 'Programación' },
  startDate: { en: 'Start Date', fr: 'Date de début', ht: 'Dat kòmanse', es: 'Fecha de inicio' },
  endDate: { en: 'End Date (optional)', fr: 'Date de fin (optionnel)', ht: 'Dat fini (opsyonèl)', es: 'Fecha de fin (opcional)' },
  flashSale: { en: 'Flash Sale', fr: 'Vente flash', ht: 'Lavant flash', es: 'Venta flash' },
  flashSaleDesc: { en: 'Mark as time-limited flash sale with countdown timer', fr: 'Marquer comme vente flash avec compte à rebours', ht: 'Make kòm lavant flash ak kontaj', es: 'Marcar como venta flash con temporizador' },
  visibility: { en: 'Visibility', fr: 'Visibilité', ht: 'Vizibilite', es: 'Visibilidad' },
  active: { en: 'Active', fr: 'Actif', ht: 'Aktif', es: 'Activo' },
  activeDesc: { en: 'Deal is visible to customers', fr: 'L\'offre est visible', ht: 'Òf la vizib', es: 'La oferta es visible' },
  featured: { en: 'Featured', fr: 'En vedette', ht: 'An vedèt', es: 'Destacado' },
  featuredDesc: { en: 'Show in featured deals section', fr: 'Afficher dans les offres en vedette', ht: 'Montre nan seksyon òf an vedèt', es: 'Mostrar en ofertas destacadas' },
  badgeText: { en: 'Badge Text', fr: 'Texte du badge', ht: 'Tèks baj', es: 'Texto de insignia' },
  badgePlaceholder: { en: 'e.g., HOT DEAL, LIMITED TIME', fr: 'ex: OFFRE CHAUDE, TEMPS LIMITÉ', ht: 'egz: ÒF CHO, TAN LIMITE', es: 'ej: OFERTA CALIENTE, TIEMPO LIMITADO' },
  save: { en: 'Create Deal', fr: 'Créer l\'offre', ht: 'Kreye òf', es: 'Crear oferta' },
  saving: { en: 'Creating...', fr: 'Création...', ht: 'Ap kreye...', es: 'Creando...' },
  success: { en: 'Deal created successfully!', fr: 'Offre créée avec succès!', ht: 'Òf kreye avèk siksè!', es: '¡Oferta creada con éxito!' },
  error: { en: 'Error creating deal', fr: 'Erreur lors de la création', ht: 'Erè pandan kreyasyon', es: 'Error al crear la oferta' },
  appliesTo: { en: 'Applies To', fr: 'S\'applique à', ht: 'Aplike pou', es: 'Se aplica a' },
  appliesToDesc: { en: 'Choose which products this deal applies to', fr: 'Choisissez les produits concernés', ht: 'Chwazi ki pwodui òf la aplike pou', es: 'Elija a qué productos se aplica' },
  allProducts: { en: 'All Products', fr: 'Tous les produits', ht: 'Tout pwodui', es: 'Todos los productos' },
  allProductsDesc: { en: 'Deal applies to your entire catalog', fr: 'L\'offre s\'applique à tout votre catalogue', ht: 'Òf la aplike pou tout katalòg ou', es: 'La oferta se aplica a todo su catálogo' },
  specificProducts: { en: 'Specific Products', fr: 'Produits spécifiques', ht: 'Pwodui espesifik', es: 'Productos específicos' },
  specificProductsDesc: { en: 'Select individual products', fr: 'Sélectionnez des produits individuels', ht: 'Chwazi pwodui endividyèl', es: 'Seleccione productos individuales' },
  selectProductsError: { en: 'Please select at least one product', fr: 'Veuillez sélectionner au moins un produit', ht: 'Tanpri chwazi omwen yon pwodui', es: 'Por favor seleccione al menos un producto' },
  promoCodeSettings: { en: 'Promo Code & Limits', fr: 'Code promo et limites', ht: 'Kòd pwomo ak limit', es: 'Código promocional y límites' },
  promoCode: { en: 'Promo Code', fr: 'Code promo', ht: 'Kòd pwomo', es: 'Código promocional' },
  promoCodePlaceholder: { en: 'e.g., SUMMER20', fr: 'ex: ETE20', ht: 'egz: ETE20', es: 'ej: VERANO20' },
  promoCodeDesc: { en: 'Optional code customers must enter to get this deal', fr: 'Code optionnel que les clients doivent entrer', ht: 'Kòd opsyonèl kliyan dwe antre', es: 'Código opcional que los clientes deben ingresar' },
  requiresPromoCode: { en: 'Require Promo Code', fr: 'Exiger un code promo', ht: 'Mande kòd pwomo', es: 'Requerir código promocional' },
  requiresPromoCodeDesc: { en: 'Customers must enter the promo code to use this deal', fr: 'Les clients doivent entrer le code promo', ht: 'Kliyan dwe antre kòd pwomo a', es: 'Los clientes deben ingresar el código' },
  usageLimit: { en: 'Total Usage Limit', fr: 'Limite d\'utilisation totale', ht: 'Limit itilizasyon total', es: 'Límite de uso total' },
  usageLimitDesc: { en: 'Maximum number of times this deal can be used (leave empty for unlimited)', fr: 'Nombre maximum d\'utilisations (vide = illimité)', ht: 'Kantite maksimòm fwa yo ka itilize òf la', es: 'Número máximo de usos (vacío = ilimitado)' },
  usageLimitPerCustomer: { en: 'Limit Per Customer', fr: 'Limite par client', ht: 'Limit pa kliyan', es: 'Límite por cliente' },
  usageLimitPerCustomerDesc: { en: 'Maximum times a single customer can use this deal', fr: 'Nombre maximum par client', ht: 'Kantite maksimòm pa kliyan', es: 'Máximo de usos por cliente' },
  unlimited: { en: 'Unlimited', fr: 'Illimité', ht: 'San limit', es: 'Ilimitado' },
}

const dealTypes = [
  { value: 'percentage_off', label: { en: 'Percentage Off', fr: 'Pourcentage de réduction', ht: 'Pousantaj rabè', es: 'Porcentaje de descuento' } },
  { value: 'fixed_amount_off', label: { en: 'Fixed Amount Off', fr: 'Montant fixe de réduction', ht: 'Montan fiks rabè', es: 'Monto fijo de descuento' } },
  { value: 'free_delivery', label: { en: 'Free Delivery', fr: 'Livraison gratuite', ht: 'Livrezon gratis', es: 'Envío gratis' } },
  { value: 'flash_sale', label: { en: 'Flash Sale', fr: 'Vente flash', ht: 'Lavant flash', es: 'Venta flash' } },
  { value: 'bulk_discount', label: { en: 'Bulk Discount', fr: 'Remise en gros', ht: 'Rabè an gwo', es: 'Descuento por volumen' } },
  { value: 'clearance', label: { en: 'Clearance', fr: 'Liquidation', ht: 'Likwidasyon', es: 'Liquidación' } },
  { value: 'seasonal', label: { en: 'Seasonal', fr: 'Saisonnier', ht: 'Sezon', es: 'Estacional' } },
  { value: 'new_customer', label: { en: 'New Customer Special', fr: 'Spécial nouveau client', ht: 'Espesyal nouvo kliyan', es: 'Especial nuevo cliente' } },
]

export default function NewDealPage() {
  const router = useRouter()
  const { t, language } = useLanguage()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([])

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deal_type: 'percentage_off',
    discount_percentage: '',
    discount_amount: '',
    min_purchase_amount: '',
    free_delivery: false,
    free_delivery_threshold: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    is_flash_sale: false,
    is_active: true,
    is_featured: false,
    badge_text: '',
    badge_color: 'red',
    applies_to: 'all_products' as 'all_products' | 'specific_products',
    promo_code: '',
    requires_promo_code: false,
    usage_limit: '',
    usage_limit_per_customer: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    // Validate product selection
    if (formData.applies_to === 'specific_products' && selectedProductIds.length === 0) {
      setError(t('selectProductsError', translations.selectProductsError))
      setSaving(false)
      return
    }

    try {
      const supplierId = await getSupplierId()
      if (!supplierId) {
        throw new Error('Supplier not found')
      }

      const supabase = createClient()

      const dealData = {
        supplier_id: supplierId,
        title: formData.title,
        description: formData.description || null,
        deal_type: formData.deal_type,
        discount_percentage: formData.discount_percentage ? parseFloat(formData.discount_percentage) : null,
        discount_amount: formData.discount_amount ? parseFloat(formData.discount_amount) : null,
        min_purchase_amount: formData.min_purchase_amount ? parseFloat(formData.min_purchase_amount) : null,
        free_delivery: formData.free_delivery,
        free_delivery_threshold: formData.free_delivery_threshold ? parseFloat(formData.free_delivery_threshold) : null,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
        is_flash_sale: formData.is_flash_sale,
        is_active: formData.is_active,
        is_featured: formData.is_featured,
        badge_text: formData.badge_text || null,
        badge_color: formData.badge_color,
        applies_to: formData.applies_to,
        promo_code: formData.promo_code?.toUpperCase() || null,
        requires_promo_code: formData.requires_promo_code,
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
        usage_limit_per_customer: formData.usage_limit_per_customer ? parseInt(formData.usage_limit_per_customer) : null,
        approval_status: 'approved', // Auto-approve for now
      }

      const { data: deal, error: insertError } = await supabase
        .from('marketplace_deals')
        .insert(dealData)
        .select('id')
        .single()

      if (insertError) throw insertError

      // Insert deal products if specific products selected
      if (formData.applies_to === 'specific_products' && selectedProductIds.length > 0 && deal) {
        const dealProducts = selectedProductIds.map(productId => ({
          deal_id: deal.id,
          product_id: productId,
        }))

        const { error: productsError } = await supabase
          .from('marketplace_deal_products')
          .insert(dealProducts)

        if (productsError) {
          console.error('Error adding deal products:', productsError)
          // Don't throw here - deal was created successfully
        }
      }

      router.push('/deals')
    } catch (err) {
      console.error('Error creating deal:', err)
      setError(t('error', translations.error))
    } finally {
      setSaving(false)
    }
  }

  const getDealTypeLabel = (type: { value: string; label: Record<string, string> }) => {
    return type.label[language] || type.label.en
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/deals"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t('back', translations.back)}
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{t('createDeal', translations.createDeal)}</h1>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Deal Information */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('dealInfo', translations.dealInfo)}</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('title', translations.title)} *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder={t('titlePlaceholder', translations.titlePlaceholder)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('description', translations.description)}
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('dealType', translations.dealType)} *
              </label>
              <select
                value={formData.deal_type}
                onChange={(e) => setFormData({ ...formData, deal_type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
              >
                {dealTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {getDealTypeLabel(type)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Applies To Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">{t('appliesTo', translations.appliesTo)}</h2>
          <p className="text-sm text-gray-500 mb-4">{t('appliesToDesc', translations.appliesToDesc)}</p>

          <div className="space-y-3 mb-4">
            <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary-300 transition-colors has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50">
              <input
                type="radio"
                name="applies_to"
                value="all_products"
                checked={formData.applies_to === 'all_products'}
                onChange={(e) => setFormData({ ...formData, applies_to: e.target.value as 'all_products' | 'specific_products' })}
                className="mt-1 w-4 h-4 text-primary-600 focus:ring-primary-500"
              />
              <div>
                <span className="font-medium text-gray-900">{t('allProducts', translations.allProducts)}</span>
                <p className="text-sm text-gray-500">{t('allProductsDesc', translations.allProductsDesc)}</p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary-300 transition-colors has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50">
              <input
                type="radio"
                name="applies_to"
                value="specific_products"
                checked={formData.applies_to === 'specific_products'}
                onChange={(e) => setFormData({ ...formData, applies_to: e.target.value as 'all_products' | 'specific_products' })}
                className="mt-1 w-4 h-4 text-primary-600 focus:ring-primary-500"
              />
              <div>
                <span className="font-medium text-gray-900">{t('specificProducts', translations.specificProducts)}</span>
                <p className="text-sm text-gray-500">{t('specificProductsDesc', translations.specificProductsDesc)}</p>
              </div>
            </label>
          </div>

          {formData.applies_to === 'specific_products' && (
            <ProductSelector
              selectedProductIds={selectedProductIds}
              onSelectionChange={setSelectedProductIds}
              className="mt-4"
            />
          )}
        </div>

        {/* Discount Settings */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('discountSettings', translations.discountSettings)}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('discountPercentage', translations.discountPercentage)}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.discount_percentage}
                  onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">%</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('discountAmount', translations.discountAmount)}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.discount_amount}
                  onChange={(e) => setFormData({ ...formData, discount_amount: e.target.value })}
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('minPurchase', translations.minPurchase)}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.min_purchase_amount}
                  onChange={(e) => setFormData({ ...formData, min_purchase_amount: e.target.value })}
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('freeDeliveryThreshold', translations.freeDeliveryThreshold)}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.free_delivery_threshold}
                  onChange={(e) => setFormData({ ...formData, free_delivery_threshold: e.target.value })}
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.free_delivery}
                  onChange={(e) => setFormData({ ...formData, free_delivery: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">{t('freeDelivery', translations.freeDelivery)}</span>
              </label>
            </div>
          </div>
        </div>

        {/* Promo Code & Usage Limits */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('promoCodeSettings', translations.promoCodeSettings)}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('promoCode', translations.promoCode)}
              </label>
              <input
                type="text"
                value={formData.promo_code}
                onChange={(e) => setFormData({ ...formData, promo_code: e.target.value.toUpperCase() })}
                placeholder={t('promoCodePlaceholder', translations.promoCodePlaceholder)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 uppercase font-mono"
                maxLength={50}
              />
              <p className="text-xs text-gray-500 mt-1">{t('promoCodeDesc', translations.promoCodeDesc)}</p>
            </div>

            <div className="md:col-span-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.requires_promo_code}
                  onChange={(e) => setFormData({ ...formData, requires_promo_code: e.target.checked })}
                  className="w-5 h-5 mt-0.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  disabled={!formData.promo_code}
                />
                <div>
                  <span className={`text-sm font-medium ${formData.promo_code ? 'text-gray-700' : 'text-gray-400'}`}>
                    {t('requiresPromoCode', translations.requiresPromoCode)}
                  </span>
                  <p className="text-xs text-gray-500">{t('requiresPromoCodeDesc', translations.requiresPromoCodeDesc)}</p>
                </div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('usageLimit', translations.usageLimit)}
              </label>
              <input
                type="number"
                min="1"
                value={formData.usage_limit}
                onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                placeholder={t('unlimited', translations.unlimited)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <p className="text-xs text-gray-500 mt-1">{t('usageLimitDesc', translations.usageLimitDesc)}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('usageLimitPerCustomer', translations.usageLimitPerCustomer)}
              </label>
              <input
                type="number"
                min="1"
                value={formData.usage_limit_per_customer}
                onChange={(e) => setFormData({ ...formData, usage_limit_per_customer: e.target.value })}
                placeholder={t('unlimited', translations.unlimited)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <p className="text-xs text-gray-500 mt-1">{t('usageLimitPerCustomerDesc', translations.usageLimitPerCustomerDesc)}</p>
            </div>
          </div>
        </div>

        {/* Scheduling */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('scheduling', translations.scheduling)}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('startDate', translations.startDate)} *
              </label>
              <input
                type="date"
                required
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('endDate', translations.endDate)}
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_flash_sale}
                  onChange={(e) => setFormData({ ...formData, is_flash_sale: e.target.checked })}
                  className="w-5 h-5 mt-0.5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">{t('flashSale', translations.flashSale)}</span>
                  <p className="text-xs text-gray-500">{t('flashSaleDesc', translations.flashSaleDesc)}</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Visibility */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('visibility', translations.visibility)}</h2>

          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-5 h-5 mt-0.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">{t('active', translations.active)}</span>
                <p className="text-xs text-gray-500">{t('activeDesc', translations.activeDesc)}</p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                className="w-5 h-5 mt-0.5 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">{t('featured', translations.featured)}</span>
                <p className="text-xs text-gray-500">{t('featuredDesc', translations.featuredDesc)}</p>
              </div>
            </label>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('badgeText', translations.badgeText)}
              </label>
              <input
                type="text"
                maxLength={50}
                value={formData.badge_text}
                onChange={(e) => setFormData({ ...formData, badge_text: e.target.value })}
                placeholder={t('badgePlaceholder', translations.badgePlaceholder)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Link
            href="/deals"
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? t('saving', translations.saving) : t('save', translations.save)}
          </button>
        </div>
      </form>
    </div>
  )
}
