'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/contexts/LanguageContext'
import { getSupplierId } from '@/lib/getSupplier'
import Pagination from '@/components/Pagination'

const ITEMS_PER_PAGE = 12

const translations = {
  deals: { en: 'Deals & Promotions', fr: 'Offres et Promotions', ht: 'Òf ak Pwomosyon', es: 'Ofertas y Promociones' },
  createDeal: { en: 'Create Deal', fr: 'Créer une offre', ht: 'Kreye yon òf', es: 'Crear oferta' },
  noDeals: { en: 'No deals yet', fr: 'Pas encore d\'offres', ht: 'Pa gen òf ankò', es: 'Sin ofertas aún' },
  createFirst: { en: 'Create your first deal to attract customers', fr: 'Créez votre première offre', ht: 'Kreye premye òf ou', es: 'Crea tu primera oferta' },
  active: { en: 'Active', fr: 'Actif', ht: 'Aktif', es: 'Activo' },
  inactive: { en: 'Inactive', fr: 'Inactif', ht: 'Inaktif', es: 'Inactivo' },
  expired: { en: 'Expired', fr: 'Expiré', ht: 'Ekspire', es: 'Expirado' },
  scheduled: { en: 'Scheduled', fr: 'Programmé', ht: 'Pwograme', es: 'Programado' },
  edit: { en: 'Edit', fr: 'Modifier', ht: 'Modifye', es: 'Editar' },
  delete: { en: 'Delete', fr: 'Supprimer', ht: 'Efase', es: 'Eliminar' },
  totalDeals: { en: 'Total Deals', fr: 'Total offres', ht: 'Total òf', es: 'Total ofertas' },
  activeDeals: { en: 'Active Deals', fr: 'Offres actives', ht: 'Òf aktif', es: 'Ofertas activas' },
  flashSales: { en: 'Flash Sales', fr: 'Ventes flash', ht: 'Lavant flash', es: 'Ventas flash' },
  totalViews: { en: 'Total Views', fr: 'Total vues', ht: 'Total vi', es: 'Total vistas' },
  percentageOff: { en: 'Percentage Off', fr: 'Pourcentage', ht: 'Pousantaj', es: 'Porcentaje' },
  fixedAmount: { en: 'Fixed Amount', fr: 'Montant fixe', ht: 'Montan fiks', es: 'Monto fijo' },
  freeDelivery: { en: 'Free Delivery', fr: 'Livraison gratuite', ht: 'Livrezon gratis', es: 'Envío gratis' },
  flashSale: { en: 'Flash Sale', fr: 'Vente flash', ht: 'Lavant flash', es: 'Venta flash' },
  bulkDiscount: { en: 'Bulk Discount', fr: 'Remise en gros', ht: 'Rabè an gwo', es: 'Descuento por volumen' },
  off: { en: 'OFF', fr: 'DE RÉDUCTION', ht: 'RABÈ', es: 'DE DESCUENTO' },
  endsIn: { en: 'Ends in', fr: 'Se termine dans', ht: 'Fini nan', es: 'Termina en' },
  startsIn: { en: 'Starts in', fr: 'Commence dans', ht: 'Kòmanse nan', es: 'Comienza en' },
  views: { en: 'views', fr: 'vues', ht: 'vi', es: 'vistas' },
  conversions: { en: 'conversions', fr: 'conversions', ht: 'konvèsyon', es: 'conversiones' },
  minOrder: { en: 'Min. Order', fr: 'Commande min.', ht: 'Kòmand min.', es: 'Pedido mín.' },
  allDeals: { en: 'All', fr: 'Tous', ht: 'Tout', es: 'Todos' },
  confirmDelete: { en: 'Are you sure you want to delete this deal?', fr: 'Voulez-vous vraiment supprimer cette offre?', ht: 'Èske ou sèten ou vle efase òf sa a?', es: '¿Estás seguro de que quieres eliminar esta oferta?' },
  dealDeleted: { en: 'Deal deleted successfully', fr: 'Offre supprimée', ht: 'Òf efase', es: 'Oferta eliminada' },
  search: { en: 'Search deals...', fr: 'Rechercher des offres...', ht: 'Chèche òf...', es: 'Buscar ofertas...' },
}

