import Sidebar from '@/components/Sidebar'
import LanguageSelector from '@/components/LanguageSelector'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
      <div className="fixed top-4 right-4 z-50">
        <LanguageSelector />
      </div>
    </div>
  )
}
