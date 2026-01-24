import { createClient } from '@/lib/supabase/client'

export interface SupplierInfo {
  id: string
  name: string
  status: string
  isImpersonating?: boolean
  adminName?: string
}

// Helper to get impersonation cookie (client-side)
function getImpersonationCookie(): { supplierId: string; supplierName: string; adminName: string } | null {
  if (typeof document === 'undefined') return null

  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'supplier_impersonation') {
      try {
        return JSON.parse(decodeURIComponent(value))
      } catch {
        return null
      }
    }
  }
  return null
}

export async function getSupplierInfo(): Promise<SupplierInfo | null> {
  const supabase = createClient()

  try {
    // Check for impersonation first
    const impersonation = getImpersonationCookie()
    if (impersonation) {
      // Fetch the supplier info for the impersonated supplier
      const { data: supplier } = await supabase
        .from('platform_suppliers')
        .select('id, name, status')
        .eq('id', impersonation.supplierId)
        .single()

      if (supplier) {
        return {
          id: supplier.id,
          name: supplier.name || '',
          status: supplier.status || 'approved',
          isImpersonating: true,
          adminName: impersonation.adminName
        }
      }
    }

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