const dealTypeLabels: Record<string, Record<string, string>> = {
  percentage_off: { en: 'Percentage Off', fr: 'Pourcentage', ht: 'Pousantaj', es: 'Porcentaje' },
  fixed_amount_off: { en: 'Fixed Amount', fr: 'Montant fixe', ht: 'Montan fiks', es: 'Monto fijo' },
  free_delivery: { en: 'Free Delivery', fr: 'Livraison gratuite', ht: 'Livrezon gratis', es: 'Envío gratis' },
  buy_x_get_y: { en: 'Buy X Get Y', fr: 'Achetez X obtenez Y', ht: 'Achte X jwenn Y', es: 'Compra X lleva Y' },
  bundle: { en: 'Bundle', fr: 'Lot', ht: 'Pakèt', es: 'Paquete' },
  flash_sale: { en: 'Flash Sale', fr: 'Vente flash', ht: 'Lavant flash', es: 'Venta flash' },
  clearance: { en: 'Clearance', fr: 'Liquidation', ht: 'Likwidasyon', es: 'Liquidación' },
  bulk_discount: { en: 'Bulk Discount', fr: 'Remise en gros', ht: 'Rabè an gwo', es: 'Descuento por volumen' },
  new_customer: { en: 'New Customer', fr: 'Nouveau client', ht: 'Nouvo kliyan', es: 'Nuevo cliente' },
  seasonal: { en: 'Seasonal', fr: 'Saisonnier', ht: 'Sezon', es: 'Estacional' },
}

