'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/contexts/LanguageContext'
import { getSupplierId } from '@/lib/getSupplier'

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

      setOrders(data || [])
    } catch (error) {
      console.error('Error loading orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.business_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

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
      <div className="mb-6 flex flex-wrap gap-4">
        <input
          type="text"
          placeholder={t('search', translations.search)}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />

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
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm font-medium text-gray-900">{order.order_number}</span>
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
    </div>
  )
}
