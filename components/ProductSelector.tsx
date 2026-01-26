'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/contexts/LanguageContext'
import { getSupplierId } from '@/lib/getSupplier'

const translations = {
  selectProducts: { en: 'Select Products', fr: 'Sélectionner des produits', ht: 'Chwazi pwodui', es: 'Seleccionar productos' },
  searchProducts: { en: 'Search products...', fr: 'Rechercher des produits...', ht: 'Chèche pwodui...', es: 'Buscar productos...' },
  selectedProducts: { en: 'Selected Products', fr: 'Produits sélectionnés', ht: 'Pwodui chwazi', es: 'Productos seleccionados' },
  noProductsSelected: { en: 'No products selected', fr: 'Aucun produit sélectionné', ht: 'Pa gen pwodui chwazi', es: 'Ningún producto seleccionado' },
  availableProducts: { en: 'Available Products', fr: 'Produits disponibles', ht: 'Pwodui disponib', es: 'Productos disponibles' },
  noProducts: { en: 'No products found', fr: 'Aucun produit trouvé', ht: 'Pa jwenn pwodui', es: 'No se encontraron productos' },
  selectAll: { en: 'Select All', fr: 'Tout sélectionner', ht: 'Chwazi tout', es: 'Seleccionar todo' },
  clearAll: { en: 'Clear All', fr: 'Tout effacer', ht: 'Efase tout', es: 'Borrar todo' },
  loading: { en: 'Loading...', fr: 'Chargement...', ht: 'Ap chaje...', es: 'Cargando...' },
  product: { en: 'product', fr: 'produit', ht: 'pwodui', es: 'producto' },
  products: { en: 'products', fr: 'produits', ht: 'pwodui', es: 'productos' },
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

interface ProductSelectorProps {
  selectedProductIds: string[]
  onSelectionChange: (productIds: string[]) => void
  className?: string
}

export default function ProductSelector({ selectedProductIds, onSelectionChange, className }: ProductSelectorProps) {
  const { t, language } = useLanguage()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showSelector, setShowSelector] = useState(false)

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
        .eq('is_active', true)
        .order('name', { ascending: true })

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

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedProducts = products.filter(p => selectedProductIds.includes(p.id))
  const availableProducts = filteredProducts.filter(p => !selectedProductIds.includes(p.id))

  const toggleProduct = (productId: string) => {
    if (selectedProductIds.includes(productId)) {
      onSelectionChange(selectedProductIds.filter(id => id !== productId))
    } else {
      onSelectionChange([...selectedProductIds, productId])
    }
  }

  const selectAll = () => {
    const allIds = filteredProducts.map(p => p.id)
    const uniqueIds = [...new Set([...selectedProductIds, ...allIds])]
    onSelectionChange(uniqueIds)
  }

  const clearAll = () => {
    onSelectionChange([])
  }

  const removeProduct = (productId: string) => {
    onSelectionChange(selectedProductIds.filter(id => id !== productId))
  }

  if (loading) {
    return (
      <div className={`p-4 border border-gray-200 rounded-lg ${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-3 text-gray-500">{t('loading', translations.loading)}</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      {/* Selected Products Section */}
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-900">
            {t('selectedProducts', translations.selectedProducts)} ({selectedProductIds.length})
          </h4>
          {selectedProductIds.length > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="text-sm text-red-600 hover:text-red-700"
            >
              {t('clearAll', translations.clearAll)}
            </button>
          )}
        </div>

        {selectedProducts.length === 0 ? (
          <p className="text-sm text-gray-500 italic">{t('noProductsSelected', translations.noProductsSelected)}</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selectedProducts.map((product) => (
              <div
                key={product.id}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-full"
              >
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="w-5 h-5 rounded-full object-cover" />
                ) : (
                  <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <span className="text-sm text-gray-700 max-w-[150px] truncate">{product.name}</span>
                <button
                  type="button"
                  onClick={() => removeProduct(product.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toggle Selector Button */}
      <button
        type="button"
        onClick={() => setShowSelector(!showSelector)}
        className="w-full px-4 py-3 flex items-center justify-between text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <span>{showSelector ? 'Hide' : 'Show'} {t('availableProducts', translations.availableProducts)} ({products.length})</span>
        <svg
          className={`w-5 h-5 transition-transform ${showSelector ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Available Products Section */}
      {showSelector && (
        <div className="border-t border-gray-200">
          {/* Search and Actions */}
          <div className="p-3 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder={t('searchProducts', translations.searchProducts)}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <button
              type="button"
              onClick={selectAll}
              className="px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors whitespace-nowrap"
            >
              {t('selectAll', translations.selectAll)}
            </button>
          </div>

          {/* Products Grid */}
          <div className="max-h-64 overflow-y-auto p-3">
            {availableProducts.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">{t('noProducts', translations.noProducts)}</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {availableProducts.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => toggleProduct(product.id)}
                    className="flex items-center gap-3 p-2 rounded-lg border border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-colors text-left"
                  >
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                      <p className="text-xs text-gray-500">${product.price.toFixed(2)}</p>
                    </div>
                    <div className="w-5 h-5 rounded border-2 border-gray-300 flex items-center justify-center flex-shrink-0">
                      {selectedProductIds.includes(product.id) && (
                        <svg className="w-3 h-3 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