interface Deal {
  id: string
  title: string
  deal_type: string
  discount_percentage: number | null
  discount_amount: number | null
  min_purchase_amount: number | null
  free_delivery: boolean
  start_date: string
  end_date: string | null
  is_active: boolean
  is_flash_sale: boolean
  is_featured: boolean
  views_count: number
  conversions_count: number
  approval_status: string
  created_at: string
}

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'expired' | 'scheduled'>('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [dealToDelete, setDealToDelete] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const { t, language } = useLanguage()

  useEffect(() => {
    loadDeals()
  }, [])

  const loadDeals = async () => {
    try {
      const supplierId = await getSupplierId()
      if (!supplierId) {
        setLoading(false)
        return
      }

      const supabase = createClient()
      const { data, error } = await supabase
        .from('marketplace_deals')
        .select('*')
        .eq('supplier_id', supplierId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setDeals(data || [])
    } catch (error) {
      console.error('Error loading deals:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDealStatus = (deal: Deal) => {
    const now = new Date()
    const startDate = new Date(deal.start_date)
    const endDate = deal.end_date ? new Date(deal.end_date) : null

    if (!deal.is_active) {
      return { status: 'inactive', label: t('inactive', translations.inactive), color: 'bg-gray-100 text-gray-800' }
    }
    if (startDate > now) {
      return { status: 'scheduled', label: t('scheduled', translations.scheduled), color: 'bg-blue-100 text-blue-800' }
    }
    if (endDate && endDate < now) {
      return { status: 'expired', label: t('expired', translations.expired), color: 'bg-red-100 text-red-800' }
    }
    return { status: 'active', label: t('active', translations.active), color: 'bg-green-100 text-green-800' }
  }

  const getTimeRemaining = (endDate: string) => {
    const now = new Date().getTime()
    const end = new Date(endDate).getTime()
    const diff = end - now

    if (diff <= 0) return null

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const getDealTypeLabel = (type: string) => {
    const labels = dealTypeLabels[type]
    if (!labels) return type
    return labels[language] || labels.en
  }

  const handleDeleteDeal = async () => {
    if (!dealToDelete) return

    setDeleting(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('marketplace_deals')
        .delete()
        .eq('id', dealToDelete)

      if (error) throw error

      setDeals(deals.filter(d => d.id !== dealToDelete))
      setShowDeleteModal(false)
      setDealToDelete(null)
    } catch (error) {
      console.error('Error deleting deal:', error)
    } finally {
      setDeleting(false)
    }
  }

  // Stats
  const totalDeals = deals.length
  const activeDeals = deals.filter(d => getDealStatus(d).status === 'active').length
  const flashSales = deals.filter(d => d.is_flash_sale).length
  const totalViews = deals.reduce((sum, d) => sum + (d.views_count || 0), 0)

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, typeFilter])

  // Filter deals
  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.title.toLowerCase().includes(searchTerm.toLowerCase())
    const status = getDealStatus(deal).status
    const matchesStatus = statusFilter === 'all' || status === statusFilter
    const matchesType = typeFilter === 'all' || deal.deal_type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  // Paginate deals
  const totalPages = Math.ceil(filteredDeals.length / ITEMS_PER_PAGE)
  const paginatedDeals = filteredDeals.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('deals', translations.deals)}</h1>
        <Link
          href="/deals/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t('createDeal', translations.createDeal)}
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalDeals}</p>
              <p className="text-xs text-gray-500">{t('totalDeals', translations.totalDeals)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{activeDeals}</p>
              <p className="text-xs text-gray-500">{t('activeDeals', translations.activeDeals)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{flashSales}</p>
              <p className="text-xs text-gray-500">{t('flashSales', translations.flashSales)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalViews}</p>
              <p className="text-xs text-gray-500">{t('totalViews', translations.totalViews)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder={t('search', translations.search)}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 flex-wrap">
            {(['all', 'active', 'scheduled', 'expired', 'inactive'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  statusFilter === status
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? t('allDeals', translations.allDeals) : t(status, translations[status as keyof typeof translations])}
              </button>
            ))}
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm bg-white"
          >
            <option value="all">All Types</option>
            {Object.keys(dealTypeLabels).map(type => (
              <option key={type} value={type}>{getDealTypeLabel(type)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Deals List */}
      {filteredDeals.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('noDeals', translations.noDeals)}</h3>
          <p className="text-gray-500 mb-6">{t('createFirst', translations.createFirst)}</p>
          <Link
            href="/deals/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t('createDeal', translations.createDeal)}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedDeals.map((deal) => {
            const status = getDealStatus(deal)
            const timeRemaining = deal.end_date ? getTimeRemaining(deal.end_date) : null

            return (
              <div
                key={deal.id}
                className={`bg-white rounded-xl border overflow-hidden hover:shadow-md transition-shadow ${
                  deal.is_flash_sale ? 'border-orange-200' : 'border-gray-200'
                }`}
              >
                {/* Deal Header */}
                <div className={`px-4 py-3 ${
                  deal.is_flash_sale ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-gradient-to-r from-primary-500 to-primary-600'
                } text-white`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-wider opacity-80">
                      {getDealTypeLabel(deal.deal_type)}
                    </span>
                    {deal.is_flash_sale && timeRemaining && (
                      <span className="text-xs font-mono bg-white/20 px-2 py-0.5 rounded">
                        {t('endsIn', translations.endsIn)} {timeRemaining}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-lg mt-1 truncate">{deal.title}</h3>
                </div>

                {/* Deal Content */}
                <div className="p-4">
                  {/* Discount Display */}
                  <div className="flex items-center gap-3 mb-3">
                    {deal.discount_percentage && (
                      <span className="text-2xl font-black text-primary-600">
                        {deal.discount_percentage}% {t('off', translations.off)}
                      </span>
                    )}
                    {deal.discount_amount && (
                      <span className="text-2xl font-black text-primary-600">
                        ${deal.discount_amount} {t('off', translations.off)}
                      </span>
                    )}
                    {deal.free_delivery && !deal.discount_percentage && !deal.discount_amount && (
                      <span className="text-lg font-bold text-green-600">
                        🚚 {t('freeDelivery', translations.freeDelivery)}
                      </span>
                    )}
                  </div>

                  {deal.min_purchase_amount && (
                    <p className="text-sm text-gray-500 mb-3">
                      {t('minOrder', translations.minOrder)}: ${deal.min_purchase_amount}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <span>{deal.views_count || 0} {t('views', translations.views)}</span>
                    <span>{deal.conversions_count || 0} {t('conversions', translations.conversions)}</span>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${status.color}`}>
                        {status.label}
                      </span>
                      {deal.is_featured && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                          ⭐ Featured
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/deals/${deal.id}`}
                        className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                        title={t('edit', translations.edit)}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                      <button
                        onClick={() => {
                          setDealToDelete(deal.id)
                          setShowDeleteModal(true)
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title={t('delete', translations.delete)}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {filteredDeals.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredDeals.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
          className="mt-6"
        />
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">{t('delete', translations.delete)}</h3>
            <p className="text-gray-600 mb-6">{t('confirmDelete', translations.confirmDelete)}</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setDealToDelete(null)
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteDeal}
                disabled={deleting}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : t('delete', translations.delete)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
