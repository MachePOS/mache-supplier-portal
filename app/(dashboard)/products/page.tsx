'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/contexts/LanguageContext'
import { getSupplierId } from '@/lib/getSupplier'
import Pagination from '@/components/Pagination'
import ProductImportExport from '@/components/ProductImportExport'

const translations = {
  products: { en: 'Products', fr: 'Produits', ht: 'Pwodui', es: 'Productos' },
  addProduct: { en: 'Add Product', fr: 'Ajouter un produit', ht: 'Ajoute pwodui', es: 'Agregar producto' },
  search: { en: 'Search products...', fr: 'Rechercher des produits...', ht: 'Chèche pwodui...', es: 'Buscar productos...' },
  noProducts: { en: 'No products yet', fr: 'Pas encore de produits', ht: 'Pa gen pwodui ankò', es: 'Sin productos aún' },
  addFirst: { en: 'Add your first product to start selling', fr: 'Ajoutez votre premier produit', ht: 'Ajoute premye pwodui ou', es: 'Agrega tu primer producto' },
  active: { en: 'Active', fr: 'Actif', ht: 'Aktif', es: 'Activo' },
  inactive: { en: 'Inactive', fr: 'Inactif', ht: 'Inaktif', es: 'Inactivo' },
  inStock: { en: 'In Stock', fr: 'En stock', ht: 'Nan stòk', es: 'En stock' },
  outOfStock: { en: 'Out of Stock', fr: 'Rupture de stock', ht: 'Pa nan stòk', es: 'Agotado' },
  lowStock: { en: 'Low Stock', fr: 'Stock faible', ht: 'Stòk ba', es: 'Stock bajo' },
  edit: { en: 'Edit', fr: 'Modifier', ht: 'Modifye', es: 'Editar' },
  totalProducts: { en: 'Total Products', fr: 'Total produits', ht: 'Total pwodui', es: 'Total productos' },
  categories: { en: 'Categories', fr: 'Catégories', ht: 'Kategori', es: 'Categorías' },
  allCategories: { en: 'All Categories', fr: 'Toutes les catégories', ht: 'Tout kategori', es: 'Todas las categorías' },
  allStatus: { en: 'All Status', fr: 'Tous les statuts', ht: 'Tout estati', es: 'Todos los estados' },
  allStock: { en: 'All Stock', fr: 'Tout le stock', ht: 'Tout stòk', es: 'Todo el stock' },
  gridView: { en: 'Grid', fr: 'Grille', ht: 'Griy', es: 'Cuadrícula' },
  listView: { en: 'List', fr: 'Liste', ht: 'Lis', es: 'Lista' },
  needsRestock: { en: 'Needs restock', fr: 'Réapprovisionnement', ht: 'Bezwen restoke', es: 'Necesita reabastecimiento' },
  ofTotal: { en: 'of total', fr: 'du total', ht: 'nan total', es: 'del total' },
  showing: { en: 'Showing', fr: 'Affichage', ht: 'Montre', es: 'Mostrando' },
  of: { en: 'of', fr: 'sur', ht: 'nan', es: 'de' },
  product: { en: 'product', fr: 'produit', ht: 'pwodui', es: 'producto' },
  stock: { en: 'Stock', fr: 'Stock', ht: 'Stòk', es: 'Stock' },
  price: { en: 'Price', fr: 'Prix', ht: 'Pri', es: 'Precio' },
  status: { en: 'Status', fr: 'Statut', ht: 'Estati', es: 'Estado' },
  actions: { en: 'Actions', fr: 'Actions', ht: 'Aksyon', es: 'Acciones' },
  bulkActions: { en: 'Bulk Actions', fr: 'Actions groupées', ht: 'Aksyon an gwoup', es: 'Acciones masivas' },
  selected: { en: 'selected', fr: 'sélectionné(s)', ht: 'chwazi', es: 'seleccionado(s)' },
  selectAll: { en: 'Select All', fr: 'Tout sélectionner', ht: 'Chwazi tout', es: 'Seleccionar todo' },
  deselectAll: { en: 'Deselect All', fr: 'Tout désélectionner', ht: 'Deseleksyone tout', es: 'Deseleccionar todo' },
  activate: { en: 'Activate', fr: 'Activer', ht: 'Aktive', es: 'Activar' },
  deactivate: { en: 'Deactivate', fr: 'Désactiver', ht: 'Dezaktive', es: 'Desactivar' },
  delete: { en: 'Delete', fr: 'Supprimer', ht: 'Efase', es: 'Eliminar' },
  confirmDelete: { en: 'Are you sure you want to delete the selected products?', fr: 'Voulez-vous vraiment supprimer les produits sélectionnés?', ht: 'Èske ou sèten ou vle efase pwodui chwazi yo?', es: '¿Está seguro de eliminar los productos seleccionados?' },
  bulkActivateSuccess: { en: 'Products activated successfully', fr: 'Produits activés', ht: 'Pwodui yo aktive', es: 'Productos activados' },
  bulkDeactivateSuccess: { en: 'Products deactivated successfully', fr: 'Produits désactivés', ht: 'Pwodui yo dezaktive', es: 'Productos desactivados' },
  bulkDeleteSuccess: { en: 'Products deleted successfully', fr: 'Produits supprimés', ht: 'Pwodui yo efase', es: 'Productos eliminados' },
  cancel: { en: 'Cancel', fr: 'Annuler', ht: 'Anile', es: 'Cancelar' },
}

