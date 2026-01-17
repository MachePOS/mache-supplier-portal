'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/contexts/LanguageContext'

const translations = {
  analytics: { en: 'Analytics & Reports', fr: 'Analytique et rapports', ht: 'Analitik ak rapò', es: 'Análisis e informes' },
  overview: { en: 'Overview', fr: 'Aperçu', ht: 'Apèsi', es: 'Resumen' },
  totalRevenue: { en: 'Total Revenue', fr: 'Revenu total', ht: 'Revni total', es: 'Ingresos totales' },
  totalOrders: { en: 'Total Orders', fr: 'Total des commandes', ht: 'Total kòmand', es: 'Pedidos totales' },
  avgOrderValue: { en: 'Avg Order Value', fr: 'Valeur moyenne', ht: 'Valè mwayèn', es: 'Valor promedio' },
  totalCustomers: { en: 'Total Customers', fr: 'Total clients', ht: 'Total kliyan', es: 'Clientes totales' },
  recentOrders: { en: 'Recent Orders', fr: 'Commandes récentes', ht: 'Kòmand resan', es: 'Pedidos recientes' },
  topProducts: { en: 'Top Products', fr: 'Meilleurs produits', ht: 'Pi bon pwodwi', es: 'Productos principales' },
  salesByStatus: { en: 'Orders by Status', fr: 'Commandes par statut', ht: 'Kòmand pa estati', es: 'Pedidos por estado' },
  pending: { en: 'Pending', fr: 'En attente', ht: 'Ap tann', es: 'Pendiente' },
  confirmed: { en: 'Confirmed', fr: 'Confirmé', ht: 'Konfime', es: 'Confirmado' },
  processing: { en: 'Processing', fr: 'En traitement', ht: 'Ap trete', es: 'Procesando' },
  shipped: { en: 'Shipped', fr: 'Expédié', ht: 'Voye', es: 'Enviado' },
  delivered: { en: 'Delivered', fr: 'Livré', ht: 'Livre', es: 'Entregado' },
  received: { en: 'Received', fr: 'Reçu', ht: 'Resevwa', es: 'Recibido' },
  cancelled: { en: 'Cancelled', fr: 'Annulé', ht: 'Anile', es: 'Cancelado' },
  thisMonth: { en: 'This Month', fr: 'Ce mois', ht: 'Mwa sa a', es: 'Este mes' },
  lastMonth: { en: 'Last Month', fr: 'Mois dernier', ht: 'Mwa pase a', es: 'Mes pasado' },
  last30Days: { en: 'Last 30 Days', fr: '30 derniers jours', ht: '30 dènye jou', es: 'Últimos 30 días' },
  last90Days: { en: 'Last 90 Days', fr: '90 derniers jours', ht: '90 dènye jou', es: 'Últimos 90 días' },
  allTime: { en: 'All Time', fr: 'Tout le temps', ht: 'Tout tan', es: 'Todo el tiempo' },
  unitsSold: { en: 'units sold', fr: 'unités vendues', ht: 'inite vann', es: 'unidades vendidas' },
  revenue: { en: 'revenue', fr: 'revenu', ht: 'revni', es: 'ingresos' },
  loading: { en: 'Loading analytics...', fr: 'Chargement...', ht: 'Ap chaje...', es: 'Cargando...' },
  noData: { en: 'No data available', fr: 'Aucune donnée', ht: 'Pa gen done', es: 'Sin datos' },
  payouts: { en: 'Payouts', fr: 'Paiements', ht: 'Peman', es: 'Pagos' },
  pendingPayout: { en: 'Pending Payout', fr: 'Paiement en attente', ht: 'Peman ap tann', es: 'Pago pendiente' },
  lastPayout: { en: 'Last Payout', fr: 'Dernier paiement', ht: 'Dènye peman', es: 'Último pago' },
  totalPaid: { en: 'Total Paid Out', fr: 'Total payé', ht: 'Total peye', es: 'Total pagado' },
  commissionRate: { en: 'Commission Rate', fr: 'Taux de commission', ht: 'To komisyon', es: 'Tasa de comisión' },
}

