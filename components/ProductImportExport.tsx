'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/contexts/LanguageContext'
import { getSupplierId } from '@/lib/getSupplier'
import { exportToCSV, parseCSV, validateProductCSV, downloadCSVTemplate } from '@/lib/csv'

const translations = {
  exportProducts: { en: 'Export CSV', fr: 'Exporter CSV', ht: 'Ekspòte CSV', es: 'Exportar CSV' },
  importProducts: { en: 'Import CSV', fr: 'Importer CSV', ht: 'Enpòte CSV', es: 'Importar CSV' },
  downloadTemplate: { en: 'Download Template', fr: 'Télécharger modèle', ht: 'Telechaje modèl', es: 'Descargar plantilla' },
  importing: { en: 'Importing...', fr: 'Importation...', ht: 'Ap enpòte...', es: 'Importando...' },
  exporting: { en: 'Exporting...', fr: 'Exportation...', ht: 'Ap ekspòte...', es: 'Exportando...' },
  importSuccess: { en: 'products imported successfully', fr: 'produits importés avec succès', ht: 'pwodui enpòte avèk siksè', es: 'productos importados exitosamente' },
  importError: { en: 'Error importing products', fr: 'Erreur lors de l\'importation', ht: 'Erè nan enpòtasyon', es: 'Error al importar' },
  noFile: { en: 'Please select a file', fr: 'Veuillez sélectionner un fichier', ht: 'Tanpri chwazi yon fichye', es: 'Por favor seleccione un archivo' },
  invalidFormat: { en: 'Invalid file format. Please use CSV.', fr: 'Format invalide. Utilisez CSV.', ht: 'Fòma envalid. Itilize CSV.', es: 'Formato inválido. Use CSV.' },
  rowErrors: { en: 'Errors in rows', fr: 'Erreurs dans les lignes', ht: 'Erè nan liy yo', es: 'Errores en filas' },
  close: { en: 'Close', fr: 'Fermer', ht: 'Fèmen', es: 'Cerrar' },
  import: { en: 'Import', fr: 'Importer', ht: 'Enpòte', es: 'Importar' },
  cancel: { en: 'Cancel', fr: 'Annuler', ht: 'Anile', es: 'Cancelar' },
  selectFile: { en: 'Select CSV file to import', fr: 'Sélectionner fichier CSV', ht: 'Chwazi fichye CSV', es: 'Seleccionar archivo CSV' },
  previewImport: { en: 'Preview Import', fr: 'Aperçu de l\'importation', ht: 'Apèsi enpòtasyon', es: 'Vista previa de importación' },
  productsToImport: { en: 'products will be imported', fr: 'produits seront importés', ht: 'pwodui ap enpòte', es: 'productos se importarán' },
  errorsFound: { en: 'errors found', fr: 'erreurs trouvées', ht: 'erè jwenn', es: 'errores encontrados' },
}

interface Product {
  id: string
  name: string
  sku: string
  description: string | null
  price: number
  cost_price: number | null
  stock_quantity: number | null
  is_active: boolean
  in_stock: boolean
  unit_of_measure: string | null
  minimum_order_quantity: number
  category: { name: string } | null
}

interface ProductImportExportProps {
  products: Product[]
  onImportComplete: () => void
}

