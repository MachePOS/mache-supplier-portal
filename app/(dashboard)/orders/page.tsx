'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/contexts/LanguageContext'
import { getSupplierId } from '@/lib/getSupplier'
import Pagination from '@/components/Pagination'

const ITEMS_PER_PAGE = 20

const translations = {
  orders: { en: 'Orders', fr: 'Commandes', ht: 'Kòmand', es: 'Pedidos' },
  search: { en: 'Search orders...', fr: 'Rechercher des commandes...', ht: 'Chèche kòmand...', es: 'Buscar pedidos...' },
  noOrders: { en: 'No orders yet', fr: 'Pas encore de commandes', ht: 'Pa gen kòmand ankò', es: 'Sin pedidos aún' },
  waitingOrders: { en: 'Orders will appear here when businesses place them', fr: 'Les commandes apparaîtront ici', ht: 'Kòmand yo ap parèt isit la', es: 'Los pedidos aparecerán aquí' },
  all: { en: 'All', fr: 'Tous', ht: 'Tout', es: 'Todos' },
  pending: { en: 'Pending', fr: 'En attente', ht: 'Ap tann', es: 'Pendiente' },
  confirmed: { en: 'Confirmed', fr: 'Confirmé', ht: 'Konfime', es: 'Confirmado' },
  processing: { en: 'Processing', fr: 'En traitement', ht: 'Ap trete', es: 'Procesando' },
  shipped: { en: 'Shipped', fr: 'Expédié', ht: 'Voye', es: 'Enviado' },
  delivered: { en: 'Delivered', fr: 'Livré', ht: 'Livre', es: 'Entregado' },
  cancelled: { en: 'Cancelled', fr: 'Annulé', ht: 'Anile', es: 'Cancelado' },
  view: { en: 'View', fr: 'Voir', ht: 'Wè', es: 'Ver' },
  items: { en: 'items', fr: 'articles', ht: 'atik', es: 'artículos' },
  delivery: { en: 'Delivery', fr: 'Livraison', ht: 'Livrezon', es: 'Entrega' },
  pickup: { en: 'Pickup', fr: 'Retrait', ht: 'Retire', es: 'Recoger' },
  dateFrom: { en: 'From', fr: 'De', ht: 'Depi', es: 'Desde' },
  dateTo: { en: 'To', fr: 'À', ht: 'Jiska', es: 'Hasta' },
  today: { en: 'Today', fr: 'Aujourd\'hui', ht: 'Jodi a', es: 'Hoy' },
  thisWeek: { en: 'This Week', fr: 'Cette semaine', ht: 'Semèn sa a', es: 'Esta semana' },
  thisMonth: { en: 'This Month', fr: 'Ce mois', ht: 'Mwa sa a', es: 'Este mes' },
  allTime: { en: 'All Time', fr: 'Tout le temps', ht: 'Tout tan', es: 'Todo el tiempo' },
  fulfillment: { en: 'Fulfillment', fr: 'Exécution', ht: 'Egzekisyon', es: 'Cumplimiento' },
  clearFilters: { en: 'Clear Filters', fr: 'Effacer les filtres', ht: 'Efase filtè yo', es: 'Limpiar filtros' },
}

