'use client'

import React from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  description?: string
  disabled?: boolean
  id?: string
  className?: string
}

export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled,
  id,
  className,
}: SwitchProps) {
  return (
    <label
      htmlFor={id}
      className={twMerge(
        clsx(
          'inline-flex items-center justify-between min-h-[44px] cursor-pointer select-none py-1.5 gap-4',
          disabled ? 'opacity-50 cursor-not-allowed' : '',
          className
        )
      )}
    >
      {(label || description) && (
        <div className="flex flex-col">
          {label && <span className="text-body font-medium text-text">{label}</span>}
          {description && <span className="text-small text-textMuted">{description}</span>}
        </div>
      )}

      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={clsx(
          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          checked ? 'bg-primary' : 'bg-border'
        )}
      >
        <span
          className={clsx(
            'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-surface shadow-subtle ring-0 transition duration-200 ease-in-out',
            checked ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </button>
    </label>
  )
}

