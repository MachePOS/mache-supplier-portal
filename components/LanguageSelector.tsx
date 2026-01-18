'use client'

import { useState, useRef, useEffect } from 'react'
import { useLanguage, languages, Language } from '@/contexts/LanguageContext'

const flagCodes: Record<Language, string> = {
  en: 'us',
  fr: 'fr',
  ht: 'ht',
  es: 'es'
}

function FlagImage({ code, className }: { code: Language; className?: string }) {
  return (
    <img
      src={`https://flagcdn.com/24x18/${flagCodes[code]}.png`}
      srcSet={`https://flagcdn.com/48x36/${flagCodes[code]}.png 2x`}
      alt={code.toUpperCase()}
      className={`inline-block rounded-sm ${className || ''}`}
      width="24"
      height="18"
    />
  )
}

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentLang = languages.find(l => l.code === language) || languages[0]

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 rounded-lg shadow-sm border border-gray-200 transition-colors"
      >
        <FlagImage code={currentLang.code} />
        <span>{currentLang.name}</span>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 overflow-hidden">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code)
                setIsOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors ${
                language === lang.code
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FlagImage code={lang.code} />
              <span className="flex-1 text-left">{lang.name}</span>
              {language === lang.code && (
                <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
