"use client"

import { useState } from "react"

// Champ mot de passe avec bouton œil pour afficher/masquer la saisie.
// Les libellés d'accessibilité sont passés en props (traduits côté serveur).
export function PasswordInput({
  id,
  name,
  label,
  showLabel,
  hideLabel,
  autoComplete,
  required = true,
  minLength,
  hint,
}: {
  id: string
  name: string
  label: string
  showLabel: string
  hideLabel: string
  autoComplete?: string
  required?: boolean
  minLength?: number
  hint?: string
}) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
          className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 pr-10 text-sm outline-none focus:border-amber-600 dark:border-slate-700 dark:bg-slate-800 dark:focus:border-amber-500"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? hideLabel : showLabel}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-stone-400 transition-colors hover:text-stone-600 dark:hover:text-stone-200"
        >
          {visible ? (
            // œil barré (masquer)
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
              <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
              <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
              <line x1="2" x2="22" y1="2" y2="22" />
            </svg>
          ) : (
            // œil (afficher)
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
      {hint && <p className="text-xs text-stone-400">{hint}</p>}
    </div>
  )
}
