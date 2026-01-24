import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const cookieStore = cookies()
  const impersonationCookie = cookieStore.get('supplier_impersonation')

  if (!impersonationCookie) {
    return NextResponse.json({ isImpersonating: false })
  }

  try {
    const data = JSON.parse(impersonationCookie.value)
    return NextResponse.json({
      isImpersonating: true,
      supplierId: data.supplierId,
      supplierName: data.supplierName,
      adminName: data.adminName,
    })
  } catch {
    return NextResponse.json({ isImpersonating: false })
  }
}
