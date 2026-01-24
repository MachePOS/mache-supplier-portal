import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  const { sessionId } = await request.json()

  if (!sessionId) {
    return NextResponse.json({ error: 'No session ID provided' }, { status: 400 })
  }

  // Use service role client to bypass RLS for impersonation validation
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Validate the impersonation session (for suppliers)
  const { data: session, error } = await supabase
    .from('impersonation_sessions')
    .select(`
      id,
      admin_user_id,
      supplier_id,
      started_at,
      ended_at,
      supplier:platform_suppliers!supplier_id (
        id,
        name,
        status
      ),
      admin:admin_users!admin_user_id (
        id,
        name,
        email
      )
    `)
    .eq('id', sessionId)
    .is('ended_at', null)
    .not('supplier_id', 'is', null)
    .single()

  if (error || !session) {
    return NextResponse.json({ error: 'Invalid or expired session' }, { status: 400 })
  }

  // Check if session is recent (within last 5 minutes)
  const startedAt = new Date(session.started_at)
  const now = new Date()
  const diffMinutes = (now.getTime() - startedAt.getTime()) / 1000 / 60

  if (diffMinutes > 5) {
    return NextResponse.json({ error: 'Session has expired' }, { status: 400 })
  }

  const supplier = Array.isArray(session.supplier) ? session.supplier[0] : session.supplier
  const admin = Array.isArray(session.admin) ? session.admin[0] : session.admin

  if (!supplier) {
    return NextResponse.json({ error: 'Supplier not found' }, { status: 400 })
  }

  // Set impersonation cookie (expires in 4 hours)
  const cookieStore = cookies()
  const impersonationData = JSON.stringify({
    sessionId: session.id,
    supplierId: supplier.id,
    supplierName: supplier.name,
    adminName: admin?.name || 'Admin',
  })

  cookieStore.set('supplier_impersonation', impersonationData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 4 * 60 * 60, // 4 hours
    path: '/',
  })

  return NextResponse.json({
    success: true,
    supplierName: supplier.name,
  })
}

export async function DELETE() {
  const cookieStore = cookies()
  cookieStore.delete('supplier_impersonation')

  return NextResponse.json({ success: true })
}