interface Order {
  id: string
  order_number: string
  business_name: string
  total_amount: number
  total_items: number
  status: string
  fulfillment_type: string
  created_at: string
  delivery_city: string | null
  message_count?: number
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  received: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateRangeFilter, setDateRangeFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [fulfillmentFilter, setFulfillmentFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const { t } = useLanguage()

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      const supplierId = await getSupplierId()
      if (!supplierId) {
        setLoading(false)
        return
      }

      const supabase = createClient()
      const { data } = await supabase
        .from('marketplace_orders')
        .select('id, order_number, business_name, total_amount, total_items, status, fulfillment_type, created_at, delivery_city')
        .eq('supplier_id', supplierId)
        .order('created_at', { ascending: false })

      if (data && data.length > 0) {
        // Get message counts for all orders
        const orderIds = data.map(o => o.id)
        const { data: messageCounts } = await supabase
          .from('marketplace_order_messages')
          .select('order_id')
          .in('order_id', orderIds)

        // Count messages per order
        const countMap: Record<string, number> = {}
        messageCounts?.forEach(m => {
          countMap[m.order_id] = (countMap[m.order_id] || 0) + 1
        })

        // Add message counts to orders
        const ordersWithCounts = data.map(order => ({
          ...order,
          message_count: countMap[order.id] || 0
        }))

        setOrders(ordersWithCounts)
      } else {
        setOrders([])
      }
    } catch (error) {
      console.error('Error loading orders:', error)
    } finally {
      setLoading(false)
    }
  }

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, dateRangeFilter, dateFrom, dateTo, fulfillmentFilter])

  // Helper function for date range filtering
  const getDateRangeBounds = () => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    switch (dateRangeFilter) {
      case 'today':
        return { from: today, to: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
      case 'week':
        const weekStart = new Date(today)
        weekStart.setDate(today.getDate() - today.getDay())
        return { from: weekStart, to: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
      case 'month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
        return { from: monthStart, to: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
      case 'custom':
        return {
          from: dateFrom ? new Date(dateFrom) : null,
          to: dateTo ? new Date(new Date(dateTo).getTime() + 24 * 60 * 60 * 1000) : null
        }
      default:
        return { from: null, to: null }
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.business_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    const matchesFulfillment = fulfillmentFilter === 'all' || order.fulfillment_type === fulfillmentFilter

    // Date range filtering
    let matchesDate = true
    if (dateRangeFilter !== 'all') {
      const { from, to } = getDateRangeBounds()
      const orderDate = new Date(order.created_at)
      if (from && orderDate < from) matchesDate = false
      if (to && orderDate >= to) matchesDate = false
    }

    return matchesSearch && matchesStatus && matchesFulfillment && matchesDate
  })

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setDateRangeFilter('all')
    setDateFrom('')
    setDateTo('')
    setFulfillmentFilter('all')
  }

  const hasActiveFilters = searchTerm || statusFilter !== 'all' || dateRangeFilter !== 'all' || fulfillmentFilter !== 'all'

  // Paginate orders
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE)
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const statusCounts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t('orders', translations.orders)}</h1>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Top row: Search, Date Range, Fulfillment, Clear */}
        <div className="flex flex-wrap gap-3 items-center">
          <input
            type="text"
            placeholder={t('search', translations.search)}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-64"
          />

          {/* Date Range Quick Filters */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {[
              { value: 'all', label: t('allTime', translations.allTime) },
              { value: 'today', label: t('today', translations.today) },
              { value: 'week', label: t('thisWeek', translations.thisWeek) },
              { value: 'month', label: t('thisMonth', translations.thisMonth) },
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setDateRangeFilter(option.value)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  dateRangeFilter === option.value ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Custom Date Range */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value)
                setDateRangeFilter('custom')
              }}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
            <span className="text-gray-400">-</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value)
                setDateRangeFilter('custom')
              }}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Fulfillment Type Filter */}
          <select
            value={fulfillmentFilter}
            onChange={(e) => setFulfillmentFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white"
          >
            <option value="all">{t('fulfillment', translations.fulfillment)}: {t('all', translations.all)}</option>
            <option value="delivery">{t('delivery', translations.delivery)}</option>
            <option value="pickup">{t('pickup', translations.pickup)}</option>
          </select>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              {t('clearFilters', translations.clearFilters)}
            </button>
          )}
        </div>

        {/* Status filter row */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('all', translations.all)} ({orders.length})
          </button>
          {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === status ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t(status as keyof typeof translations, translations[status as keyof typeof translations])} ({statusCounts[status] || 0})
            </button>
          ))}
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('noOrders', translations.noOrders)}</h3>
          <p className="text-gray-500">{t('waitingOrders', translations.waitingOrders)}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-medium text-gray-900">{order.order_number}</span>
                      {order.message_count && order.message_count > 0 && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-primary-500 text-white text-xs font-medium rounded-full animate-pulse">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          {order.message_count}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{order.business_name}</p>
                      {order.delivery_city && (
                        <p className="text-sm text-gray-500">{order.delivery_city}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {order.total_items} {t('items', translations.items)}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    ${order.total_amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 text-sm ${
                      order.fulfillment_type === 'delivery' ? 'text-blue-600' : 'text-purple-600'
                    }`}>
                      {order.fulfillment_type === 'delivery' ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      )}
                      {order.fulfillment_type === 'delivery'
                        ? t('delivery', translations.delivery)
                        : t('pickup', translations.pickup)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                      {t(order.status as keyof typeof translations, translations[order.status as keyof typeof translations] || { en: order.status })}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/orders/${order.id}`}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      {t('view', translations.view)}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {filteredOrders.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredOrders.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
          className="mt-6"
        />
      )}
    </div>
  )
}