export default function ProductImportExport({ products, onImportComplete }: ProductImportExportProps) {
  const { t } = useLanguage()
  const [showImportModal, setShowImportModal] = useState(false)
  const [importing, setImporting] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [importData, setImportData] = useState<Record<string, string>[]>([])
  const [importErrors, setImportErrors] = useState<{ row: number; errors: string[] }[]>([])
  const [importResult, setImportResult] = useState<{ success: number; failed: number } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    setExporting(true)
    try {
      const exportData = products.map(p => ({
        name: p.name,
        sku: p.sku || '',
        description: p.description || '',
        price: p.price,
        cost_price: p.cost_price || 0,
        stock_quantity: p.stock_quantity || 0,
        category: p.category?.name || '',
        is_active: p.is_active,
        in_stock: p.in_stock,
        unit_of_measure: p.unit_of_measure || 'piece',
        minimum_order_quantity: p.minimum_order_quantity || 1,
      }))

      exportToCSV(exportData, `products_export_${new Date().toISOString().split('T')[0]}`)
    } finally {
      setExporting(false)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.csv')) {
      alert(t('invalidFormat', translations.invalidFormat))
      return
    }

    const text = await file.text()
    const data = parseCSV(text)

    // Validate each row
    const errors: { row: number; errors: string[] }[] = []
    data.forEach((row, index) => {
      const validation = validateProductCSV(row)
      if (!validation.valid) {
        errors.push({ row: index + 2, errors: validation.errors }) // +2 for header row and 0-index
      }
    })

    setImportData(data)
    setImportErrors(errors)
    setShowImportModal(true)

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleImport = async () => {
    if (importErrors.length > 0) {
      alert(t('rowErrors', translations.rowErrors))
      return
    }

    setImporting(true)
    let success = 0
    let failed = 0

    try {
      const supplierId = await getSupplierId()
      if (!supplierId) {
        throw new Error('No supplier ID')
      }

      const supabase = createClient()

      // Get existing categories
      const { data: categories } = await supabase
        .from('platform_supplier_categories')
        .select('id, name')
        .eq('supplier_id', supplierId)

      const categoryMap = new Map(categories?.map(c => [c.name.toLowerCase(), c.id]) || [])

      for (const row of importData) {
        try {
          // Find or create category
          let categoryId = null
          if (row.category) {
            categoryId = categoryMap.get(row.category.toLowerCase())
            if (!categoryId) {
              // Create new category
              const { data: newCat, error: catError } = await supabase
                .from('platform_supplier_categories')
                .insert({
                  supplier_id: supplierId,
                  name: row.category,
                  slug: row.category.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                })
                .select('id')
                .single()

              if (!catError && newCat) {
                categoryId = newCat.id
                categoryMap.set(row.category.toLowerCase(), categoryId)
              }
            }
          }

          // Check if product with SKU exists
          let existingProduct = null
          if (row.sku) {
            const { data } = await supabase
              .from('platform_supplier_products')
              .select('id')
              .eq('supplier_id', supplierId)
              .eq('sku', row.sku)
              .single()
            existingProduct = data
          }

          const productData = {
            supplier_id: supplierId,
            name: row.name,
            sku: row.sku || null,
            description: row.description || null,
            price: parseFloat(row.price) || 0,
            cost_price: row.cost_price ? parseFloat(row.cost_price) : null,
            stock_quantity: row.stock_quantity ? parseInt(row.stock_quantity) : null,
            category_id: categoryId,
            is_active: row.is_active?.toLowerCase() === 'true',
            in_stock: row.in_stock?.toLowerCase() !== 'false',
            unit_of_measure: row.unit_of_measure || 'piece',
            minimum_order_quantity: parseInt(row.minimum_order_quantity) || 1,
          }

          if (existingProduct) {
            // Update existing product
            await supabase
              .from('platform_supplier_products')
              .update(productData)
              .eq('id', existingProduct.id)
          } else {
            // Insert new product
            await supabase
              .from('platform_supplier_products')
              .insert(productData)
          }

          success++
        } catch (err) {
          console.error('Error importing row:', err)
          failed++
        }
      }

      setImportResult({ success, failed })
      if (success > 0) {
        onImportComplete()
      }
    } catch (err) {
      console.error('Import error:', err)
      setImportResult({ success: 0, failed: importData.length })
    } finally {
      setImporting(false)
    }
  }

  const closeModal = () => {
    setShowImportModal(false)
    setImportData([])
    setImportErrors([])
    setImportResult(null)
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={() => downloadCSVTemplate()}
          className="inline-flex items-center gap-1 px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {t('downloadTemplate', translations.downloadTemplate)}
        </button>

        <label className="inline-flex items-center gap-1 px-3 py-2 text-sm text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors cursor-pointer">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          {t('importProducts', translations.importProducts)}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>

        <button
          onClick={handleExport}
          disabled={exporting || products.length === 0}
          className="inline-flex items-center gap-1 px-3 py-2 text-sm text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
        >
          {exporting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          )}
          {exporting ? t('exporting', translations.exporting) : t('exportProducts', translations.exportProducts)}
        </button>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 p-6">
            {importResult ? (
              // Results view
              <div className="text-center">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                  importResult.success > 0 ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {importResult.success > 0 ? (
                    <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {importResult.success} {t('importSuccess', translations.importSuccess)}
                </h3>
                {importResult.failed > 0 && (
                  <p className="text-red-600 text-sm mb-4">{importResult.failed} failed</p>
                )}
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  {t('close', translations.close)}
                </button>
              </div>
            ) : (
              // Preview view
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {t('previewImport', translations.previewImport)}
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">{importData.length} {t('productsToImport', translations.productsToImport)}</span>
                    {importErrors.length > 0 && (
                      <span className="text-red-600 font-medium">{importErrors.length} {t('errorsFound', translations.errorsFound)}</span>
                    )}
                  </div>

                  {importErrors.length > 0 && (
                    <div className="max-h-48 overflow-y-auto border border-red-200 rounded-lg">
                      {importErrors.map((err, i) => (
                        <div key={i} className="p-2 border-b border-red-100 last:border-b-0 text-sm">
                          <span className="font-medium text-red-700">Row {err.row}:</span>
                          <ul className="list-disc list-inside text-red-600 mt-1">
                            {err.errors.map((e, j) => (
                              <li key={j}>{e}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Preview first 5 rows */}
                  {importData.length > 0 && importErrors.length === 0 && (
                    <div className="max-h-48 overflow-auto border border-gray-200 rounded-lg">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">Name</th>
                            <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">SKU</th>
                            <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">Price</th>
                            <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">Stock</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {importData.slice(0, 5).map((row, i) => (
                            <tr key={i}>
                              <td className="px-2 py-1 truncate max-w-[120px]">{row.name}</td>
                              <td className="px-2 py-1">{row.sku}</td>
                              <td className="px-2 py-1">${row.price}</td>
                              <td className="px-2 py-1">{row.stock_quantity}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {importData.length > 5 && (
                        <div className="p-2 text-center text-gray-500 text-xs border-t">
                          +{importData.length - 5} more rows
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    {t('cancel', translations.cancel)}
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={importing || importErrors.length > 0 || importData.length === 0}
                    className="flex-1 px-4 py-2 text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {importing && (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    )}
                    {importing ? t('importing', translations.importing) : t('import', translations.import)}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
