import { createClient } from '@/lib/supabase/client'

export interface SupplierInfo {
  id: string
  name: string
  status: string
}

export async function getSupplierInfo(): Promise<SupplierInfo | null> {
  const supabase = createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // Try 1: Check supplier_users table first
    const { data: supplierUser } = await supabase
      .from('supplier_users')
      .select('supplier_id, supplier:platform_suppliers(id, name, status)')
      .eq('auth_user_id', user.id)
      .maybeSingle()

    if (supplierUser?.supplier) {
      const supplier = supplierUser.supplier as any
      return {
        id: supplier.id,
        name: supplier.name || '',
        status: supplier.status || 'pending'
      }
    }

    // Try 2: Check by contact email (for suppliers not yet in supplier_users)
    const { data: supplier } = await supabase
      .from('platform_suppliers')
      .select('id, name, status')
      .eq('contact_email', user.email)
      .maybeSingle()

    if (supplier) {
      return {
        id: supplier.id,
        name: supplier.name || '',
        status: supplier.status || 'pending'
      }
    }

    return null
  } catch (error) {
    console.error('Error getting supplier info:', error)
    return null
  }
}

export async function getSupplierId(): Promise<string | null> {
  const info = await getSupplierInfo()
  return info?.id || null
}
