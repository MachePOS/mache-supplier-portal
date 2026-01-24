'use client'

import { useRouter } from 'next/navigation'

interface ImpersonationBannerProps {
  supplierName: string
  adminName?: string
}

export default function ImpersonationBanner({ supplierName, adminName }: ImpersonationBannerProps) {
  const router = useRouter()

  const handleEndSession = async () => {
    try {
      await fetch('/api/impersonate', { method: 'DELETE' })
      // Close the window since this was opened in a new tab
      window.close()
      // If window.close() doesn't work (not opened by script), redirect to login
      router.push('/login')
    } catch (error) {
      console.error('Failed to end session:', error)
    }
  }

  return (
    <div className="bg-purple-600 text-white px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <span className="text-sm font-medium">
          Admin Mode: Viewing <strong>{supplierName}</strong>
          {adminName && <span className="opacity-75 ml-1">as {adminName}</span>}
        </span>
      </div>
      <button
        onClick={handleEndSession}
        className="px-3 py-1 text-sm font-medium bg-purple-700 hover:bg-purple-800 rounded-lg transition-colors"
      >
        End Session
      </button>
    </div>
  )
}