interface AnalyticsData {
  totalRevenue: number
  totalOrders: number
  avgOrderValue: number
  totalCustomers: number
  ordersByStatus: Record<string, number>
  topProducts: { id: string; name: string; quantity: number; revenue: number }[]
  recentOrders: { id: string; order_number: string; business_name: string; total: number; status: string; created_at: string }[]
  pendingPayout: number
  lastPayout: { amount: number; date: string } | null
  totalPaidOut: number
}

export default function AnalyticsPage() {
  const { t } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('last30Days')
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    totalCustomers: 0,
    ordersByStatus: {},
    topProducts: [],
    recentOrders: [],
    pendingPayout: 0,
    lastPayout: null,
    totalPaidOut: 0,
  })

  useEffect(() => {
    loadAnalytics()
  }, [dateRange])

  const getDateFilter = () => {
    const now = new Date()
    switch (dateRange) {
      case 'thisMonth':
        return new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      case 'lastMonth':
        return new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
      case 'last30Days':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
      case 'last90Days':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString()
      default:
        return null
    }
  }

  const loadAnalytics = async () => {
    setLoading(true)
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Get supplier ID - try supplier_users first, then fallback to contact_email
    let supplierId: string | null = null

    const { data: supplierUser } = await supabase
      .from('supplier_users')
      .select('supplier_id')
      .eq('auth_user_id', user.id)
      .single()

    if (supplierUser) {
      supplierId = supplierUser.supplier_id
    } else {
      // Fallback: check by contact email
      const { data: supplier } = await supabase
        .from('platform_suppliers')
        .select('id')
        .eq('contact_email', user.email)
        .single()

      if (supplier) {
        supplierId = supplier.id
      }
    }

    if (!supplierId) {
      setLoading(false)
      return
    }

    const dateFilter = getDateFilter()

    // Build orders query
    let ordersQuery = supabase
      .from('marketplace_orders')
      .select('*, marketplace_order_items(*)')
      .eq('supplier_id', supplierId)

    if (dateFilter) {
      ordersQuery = ordersQuery.gte('created_at', dateFilter)
    }

    const { data: orders } = await ordersQuery

    // Calculate analytics
    const totalRevenue = orders?.reduce((sum, o) => o.status !== 'cancelled' ? sum + (o.total_amount || 0) : sum, 0) || 0
    const totalOrders = orders?.filter(o => o.status !== 'cancelled').length || 0
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Get unique customers
    const customerIds = new Set(orders?.map(o => o.business_id))
    const totalCustomers = customerIds.size

    // Orders by status
    const ordersByStatus: Record<string, number> = {}
    orders?.forEach(o => {
      ordersByStatus[o.status] = (ordersByStatus[o.status] || 0) + 1
    })

    // Top products
    const productStats: Record<string, { name: string; quantity: number; revenue: number }> = {}
    orders?.forEach(order => {
      if (order.status !== 'cancelled') {
        order.marketplace_order_items?.forEach((item: any) => {
          if (!productStats[item.product_id]) {
            productStats[item.product_id] = { name: item.product_name, quantity: 0, revenue: 0 }
          }
          productStats[item.product_id].quantity += item.quantity
          productStats[item.product_id].revenue += item.quantity * item.unit_price
        })
      }
    })

    const topProducts = Object.entries(productStats)
      .map(([id, stats]) => ({ id, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    // Recent orders
    const recentOrders = orders
      ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
      .map(o => ({
        id: o.id,
        order_number: o.order_number,
        business_name: o.business_name || 'Unknown',
        total: o.total_amount,
        status: o.status,
        created_at: o.created_at,
      })) || []

    // Get payouts
    const { data: payouts } = await supabase
      .from('supplier_payouts')
      .select('*')
      .eq('supplier_id', supplierId)
      .order('created_at', { ascending: false })

    const pendingPayout = payouts?.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0) || 0
    const completedPayouts = payouts?.filter(p => p.status === 'completed') || []
    const lastPayout = completedPayouts.length > 0
      ? { amount: completedPayouts[0].amount, date: completedPayouts[0].paid_at }
      : null
    const totalPaidOut = completedPayouts.reduce((sum, p) => sum + p.amount, 0)

    setAnalytics({
      totalRevenue,
      totalOrders,
      avgOrderValue,
      totalCustomers,
      ordersByStatus,
      topProducts,
      recentOrders,
      pendingPayout,
      lastPayout,
      totalPaidOut,
    })

    setLoading(false)
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

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">{t('loading', translations.loading)}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t('analytics', translations.analytics)}</h1>

        {/* Date Range Filter */}
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="thisMonth">{t('thisMonth', translations.thisMonth)}</option>
          <option value="lastMonth">{t('lastMonth', translations.lastMonth)}</option>
          <option value="last30Days">{t('last30Days', translations.last30Days)}</option>
          <option value="last90Days">{t('last90Days', translations.last90Days)}</option>
          <option value="allTime">{t('allTime', translations.allTime)}</option>
        </select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('totalRevenue', translations.totalRevenue)}</p>
              <p className="text-2xl font-bold text-gray-900">${analytics.totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('totalOrders', translations.totalOrders)}</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('avgOrderValue', translations.avgOrderValue)}</p>
              <p className="text-2xl font-bold text-gray-900">${analytics.avgOrderValue.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('totalCustomers', translations.totalCustomers)}</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalCustomers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payouts Section */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('payouts', translations.payouts)}</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-500">{t('pendingPayout', translations.pendingPayout)}</p>
            <p className="text-xl font-bold text-yellow-600">${analytics.pendingPayout.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{t('lastPayout', translations.lastPayout)}</p>
            {analytics.lastPayout ? (
              <p className="text-xl font-bold text-green-600">
                ${analytics.lastPayout.amount.toFixed(2)}
                <span className="text-sm font-normal text-gray-500 ml-2">
                  {new Date(analytics.lastPayout.date).toLocaleDateString()}
                </span>
              </p>
            ) : (
              <p className="text-gray-400">-</p>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-500">{t('totalPaid', translations.totalPaid)}</p>
            <p className="text-xl font-bold text-gray-900">${analytics.totalPaidOut.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{t('commissionRate', translations.commissionRate)}</p>
            <p className="text-xl font-bold text-gray-900">5%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Orders by Status */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('salesByStatus', translations.salesByStatus)}</h2>
          <div className="space-y-3">
            {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'received', 'cancelled'].map(status => {
              const count = analytics.ordersByStatus[status] || 0
              const total = analytics.totalOrders + (analytics.ordersByStatus['cancelled'] || 0)
              const percentage = total > 0 ? (count / total) * 100 : 0

              return (
                <div key={status} className="flex items-center gap-3">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[status]} min-w-[90px] justify-center`}>
                    {t(status as keyof typeof translations, translations[status as keyof typeof translations])}
                  </span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${status === 'cancelled' ? 'bg-red-400' : 'bg-blue-500'}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 min-w-[40px] text-right">{count}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('topProducts', translations.topProducts)}</h2>
          {analytics.topProducts.length > 0 ? (
            <div className="space-y-4">
              {analytics.topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center gap-4">
                  <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">
                      {product.quantity} {t('unitsSold', translations.unitsSold)} · ${product.revenue.toFixed(2)} {t('revenue', translations.revenue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">{t('noData', translations.noData)}</p>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('recentOrders', translations.recentOrders)}</h2>
        {analytics.recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {analytics.recentOrders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-sm">{order.order_number}</td>
                    <td className="px-4 py-3">{order.business_name}</td>
                    <td className="px-4 py-3 font-medium">${order.total.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[order.status]}`}>
                        {t(order.status as keyof typeof translations, translations[order.status as keyof typeof translations])}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">{t('noData', translations.noData)}</p>
        )}
      </div>
    </div>
  )
}
