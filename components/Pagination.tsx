'use client'

import { useLanguage } from '@/contexts/LanguageContext'

const translations = {
  previous: { en: 'Previous', fr: 'Précédent', ht: 'Anvan', es: 'Anterior' },
  next: { en: 'Next', fr: 'Suivant', ht: 'Pwochen', es: 'Siguiente' },
  page: { en: 'Page', fr: 'Page', ht: 'Paj', es: 'Página' },
  of: { en: 'of', fr: 'sur', ht: 'nan', es: 'de' },
  showing: { en: 'Showing', fr: 'Affichage', ht: 'Montre', es: 'Mostrando' },
  to: { en: 'to', fr: 'à', ht: 'a', es: 'a' },
  results: { en: 'results', fr: 'résultats', ht: 'rezilta', es: 'resultados' },
}

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  className?: string
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  className = '',
}: PaginationProps) {
  const { t } = useLanguage()

  if (totalPages <= 1) return null

  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      if (currentPage > 3) {
        pages.push('...')
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i)
        }
      }

      if (currentPage < totalPages - 2) {
        pages.push('...')
      }

      // Always show last page
      if (!pages.includes(totalPages)) {
        pages.push(totalPages)
      }
    }

    return pages
  }

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
      {/* Results info */}
      <p className="text-sm text-gray-500">
        {t('showing', translations.showing)}{' '}
        <span className="font-medium text-gray-900">{startItem}</span>{' '}
        {t('to', translations.to)}{' '}
        <span className="font-medium text-gray-900">{endItem}</span>{' '}
        {t('of', translations.of)}{' '}
        <span className="font-medium text-gray-900">{totalItems}</span>{' '}
        {t('results', translations.results)}
      </p>

      {/* Page navigation */}
      <nav className="flex items-center gap-1">
        {/* Previous button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
        >
          <span className="sr-only">{t('previous', translations.previous)}</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Page numbers */}
        <div className="hidden sm:flex items-center gap-1">
          {getPageNumbers().map((page, index) => (
            typeof page === 'number' ? (
              <button
                key={index}
                onClick={() => onPageChange(page)}
                className={`min-w-[40px] px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  currentPage === page
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ) : (
              <span key={index} className="px-2 text-gray-500">
                {page}
              </span>
            )
          ))}
        </div>

        {/* Mobile page indicator */}
        <div className="sm:hidden px-3 py-2 text-sm text-gray-700">
          {t('page', translations.page)} {currentPage} {t('of', translations.of)} {totalPages}
        </div>

        {/* Next button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
        >
          <span className="sr-only">{t('next', translations.next)}</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </nav>
    </div>
  )
}
