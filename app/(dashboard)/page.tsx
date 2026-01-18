'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/contexts/LanguageContext'
import { getSupplierInfo } from '@/lib/getSupplier'

const translations = {
  welcome: { en: 'Welcome back', fr: 'Bon retour', ht: 'Byenveni ankò', es: 'Bienvenido de nuevo' },
  dashboard: { en: 'Dashboard', fr: 'Tableau de bord', ht: 'Tablo bò', es: 'Panel' },
  totalProducts: { en: 'Total Products', fr: 'Total des produits', ht: 'Total pwodui', es: 'Total de productos' },
  activeProducts: { en: 'Active Products', fr: 'Produits actifs', ht: 'Pwodui aktif', es: 'Productos activos' },
  pendingOrders: { en: 'Pending Orders', fr: 'Commandes en attente', ht: 'Kòmand an atant', es: 'Pedidos pendientes' },
  totalSales: { en: 'Total Sales', fr: 'Ventes totales', ht: 'Total lavant', es: 'Ventas totales' },
  recentOrders: { en: 'Recent Orders', fr: 'Commandes récentes', ht: 'Kòmand resan', es: 'Pedidos recientes' },
  noOrders: { en: 'No orders yet', fr: 'Pas encore de commandes', ht: 'Pa gen kòmand ankò', es: 'Sin pedidos aún' },
  viewAll: { en: 'View All', fr: 'Voir tout', ht: 'Wè tout', es: 'Ver todo' },
  quickActions: { en: 'Quick Actions', fr: 'Actions rapides', ht: 'Aksyon rapid', es: 'Acciones rápidas' },
  addProduct: { en: 'Add Product', fr: 'Ajouter un produit', ht: 'Ajoute pwodui', es: 'Agregar producto' },
  viewOrders: { en: 'View Orders', fr: 'Voir les commandes', ht: 'Wè kòmand', es: 'Ver pedidos' },
  updateProfile: { en: 'Update Profile', fr: 'Mettre à jour le profil', ht: 'Mete ajou pwofil', es: 'Actualizar perfil' },
}

interface Stats {
  totalProducts: number
  activeProducts: number
  pendingOrders: number
  totalSales: number
}

interface Order {
  id: string
  order_number: string
  business_name: string
  total_amount: number
  status: string
  created_at: string
}

export default function SupplierDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    activeProducts: 0,
    pendingOrders: 0,
    totalSales: 0,
  })
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [supplierName, setSupplierName] = useState('')
  const [loading, setLoading] = useState(true)
  const { t } = useLanguage()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const supplierInfo = await getSupplierInfo()

      if (!supplierInfo) {
        setLoading(false)
        return
      }

      setSupplierName(supplierInfo.name)
      const supabase = createClient()
      await loadSupplierStats(supabase, supplierInfo.id)
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadSupplierStats = async (supabase: any, supplierId: string) => {
    // Get product counts
    const { count: totalProducts } = await supabase
      .from('platform_supplier_products')
      .select('*', { count: 'exact', head: true })
      .eq('supplier_id', supplierId)

    const { count: activeProducts } = await supabase
      .from('platform_supplier_products')
      .select('*', { count: 'exact', head: true })
      .eq('supplier_id', supplierId)
      .eq('is_active', true)

    // Get pending orders count
    const { count: pendingOrders } = await supabase
      .from('marketplace_orders')
      .select('*', { count: 'exact', head: true })
      .eq('supplier_id', supplierId)
      .in('status', ['pending', 'confirmed', 'processing'])

    // Get total sales
    const { data: salesData } = await supabase
      .from('marketplace_orders')
      .select('total_amount')
      .eq('supplier_id', supplierId)
      .in('status', ['delivered', 'received'])

    const totalSales = salesData?.reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0) || 0

    // Get recent orders
    const { data: orders } = await supabase
      .from('marketplace_orders')
      .select('id, order_number, business_name, total_amount, status, created_at')
      .eq('supplier_id', supplierId)
      .order('created_at', { ascending: false })
      .limit(5)

    setStats({
      totalProducts: totalProducts || 0,
      activeProducts: activeProducts || 0,
      pendingOrders: pendingOrders || 0,
      totalSales,
    })

    setRecentOrders(orders || [])
  }

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-indigo-100 text-indigo-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      received: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    }
    return statusColors[status] || 'bg-gray-100 text-gray-800'
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
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900">
          {t('welcome', translations.welcome)}, {supplierName}
        </h1>
        <p className="text-sm text-gray-500">{t('dashboard', translations.dashboard)}</p>
      </div>

      {/* Stats Grid - More Compact */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <Link href="/products" className="bg-white rounded-lg p-4 border-2 border-gray-300 shadow-sm hover:shadow-md hover:border-primary-400 hover:bg-primary-50/30 transition-all duration-200 cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500">{t('totalProducts', translations.totalProducts)}</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalProducts}</p>
            </div>
          </div>
        </Link>

        <Link href="/products?status=active" className="bg-white rounded-lg p-4 border-2 border-gray-300 shadow-sm hover:shadow-md hover:border-green-400 hover:bg-green-50/30 transition-all duration-200 cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500">{t('activeProducts', translations.activeProducts)}</p>
              <p className="text-xl font-bold text-gray-900">{stats.activeProducts}</p>
            </div>
          </div>
        </Link>

        <Link href="/orders?status=pending" className="bg-white rounded-lg p-4 border-2 border-gray-300 shadow-sm hover:shadow-md hover:border-yellow-400 hover:bg-yellow-50/30 transition-all duration-200 cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500">{t('pendingOrders', translations.pendingOrders)}</p>
              <p className="text-xl font-bold text-gray-900">{stats.pendingOrders}</p>
            </div>
          </div>
        </Link>

        <Link href="/analytics" className="bg-white rounded-lg p-4 border-2 border-gray-300 shadow-sm hover:shadow-md hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-200 cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500">{t('totalSales', translations.totalSales)}</p>
              <p className="text-xl font-bold text-gray-900">${stats.totalSales.toFixed(2)}</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Main Content - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-100">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">{t('recentOrders', translations.recentOrders)}</h2>
            <a href="/orders" className="text-xs text-primary-600 hover:text-primary-700">
              {t('viewAll', translations.viewAll)}
            </a>
          </div>
          <div className="p-3">
            {recentOrders.length === 0 ? (
              <p className="text-gray-500 text-center py-6 text-sm">{t('noOrders', translations.noOrders)}</p>
            ) : (
              <div className="space-y-2">
                {recentOrders.map((order) => (
                  <a key={order.id} href={`/orders/${order.id}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{order.order_number}</p>
                      <p className="text-xs text-gray-500">{order.business_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">${order.total_amount?.toFixed(2)}</p>
                      <span className={`inline-flex px-1.5 py-0.5 text-[10px] font-medium rounded-full ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-gray-100">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">{t('quickActions', translations.quickActions)}</h2>
          </div>
          <div className="p-3 space-y-2">
            <a
              href="/products/new"
              className="flex items-center gap-3 p-3 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
            >
              <div className="p-1.5 bg-primary-100 rounded">
                <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="text-sm font-medium text-primary-700">{t('addProduct', translations.addProduct)}</span>
            </a>

            <a
              href="/orders"
              className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <div className="p-1.5 bg-blue-100 rounded">
                <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <span className="text-sm font-medium text-blue-700">{t('viewOrders', translations.viewOrders)}</span>
            </a>

            <a
              href="/settings"
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="p-1.5 bg-gray-200 rounded">
                <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700">{t('updateProfile', translations.updateProfile)}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
