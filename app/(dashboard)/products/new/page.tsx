'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/contexts/LanguageContext'
import { getSupplierId } from '@/lib/getSupplier'

const translations = {
  addProduct: { en: 'Add Product', fr: 'Ajouter un produit', ht: 'Ajoute pwodui', es: 'Agregar producto' },
  back: { en: 'Back', fr: 'Retour', ht: 'Retounen', es: 'Volver' },
  name: { en: 'Product Name', fr: 'Nom du produit', ht: 'Non pwodui', es: 'Nombre del producto' },
  description: { en: 'Description', fr: 'Description', ht: 'Deskripsyon', es: 'Descripción' },
  category: { en: 'Category', fr: 'Catégorie', ht: 'Kategori', es: 'Categoría' },
  selectCategory: { en: 'Select category', fr: 'Sélectionner', ht: 'Chwazi', es: 'Seleccionar' },
  price: { en: 'Price', fr: 'Prix', ht: 'Pri', es: 'Precio' },
  comparePrice: { en: 'Compare Price', fr: 'Prix comparatif', ht: 'Konpare pri', es: 'Comparar' },
  sku: { en: 'SKU', fr: 'SKU', ht: 'SKU', es: 'SKU' },
  brand: { en: 'Brand', fr: 'Marque', ht: 'Mak', es: 'Marca' },
  stock: { en: 'Stock Qty', fr: 'Quantité', ht: 'Kantite', es: 'Cantidad' },
  unit: { en: 'Unit', fr: 'Unité', ht: 'Inite', es: 'Unidad' },
  minOrder: { en: 'Min Order', fr: 'Min commande', ht: 'Min kòmand', es: 'Min pedido' },
  active: { en: 'Active', fr: 'Actif', ht: 'Aktif', es: 'Activo' },
  inStock: { en: 'In Stock', fr: 'En stock', ht: 'Nan stòk', es: 'En stock' },
  featured: { en: 'Featured', fr: 'En vedette', ht: 'An vedèt', es: 'Destacado' },
  save: { en: 'Save Product', fr: 'Enregistrer', ht: 'Anrejistre', es: 'Guardar' },
  saving: { en: 'Saving...', fr: 'Enregistrement...', ht: 'Ap anrejistre...', es: 'Guardando...' },
  cancel: { en: 'Cancel', fr: 'Annuler', ht: 'Anile', es: 'Cancelar' },
  uploadImage: { en: 'Upload Image', fr: 'Télécharger image', ht: 'Telechaje imaj', es: 'Subir imagen' },
  dragDrop: { en: 'Drag & drop or click to upload', fr: 'Glisser-déposer ou cliquer', ht: 'Trennen oswa klike', es: 'Arrastrar o hacer clic' },
  orEnterUrl: { en: 'Or enter image URL', fr: 'Ou entrer URL', ht: 'Oswa antre URL', es: 'O ingresa URL' },
  imageUrl: { en: 'Image URL', fr: 'URL image', ht: 'URL imaj', es: 'URL imagen' },
  required: { en: 'Required', fr: 'Obligatoire', ht: 'Obligatwa', es: 'Obligatorio' },
  uploading: { en: 'Uploading...', fr: 'Téléchargement...', ht: 'Ap telechaje...', es: 'Subiendo...' },
}

const unitOptions = [
  { value: 'unit', label: 'Unit' },
  { value: 'case', label: 'Case' },
  { value: 'kg', label: 'kg' },
  { value: 'lb', label: 'lb' },
  { value: 'gallon', label: 'Gallon' },
  { value: 'liter', label: 'Liter' },
  { value: 'dozen', label: 'Dozen' },
  { value: 'pack', label: 'Pack' },
]

interface Category {
  id: string
  name: string
}

