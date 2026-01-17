'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/contexts/LanguageContext'

const translations = {
  editProduct: { en: 'Edit Product', fr: 'Modifier le produit', ht: 'Modifye pwodui', es: 'Editar producto' },
  back: { en: 'Back to Products', fr: 'Retour aux produits', ht: 'Retounen nan pwodui', es: 'Volver a productos' },
  basicInfo: { en: 'Basic Information', fr: 'Informations de base', ht: 'Enfòmasyon debaz', es: 'Información básica' },
  name: { en: 'Product Name', fr: 'Nom du produit', ht: 'Non pwodui', es: 'Nombre del producto' },
  description: { en: 'Description', fr: 'Description', ht: 'Deskripsyon', es: 'Descripción' },
  category: { en: 'Category', fr: 'Catégorie', ht: 'Kategori', es: 'Categoría' },
  selectCategory: { en: 'Select a category', fr: 'Sélectionner une catégorie', ht: 'Chwazi yon kategori', es: 'Selecciona una categoría' },
  pricing: { en: 'Pricing', fr: 'Tarification', ht: 'Pri', es: 'Precios' },
  price: { en: 'Price', fr: 'Prix', ht: 'Pri', es: 'Precio' },
  comparePrice: { en: 'Compare at Price', fr: 'Prix comparatif', ht: 'Konpare pri', es: 'Comparar precio' },
  cost: { en: 'Cost (for your records)', fr: 'Coût (pour vos dossiers)', ht: 'Kouta (pou dosye ou)', es: 'Costo (para tus registros)' },
  inventory: { en: 'Inventory', fr: 'Inventaire', ht: 'Envantè', es: 'Inventario' },
  sku: { en: 'SKU', fr: 'SKU', ht: 'SKU', es: 'SKU' },
  barcode: { en: 'Barcode', fr: 'Code-barres', ht: 'Kòd ba', es: 'Código de barras' },
  brand: { en: 'Brand', fr: 'Marque', ht: 'Mak', es: 'Marca' },
  trackStock: { en: 'Track stock quantity', fr: 'Suivre la quantité en stock', ht: 'Swiv kantite stòk', es: 'Seguir cantidad en stock' },
  stockQuantity: { en: 'Stock Quantity', fr: 'Quantité en stock', ht: 'Kantite nan stòk', es: 'Cantidad en stock' },
  lowStockThreshold: { en: 'Low Stock Alert', fr: 'Alerte stock bas', ht: 'Alèt stòk ba', es: 'Alerta stock bajo' },
  measurements: { en: 'Measurements', fr: 'Mesures', ht: 'Mezi', es: 'Medidas' },
  unitOfMeasure: { en: 'Unit of Measure', fr: 'Unité de mesure', ht: 'Inite mezi', es: 'Unidad de medida' },
  unitsPerCase: { en: 'Units per Case', fr: 'Unités par caisse', ht: 'Inite pa kès', es: 'Unidades por caja' },
  orderConstraints: { en: 'Order Constraints', fr: 'Contraintes de commande', ht: 'Kontrènt kòmand', es: 'Restricciones de pedido' },
  minOrder: { en: 'Minimum Order Quantity', fr: 'Quantité minimale de commande', ht: 'Kantite minimòm kòmand', es: 'Cantidad mínima de pedido' },
  maxOrder: { en: 'Maximum Order Quantity', fr: 'Quantité maximale de commande', ht: 'Kantite maksimòm kòmand', es: 'Cantidad máxima de pedido' },
  visibility: { en: 'Visibility', fr: 'Visibilité', ht: 'Vizibilite', es: 'Visibilidad' },
  active: { en: 'Product is active', fr: 'Produit actif', ht: 'Pwodui aktif', es: 'Producto activo' },
  featured: { en: 'Featured product', fr: 'Produit en vedette', ht: 'Pwodui an vedèt', es: 'Producto destacado' },
  inStock: { en: 'In stock', fr: 'En stock', ht: 'Nan stòk', es: 'En stock' },
  imageUrl: { en: 'Image URL', fr: 'URL de l\'image', ht: 'URL imaj', es: 'URL de imagen' },
  save: { en: 'Save Changes', fr: 'Enregistrer les modifications', ht: 'Anrejistre chanjman', es: 'Guardar cambios' },
  saving: { en: 'Saving...', fr: 'Enregistrement...', ht: 'Ap anrejistre...', es: 'Guardando...' },
  error: { en: 'Error saving product', fr: 'Erreur lors de l\'enregistrement', ht: 'Erè lè wap anrejistre', es: 'Error al guardar' },
  loading: { en: 'Loading...', fr: 'Chargement...', ht: 'Ap chaje...', es: 'Cargando...' },
  notFound: { en: 'Product not found', fr: 'Produit non trouvé', ht: 'Pwodui pa jwenn', es: 'Producto no encontrado' },
  delete: { en: 'Delete Product', fr: 'Supprimer le produit', ht: 'Efase pwodui', es: 'Eliminar producto' },
  confirmDelete: { en: 'Are you sure you want to delete this product?', fr: 'Êtes-vous sûr de vouloir supprimer ce produit?', ht: 'Èske ou sèten ou vle efase pwodui sa a?', es: '¿Estás seguro de que deseas eliminar este producto?' },
  dangerZone: { en: 'Danger Zone', fr: 'Zone de danger', ht: 'Zòn danje', es: 'Zona de peligro' },
}