interface Product {
  id: string
  name: string
  sku: string
  price: number
  image_url: string | null
  is_active: boolean
  in_stock: boolean
  stock_quantity: number | null
  category: { name: string } | null
}

const LOW_STOCK_THRESHOLD = 10
const ITEMS_PER_PAGE = 20

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [stockFilter, setStockFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [bulkActionLoading, setBulkActionLoading] = useState(false)
  const { t } = useLanguage()

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const supplierId = await getSupplierId()
      if (!supplierId) {
        setLoading(false)
        return
      }

      const supabase = createClient()
      const { data } = await supabase
        .from('platform_supplier_products')
        .select('id, name, sku, price, image_url, is_active, in_stock, stock_quantity, category:platform_supplier_categories(name)')
        .eq('supplier_id', supplierId)
        .order('created_at', { ascending: false })

      const products = (data || []).map((item: any) => ({
        ...item,
        category: Array.isArray(item.category) ? item.category[0] || null : item.category
      }))
      setProducts(products)
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate stats
  const totalProducts = products.length
  const categories = Array.from(new Set(products.map(p => p.category?.name).filter(Boolean))) as string[]
  const inStockCount = products.filter(p => p.in_stock).length
  const lowStockCount = products.filter(p => p.stock_quantity !== null && p.stock_quantity > 0 && p.stock_quantity <= LOW_STOCK_THRESHOLD).length
  const outOfStockCount = products.filter(p => !p.in_stock || p.stock_quantity === 0).length

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, categoryFilter, statusFilter, stockFilter])

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || p.category?.name === categoryFilter
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && p.is_active) ||
      (statusFilter === 'inactive' && !p.is_active)
    const matchesStock = stockFilter === 'all' ||
      (stockFilter === 'inStock' && p.in_stock && (p.stock_quantity === null || p.stock_quantity > LOW_STOCK_THRESHOLD)) ||
      (stockFilter === 'lowStock' && p.stock_quantity !== null && p.stock_quantity > 0 && p.stock_quantity <= LOW_STOCK_THRESHOLD) ||
      (stockFilter === 'outOfStock' && (!p.in_stock || p.stock_quantity === 0))

    return matchesSearch && matchesCategory && matchesStatus && matchesStock
  })

  // Paginate products
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE)
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const getStockStatus = (product: Product) => {
    if (!product.in_stock || product.stock_quantity === 0) {
      return { label: t('outOfStock', translations.outOfStock), color: 'bg-red-100 text-red-800', dot: 'bg-red-500' }
    }
    if (product.stock_quantity !== null && product.stock_quantity <= LOW_STOCK_THRESHOLD) {
      return { label: t('lowStock', translations.lowStock), color: 'bg-yellow-100 text-yellow-800', dot: 'bg-yellow-500' }
    }
    return { label: t('inStock', translations.inStock), color: 'bg-green-100 text-green-800', dot: 'bg-green-500' }
  }

  // Bulk action handlers
  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedProducts.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(paginatedProducts.map(p => p.id))
    }
  }

  const toggleSelectProduct = (productId: string) => {
    if (selectedIds.includes(productId)) {
      setSelectedIds(selectedIds.filter(id => id !== productId))
    } else {
      setSelectedIds([...selectedIds, productId])
    }
  }

  const handleBulkActivate = async () => {
    if (selectedIds.length === 0) return
    setBulkActionLoading(true)
    try {
      const supabase = createClient()
      await supabase
        .from('platform_supplier_products')
        .update({ is_active: true })
        .in('id', selectedIds)

      setProducts(products.map(p =>
        selectedIds.includes(p.id) ? { ...p, is_active: true } : p
      ))
      setSelectedIds([])
    } catch (error) {
      console.error('Error activating products:', error)
    } finally {
      setBulkActionLoading(false)
    }
  }

  const handleBulkDeactivate = async () => {
    if (selectedIds.length === 0) return
    setBulkActionLoading(true)
    try {
      const supabase = createClient()
      await supabase
        .from('platform_supplier_products')
        .update({ is_active: false })
        .in('id', selectedIds)

      setProducts(products.map(p =>
        selectedIds.includes(p.id) ? { ...p, is_active: false } : p
      ))
      setSelectedIds([])
    } catch (error) {
      console.error('Error deactivating products:', error)
    } finally {
      setBulkActionLoading(false)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return
    setBulkActionLoading(true)
    try {
      const supabase = createClient()
      await supabase
        .from('platform_supplier_products')
        .delete()
        .in('id', selectedIds)

      setProducts(products.filter(p => !selectedIds.includes(p.id)))
      setSelectedIds([])
      setShowDeleteModal(false)
    } catch (error) {
      console.error('Error deleting products:', error)
    } finally {
      setBulkActionLoading(false)
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
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('products', translations.products)}</h1>
        <div className="flex flex-wrap items-center gap-3">
          <ProductImportExport
            products={products.map(p => ({
              ...p,
              description: null,
              cost_price: null,
              unit_of_measure: null,
              minimum_order_quantity: 1,
            }))}
            onImportComplete={loadProducts}
          />
          <Link
            href="/products/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t('addProduct', translations.addProduct)}
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Total Products */}
        <div
          onClick={() => { setCategoryFilter('all'); setStatusFilter('all'); setStockFilter('all'); }}
          className="bg-white rounded-xl border-2 border-gray-300 shadow-sm p-4 hover:shadow-md hover:border-indigo-400 hover:bg-indigo-50/30 transition-all duration-200 cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
              <p className="text-xs text-gray-500">{t('totalProducts', translations.totalProducts)}</p>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div
          onClick={() => { setCategoryFilter('all'); setStatusFilter('active'); setStockFilter('all'); }}
          className="bg-white rounded-xl border-2 border-gray-300 shadow-sm p-4 hover:shadow-md hover:border-purple-400 hover:bg-purple-50/30 transition-all duration-200 cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
              <p className="text-xs text-gray-500">{t('categories', translations.categories)}</p>
            </div>
          </div>
        </div>

        {/* In Stock */}
        <div
          onClick={() => { setCategoryFilter('all'); setStatusFilter('all'); setStockFilter('inStock'); }}
          className="bg-white rounded-xl border-2 border-gray-300 shadow-sm p-4 hover:shadow-md hover:border-green-400 hover:bg-green-50/30 transition-all duration-200 cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{inStockCount}</p>
              <p className="text-xs text-gray-500">{t('inStock', translations.inStock)}</p>
            </div>
          </div>
          {totalProducts > 0 && (
            <p className="text-xs text-gray-400 mt-2">{Math.round((inStockCount / totalProducts) * 100)}% {t('ofTotal', translations.ofTotal)}</p>
          )}
        </div>

        {/* Low Stock */}
        <div
          onClick={() => { setCategoryFilter('all'); setStatusFilter('all'); setStockFilter('lowStock'); }}
          className="bg-white rounded-xl border-2 border-gray-300 shadow-sm p-4 hover:shadow-md hover:border-orange-400 hover:bg-orange-50/30 transition-all duration-200 cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{lowStockCount + outOfStockCount}</p>
              <p className="text-xs text-gray-500">{t('lowStock', translations.lowStock)}</p>
            </div>
          </div>
          {(lowStockCount + outOfStockCount) > 0 && (
            <p className="text-xs text-orange-600 mt-2">{t('needsRestock', translations.needsRestock)}</p>
          )}
        </div>
      </div>

      {/* Filters & View Toggle */}
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
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm bg-white"
            >
              <option value="all">{t('allCategories', translations.allCategories)}</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm bg-white"
            >
              <option value="all">{t('allStatus', translations.allStatus)}</option>
              <option value="active">{t('active', translations.active)}</option>
              <option value="inactive">{t('inactive', translations.inactive)}</option>
            </select>

            {/* Stock Filter */}
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm bg-white"
            >
              <option value="all">{t('allStock', translations.allStock)}</option>
              <option value="inStock">{t('inStock', translations.inStock)}</option>
              <option value="lowStock">{t('lowStock', translations.lowStock)}</option>
              <option value="outOfStock">{t('outOfStock', translations.outOfStock)}</option>
            </select>

            {/* View Toggle */}
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 flex items-center gap-1 text-sm ${
                  viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                {t('gridView', translations.gridView)}
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 flex items-center gap-1 text-sm border-l border-gray-300 ${
                  viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                {t('listView', translations.listView)}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Products Count */}
      {filteredProducts.length > 0 && (
        <p className="text-sm text-gray-500 mb-4">
          {t('showing', translations.showing)} {filteredProducts.length} {t('of', translations.of)} {totalProducts} {t('products', translations.products).toLowerCase()}
        </p>
      )}

      {/* Bulk Actions Toolbar */}
      {selectedIds.length > 0 && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-3 mb-4 flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-primary-800">
            {selectedIds.length} {t('selected', translations.selected)}
          </span>
          <div className="flex gap-2 ml-auto">
            <button
              type="button"
              onClick={handleBulkActivate}
              disabled={bulkActionLoading}
              className="px-3 py-1.5 text-sm font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
            >
              {t('activate', translations.activate)}
            </button>
            <button
              type="button"
              onClick={handleBulkDeactivate}
              disabled={bulkActionLoading}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {t('deactivate', translations.deactivate)}
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              disabled={bulkActionLoading}
              className="px-3 py-1.5 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
            >
              {t('delete', translations.delete)}
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
            >
              {t('deselectAll', translations.deselectAll)}
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('noProducts', translations.noProducts)}</h3>
          <p className="text-gray-500 mb-6">{t('addFirst', translations.addFirst)}</p>
          <Link
            href="/products/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t('addProduct', translations.addProduct)}
          </Link>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {paginatedProducts.map((product) => {
            const stockStatus = getStockStatus(product)
            const isSelected = selectedIds.includes(product.id)
            return (
              <div key={product.id} className={`bg-white rounded-xl border overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full ${isSelected ? 'border-primary-500 ring-2 ring-primary-200' : 'border-gray-200'}`}>
                {/* Product Image - Fixed Height */}
                <div className="h-40 bg-gray-100 relative flex-shrink-0">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  {/* Selection Checkbox */}
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); toggleSelectProduct(product.id); }}
                    className={`absolute top-2 right-2 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                      isSelected ? 'bg-primary-600 border-primary-600' : 'bg-white/80 border-gray-300 hover:border-primary-500'
                    }`}
                  >
                    {isSelected && (
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  {/* Status Badge */}
                  {!product.is_active && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 bg-gray-800 text-white text-xs font-medium rounded">
                      {t('inactive', translations.inactive)}
                    </span>
                  )}
                </div>

                {/* Product Info - Fixed Height */}
                <div className="p-3 flex flex-col flex-1">
                  <h3 className="font-medium text-gray-900 text-sm line-clamp-2 min-h-[2.5rem]">{product.name}</h3>
                  <p className="text-xs text-gray-500 truncate">{product.sku || '-'}</p>

                  <div className="mt-auto pt-2">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-gray-900">${product.price.toFixed(2)}</p>
                      <div className="flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${stockStatus.dot}`}></span>
                        <span className="text-xs text-gray-500">
                          {product.stock_quantity !== null ? product.stock_quantity : '-'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${stockStatus.color}`}>
                        {stockStatus.label}
                      </span>
                      <Link
                        href={`/products/${product.id}`}
                        className="text-primary-600 hover:text-primary-700 text-xs font-medium"
                      >
                        {t('edit', translations.edit)}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <button
                      type="button"
                      onClick={toggleSelectAll}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        selectedIds.length === paginatedProducts.length && paginatedProducts.length > 0
                          ? 'bg-primary-600 border-primary-600'
                          : 'bg-white border-gray-300 hover:border-primary-500'
                      }`}
                    >
                      {selectedIds.length === paginatedProducts.length && paginatedProducts.length > 0 && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('product', translations.product)}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('categories', translations.categories)}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('price', translations.price)}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('stock', translations.stock)}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('status', translations.status)}</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('actions', translations.actions)}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedProducts.map((product) => {
                  const stockStatus = getStockStatus(product)
                  const isSelected = selectedIds.includes(product.id)
                  return (
                    <tr key={product.id} className={`hover:bg-gray-50 ${isSelected ? 'bg-primary-50' : ''}`}>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => toggleSelectProduct(product.id)}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                            isSelected ? 'bg-primary-600 border-primary-600' : 'bg-white border-gray-300 hover:border-primary-500'
                          }`}
                        >
                          {isSelected && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                            {product.image_url ? (
                              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            )}
                          </div>
                          <span className="font-medium text-gray-900 text-sm">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{product.sku || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{product.category?.name || '-'}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">${product.price.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${stockStatus.dot}`}></span>
                          <span className="text-sm text-gray-700">
                            {product.stock_quantity !== null ? product.stock_quantity : '-'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex w-fit px-2 py-0.5 text-xs font-medium rounded-full ${
                            product.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {product.is_active ? t('active', translations.active) : t('inactive', translations.inactive)}
                          </span>
                          <span className={`inline-flex w-fit px-2 py-0.5 text-xs font-medium rounded-full ${stockStatus.color}`}>
                            {stockStatus.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/products/${product.id}`}
                          className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 text-sm font-medium"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          {t('edit', translations.edit)}
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {filteredProducts.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredProducts.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
          className="mt-6"
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{t('delete', translations.delete)} ({selectedIds.length})</h3>
            </div>
            <p className="text-gray-600 mb-6">{t('confirmDelete', translations.confirmDelete)}</p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={bulkActionLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {t('cancel', translations.cancel)}
              </button>
              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={bulkActionLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {bulkActionLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                )}
                {t('delete', translations.delete)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
