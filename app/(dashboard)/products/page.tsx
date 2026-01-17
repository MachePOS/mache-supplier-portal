'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/contexts/LanguageContext'

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
  edit: { en: 'Edit', fr: 'Modifier', ht: 'Modifye', es: 'Editar' },
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

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const { t } = useLanguage()

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Get supplier ID
    const { data: supplier } = await supabase
      .from('platform_suppliers')
      .select('id')
      .eq('contact_email', user.email)
      .single()

    if (!supplier) {
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from('platform_supplier_products')
      .select('id, name, sku, price, image_url, is_active, in_stock, stock_quantity, category:platform_supplier_categories(name)')
      .eq('supplier_id', supplier.id)
      .order('created_at', { ascending: false })

    setProducts(data || [])
    setLoading(false)
  }

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t('products', translations.products)}</h1>
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

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder={t('search', translations.search)}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

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
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.category?.name || '-'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{product.sku || '-'}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">${product.price.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      product.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {product.is_active ? t('active', translations.active) : t('inactive', translations.inactive)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      product.in_stock ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {product.in_stock ? t('inStock', translations.inStock) : t('outOfStock', translations.outOfStock)}
                    </span>
                    {product.stock_quantity !== null && (
                      <span className="ml-2 text-sm text-gray-500">({product.stock_quantity})</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/products/${product.id}`}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      {t('edit', translations.edit)}
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
