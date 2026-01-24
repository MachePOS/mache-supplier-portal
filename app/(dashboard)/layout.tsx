'use client'

import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'
import LanguageSelector from '@/components/LanguageSelector'
import ImpersonationBanner from '@/components/ImpersonationBanner'
import { getSupplierInfo, SupplierInfo } from '@/lib/getSupplier'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [supplierInfo, setSupplierInfo] = useState<SupplierInfo | null>(null)

  useEffect(() => {
    getSupplierInfo().then(setSupplierInfo)
  }, [])

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {supplierInfo?.isImpersonating && (
          <ImpersonationBanner
            supplierName={supplierInfo.name}
            adminName={supplierInfo.adminName}
          />
        )}
        {/* Header with centered language selector */}
        <div className="flex items-center justify-center py-2 px-4 bg-white border-b border-gray-100">
          <LanguageSelector />
        </div>
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