export default function NewProductPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [supplierId, setSupplierId] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    price: '',
    compare_at_price: '',
    sku: '',
    brand: '',
    unit_of_measure: 'unit',
    min_order_quantity: '1',
    stock_quantity: '',
    is_active: true,
    is_featured: false,
    in_stock: true,
    image_url: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const supplierId = await getSupplierId()
      if (!supplierId) {
        router.push('/pending')
        return
      }

      setSupplierId(supplierId)

      const supabase = createClient()
      const { data: cats } = await supabase
        .from('platform_supplier_categories')
        .select('id, name')
        .eq('is_active', true)
        .order('sort_order')

      setCategories(cats || [])
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    // Update preview if image URL changes
    if (name === 'image_url' && value) {
      setImagePreview(value)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFileUpload(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleFileUpload(e.target.files[0])
    }
  }

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    setUploading(true)
    setError('')

    try {
      const supabase = createClient()
      const fileExt = file.name.split('.').pop()
      const fileName = `${supplierId}/${Date.now()}.${fileExt}`

      const { data, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file)

      if (uploadError) {
        // If bucket doesn't exist or upload fails, fall back to preview only
        console.error('Upload error:', uploadError)
        // Create local preview
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          setImagePreview(result)
          // For now, we'll skip setting the URL since upload failed
        }
        reader.readAsDataURL(file)
        return
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName)

      setFormData(prev => ({ ...prev, image_url: publicUrl }))
      setImagePreview(publicUrl)
    } catch (err) {
      console.error('Upload error:', err)
      // Create local preview anyway
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supplierId) return

    setLoading(true)
    setError('')

    try {
      const supabase = createClient()

      const productData = {
        supplier_id: supplierId,
        name: formData.name,
        description: formData.description || null,
        category_id: formData.category_id || null,
        price: parseFloat(formData.price),
        compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price) : null,
        sku: formData.sku || null,
        brand: formData.brand || null,
        unit_of_measure: formData.unit_of_measure,
        min_order_quantity: parseInt(formData.min_order_quantity) || 1,
        stock_quantity: formData.stock_quantity ? parseInt(formData.stock_quantity) : null,
        is_active: formData.is_active,
        is_featured: formData.is_featured,
        in_stock: formData.in_stock,
        image_url: formData.image_url || null,
      }

      const { error: insertError } = await supabase
        .from('platform_supplier_products')
        .insert(productData)

      if (insertError) throw insertError

      router.push('/products')
    } catch (err: any) {
      setError(err.message || 'Error saving product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/products"
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-xl font-bold text-gray-900">{t('addProduct', translations.addProduct)}</h1>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column - Image Upload */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-4">
              {/* Image Preview / Upload */}
              <div
                className={`relative aspect-square rounded-lg border-2 border-dashed overflow-hidden cursor-pointer transition-colors ${
                  dragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                    <svg className="w-12 h-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm font-medium">{t('uploadImage', translations.uploadImage)}</p>
                    <p className="text-xs mt-1">{t('dragDrop', translations.dragDrop)}</p>
                  </div>
                )}

                {uploading && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-sm text-gray-600 mt-2">{t('uploading', translations.uploading)}</p>
                    </div>
                  </div>
                )}

                {imagePreview && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setImagePreview(null)
                      setFormData(prev => ({ ...prev, image_url: '' }))
                    }}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* URL Input */}
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-1">{t('orEnterUrl', translations.orEnterUrl)}</p>
                <input
                  type="url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Visibility Options */}
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">{t('active', translations.active)}</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="in_stock"
                    checked={formData.in_stock}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">{t('inStock', translations.inStock)}</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={formData.is_featured}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">{t('featured', translations.featured)}</span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column - Form Fields */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Product Name - Full Width */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('name', translations.name)} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                {/* Description - Full Width */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('description', translations.description)}
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('category', translations.category)}
                  </label>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">{t('selectCategory', translations.selectCategory)}</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Brand */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('brand', translations.brand)}
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                {/* Price */}
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
                      className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                {/* Compare Price */}
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
                      className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                {/* SKU */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('sku', translations.sku)}
                  </label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                {/* Stock Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('stock', translations.stock)}
                  </label>
                  <input
                    type="number"
                    name="stock_quantity"
                    value={formData.stock_quantity}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                {/* Unit of Measure */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('unit', translations.unit)}
                  </label>
                  <select
                    name="unit_of_measure"
                    value={formData.unit_of_measure}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    {unitOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Min Order */}
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                <Link
                  href="/products"
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  {t('cancel', translations.cancel)}
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 text-sm font-medium"
                >
                  {loading ? t('saving', translations.saving) : t('save', translations.save)}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
