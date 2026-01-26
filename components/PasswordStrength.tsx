'use client'

import { useLanguage } from '@/contexts/LanguageContext'

const translations = {
  passwordStrength: { en: 'Password Strength', fr: 'Force du mot de passe', ht: 'Fòs modpas', es: 'Fortaleza de la contraseña' },
  weak: { en: 'Weak', fr: 'Faible', ht: 'Fèb', es: 'Débil' },
  fair: { en: 'Fair', fr: 'Moyen', ht: 'Mwayèn', es: 'Regular' },
  good: { en: 'Good', fr: 'Bon', ht: 'Bon', es: 'Buena' },
  strong: { en: 'Strong', fr: 'Fort', ht: 'Fò', es: 'Fuerte' },
  requirements: { en: 'Requirements', fr: 'Exigences', ht: 'Egzijans', es: 'Requisitos' },
  minLength: { en: 'At least 8 characters', fr: 'Au moins 8 caractères', ht: 'Omwen 8 karaktè', es: 'Al menos 8 caracteres' },
  hasUppercase: { en: 'One uppercase letter', fr: 'Une lettre majuscule', ht: 'Yon lèt majiskil', es: 'Una letra mayúscula' },
  hasLowercase: { en: 'One lowercase letter', fr: 'Une lettre minuscule', ht: 'Yon lèt miniskil', es: 'Una letra minúscula' },
  hasNumber: { en: 'One number', fr: 'Un chiffre', ht: 'Yon chif', es: 'Un número' },
  hasSpecial: { en: 'One special character (!@#$%^&*)', fr: 'Un caractère spécial', ht: 'Yon karaktè espesyal', es: 'Un carácter especial' },
}

interface PasswordStrengthProps {
  password: string
  showRequirements?: boolean
  className?: string
}

export function checkPasswordStrength(password: string) {
  const checks = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  }

  const passedChecks = Object.values(checks).filter(Boolean).length

  let strength: 'weak' | 'fair' | 'good' | 'strong' = 'weak'
  let score = 0

  if (passedChecks >= 5) {
    strength = 'strong'
    score = 100
  } else if (passedChecks >= 4) {
    strength = 'good'
    score = 75
  } else if (passedChecks >= 3) {
    strength = 'fair'
    score = 50
  } else if (passedChecks >= 1) {
    strength = 'weak'
    score = 25
  }

  return { checks, strength, score, passedChecks }
}

export default function PasswordStrength({ password, showRequirements = true, className = '' }: PasswordStrengthProps) {
  const { t } = useLanguage()
  const { checks, strength, score } = checkPasswordStrength(password)

  if (!password) return null

  const strengthColors = {
    weak: 'bg-red-500',
    fair: 'bg-yellow-500',
    good: 'bg-blue-500',
    strong: 'bg-green-500',
  }

  const strengthTextColors = {
    weak: 'text-red-600',
    fair: 'text-yellow-600',
    good: 'text-blue-600',
    strong: 'text-green-600',
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">{t('passwordStrength', translations.passwordStrength)}</span>
          <span className={`font-medium ${strengthTextColors[strength]}`}>
            {t(strength, translations[strength])}
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${strengthColors[strength]}`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      {/* Requirements Checklist */}
      {showRequirements && (
        <div className="space-y-1">
          <p className="text-xs text-gray-500 font-medium">{t('requirements', translations.requirements)}:</p>
          <ul className="space-y-0.5">
            {Object.entries(checks).map(([key, passed]) => (
              <li key={key} className="flex items-center gap-2 text-xs">
                {passed ? (
                  <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                <span className={passed ? 'text-green-700' : 'text-gray-500'}>
                  {t(key as keyof typeof translations, translations[key as keyof typeof translations])}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
