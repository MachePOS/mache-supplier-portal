// CSV Export/Import utilities

export interface ProductCSV {
  name: string
  sku: string
  description: string
  price: number
  cost_price: number
  stock_quantity: number
  category: string
  is_active: boolean
  in_stock: boolean
  unit_of_measure: string
  minimum_order_quantity: number
}

export function exportToCSV<T extends Record<string, any>>(data: T[], filename: string, headers?: string[]) {
  if (data.length === 0) return

  const keys = headers || Object.keys(data[0])

  // Create header row
  const headerRow = keys.join(',')

  // Create data rows
  const dataRows = data.map(row =>
    keys.map(key => {
      const value = row[key]
      // Handle different types
      if (value === null || value === undefined) return ''
      if (typeof value === 'string') {
        // Escape quotes and wrap in quotes if contains comma or quote
        const escaped = value.replace(/"/g, '""')
        return escaped.includes(',') || escaped.includes('"') || escaped.includes('\n')
          ? `"${escaped}"`
          : escaped
      }
      if (typeof value === 'boolean') return value ? 'true' : 'false'
      return String(value)
    }).join(',')
  ).join('\n')

  const csv = `${headerRow}\n${dataRows}`

  // Create and download file
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split('\n').filter(line => line.trim())
  if (lines.length < 2) return []

  const headers = parseCSVLine(lines[0])
  const data: Record<string, string>[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    if (values.length === headers.length) {
      const row: Record<string, string> = {}
      headers.forEach((header, index) => {
        row[header.trim()] = values[index].trim()
      })
      data.push(row)
    }
  }

  return data
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }

  result.push(current)
  return result
}

export function validateProductCSV(row: Record<string, string>): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!row.name || row.name.length < 2) {
    errors.push('Name is required (min 2 characters)')
  }

  if (row.price) {
    const price = parseFloat(row.price)
    if (isNaN(price) || price < 0) {
      errors.push('Price must be a valid positive number')
    }
  }

  if (row.cost_price) {
    const costPrice = parseFloat(row.cost_price)
    if (isNaN(costPrice) || costPrice < 0) {
      errors.push('Cost price must be a valid positive number')
    }
  }

  if (row.stock_quantity) {
    const stock = parseInt(row.stock_quantity)
    if (isNaN(stock) || stock < 0) {
      errors.push('Stock quantity must be a valid non-negative integer')
    }
  }

  return { valid: errors.length === 0, errors }
}

export const PRODUCT_CSV_TEMPLATE = `name,sku,description,price,cost_price,stock_quantity,category,is_active,in_stock,unit_of_measure,minimum_order_quantity
"Example Product","SKU-001","Product description here",29.99,15.00,100,"Category Name",true,true,"piece",1
"Another Product","SKU-002","Another description",49.99,25.00,50,"Category Name",true,true,"box",1`

export function downloadCSVTemplate() {
  const blob = new Blob([PRODUCT_CSV_TEMPLATE], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', 'products_template.csv')
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