const unitOptions = [
  { value: 'unit', label: 'Unit' },
  { value: 'case', label: 'Case' },
  { value: 'kg', label: 'Kilogram (kg)' },
  { value: 'lb', label: 'Pound (lb)' },
  { value: 'gallon', label: 'Gallon' },
  { value: 'liter', label: 'Liter' },
  { value: 'dozen', label: 'Dozen' },
  { value: 'pack', label: 'Pack' },
]

interface Category {
  id: string
  name: string
}

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string
  const { t } = useLanguage()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [notFound, setNotFound] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    price: '',
    compare_at_price: '',
    cost: '',
    sku: '',
    barcode: '',
    brand: '',
    unit_of_measure: 'unit',
    units_per_case: '1',
    min_order_quantity: '1',
    max_order_quantity: '',
    track_stock: false,
    stock_quantity: '',
    low_stock_threshold: '',
    is_active: true,
    is_featured: false,
    in_stock: true,
    image_url: '',
  })

  useEffect(() => {
    loadData()
  }, [productId])

  const loadData = async () => {
    try {
      const supabase = createClient()

      // Load categories
      const { data: cats } = await supabase
        .from('platform_supplier_categories')
        .select('id, name')
        .eq('is_active', true)
        .order('sort_order')

      setCategories(cats || [])

      // Load product
      const { data: product, error: productError } = await supabase
        .from('platform_supplier_products')
        .select('*')
        .eq('id', productId)
        .single()

      if (productError || !product) {
        setNotFound(true)
        return
      }

      setFormData({
        name: product.name || '',
        description: product.description || '',
        category_id: product.category_id || '',
        price: product.price?.toString() || '',
        compare_at_price: product.compare_at_price?.toString() || '',
        cost: product.cost?.toString() || '',
        sku: product.sku || '',
        barcode: product.barcode || '',
        brand: product.brand || '',
        unit_of_measure: product.unit_of_measure || 'unit',
        units_per_case: product.units_per_case?.toString() || '1',
        min_order_quantity: product.min_order_quantity?.toString() || '1',
        max_order_quantity: product.max_order_quantity?.toString() || '',
        track_stock: product.track_stock || false,
        stock_quantity: product.stock_quantity?.toString() || '',
        low_stock_threshold: product.low_stock_threshold?.toString() || '',
        is_active: product.is_active ?? true,
        is_featured: product.is_featured ?? false,
        in_stock: product.in_stock ?? true,
        image_url: product.image_url || '',
      })
    } catch (error) {
      console.error('Error loading product:', error)
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setSaving(true)
    setError('')

    try {
      const supabase = createClient()

      const productData = {
        name: formData.name,
        description: formData.description || null,
        category_id: formData.category_id || null,
        price: parseFloat(formData.price),
        compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price) : null,
        cost: formData.cost ? parseFloat(formData.cost) : null,
        sku: formData.sku || null,
        barcode: formData.barcode || null,
        brand: formData.brand || null,
        unit_of_measure: formData.unit_of_measure,
        units_per_case: parseInt(formData.units_per_case) || 1,
        min_order_quantity: parseInt(formData.min_order_quantity) || 1,
        max_order_quantity: formData.max_order_quantity ? parseInt(formData.max_order_quantity) : null,
        track_stock: formData.track_stock,
        stock_quantity: formData.stock_quantity ? parseInt(formData.stock_quantity) : null,
        low_stock_threshold: formData.low_stock_threshold ? parseInt(formData.low_stock_threshold) : null,
        is_active: formData.is_active,
        is_featured: formData.is_featured,
        in_stock: formData.in_stock,
        image_url: formData.image_url || null,
      }

      const { error: updateError } = await supabase
        .from('platform_supplier_products')
        .update(productData)
        .eq('id', productId)

      if (updateError) throw updateError

      router.push('/products')
    } catch (err: any) {
      setError(err.message || t('error', translations.error))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(t('confirmDelete', translations.confirmDelete))) return

    setDeleting(true)
    try {
      const supabase = createClient()
      const { error: deleteError } = await supabase
        .from('platform_supplier_products')
        .delete()
        .eq('id', productId)

      if (deleteError) throw deleteError

      router.push('/products')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="p-8">
        <div className="text-center py-16">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('notFound', translations.notFound)}</h2>
          <Link href="/products" className="text-primary-600 hover:text-primary-700">
            {t('back', translations.back)}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t('back', translations.back)}
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{t('editProduct', translations.editProduct)}</h1>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('basicInfo', translations.basicInfo)}</h2>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('category', translations.category)}
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">{t('selectCategory', translations.selectCategory)}</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('imageUrl', translations.imageUrl)}
              </label>
              <input
                type="url"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              {formData.image_url && (
                <div className="mt-2">
                  <img src={formData.image_url} alt="Preview" className="w-24 h-24 object-cover rounded-lg" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('pricing', translations.pricing)}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('price', translations.price)} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('comparePrice', translations.comparePrice)}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  name="compare_at_price"
                  value={formData.compare_at_price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('cost', translations.cost)}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  name="cost"
                  value={formData.cost}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Inventory */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('inventory', translations.inventory)}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('sku', translations.sku)}
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('barcode', translations.barcode)}
              </label>
              <input
                type="text"
                name="barcode"
                value={formData.barcode}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('brand', translations.brand)}
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              name="track_stock"
              id="track_stock"
              checked={formData.track_stock}
              onChange={handleChange}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="track_stock" className="text-sm text-gray-700">
              {t('trackStock', translations.trackStock)}
            </label>
          </div>

          {formData.track_stock && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('stockQuantity', translations.stockQuantity)}
                </label>
                <input
                  type="number"
                  name="stock_quantity"
                  value={formData.stock_quantity}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('lowStockThreshold', translations.lowStockThreshold)}
                </label>
                <input
                  type="number"
                  name="low_stock_threshold"
                  value={formData.low_stock_threshold}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Measurements & Order Constraints */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('measurements', translations.measurements)}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('unitOfMeasure', translations.unitOfMeasure)}
              </label>
              <select
                name="unit_of_measure"
                value={formData.unit_of_measure}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {unitOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('unitsPerCase', translations.unitsPerCase)}
              </label>
              <input
                type="number"
                name="units_per_case"
                value={formData.units_per_case}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <h3 className="text-md font-medium text-gray-900 mb-3">{t('orderConstraints', translations.orderConstraints)}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('minOrder', translations.minOrder)}
              </label>
              <input
                type="number"
                name="min_order_quantity"
                value={formData.min_order_quantity}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('maxOrder', translations.maxOrder)}
              </label>
              <input
                type="number"
                name="max_order_quantity"
                value={formData.max_order_quantity}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Visibility */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('visibility', translations.visibility)}</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="is_active"
                id="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="is_active" className="text-sm text-gray-700">
                {t('active', translations.active)}
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="in_stock"
                id="in_stock"
                checked={formData.in_stock}
                onChange={handleChange}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="in_stock" className="text-sm text-gray-700">
                {t('inStock', translations.inStock)}
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="is_featured"
                id="is_featured"
                checked={formData.is_featured}
                onChange={handleChange}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="is_featured" className="text-sm text-gray-700">
                {t('featured', translations.featured)}
              </label>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-between items-center">
          <div></div>
          <div className="flex gap-4">
            <Link
              href="/products"
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {saving ? t('saving', translations.saving) : t('save', translations.save)}
            </button>
          </div>
        </div>
      </form>

      {/* Danger Zone */}
      <div className="mt-8 bg-red-50 rounded-xl border border-red-200 p-6">
        <h2 className="text-lg font-semibold text-red-900 mb-4">{t('dangerZone', translations.dangerZone)}</h2>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {deleting ? '...' : t('delete', translations.delete)}
        </button>
      </div>
    </div>
  )
}
