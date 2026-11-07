import React from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export interface FormFieldProps {
  label?: string
  required?: boolean
  error?: string
  hint?: string
  id?: string
  className?: string
  children: React.ReactNode
}

export function FormField({
  label,
  required,
  error,
  hint,
  id,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={twMerge(clsx('flex flex-col space-y-1.5', className))}>
      {label && (
        <label
          htmlFor={id}
          className="text-small font-medium text-text select-none flex items-center gap-1"
        >
          <span>{label}</span>
          {required && <span className="text-dangerText font-bold">*</span>}
        </label>
      )}

      {children}

      {error ? (
        <p className="text-caption text-dangerText font-medium mt-1" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-caption text-textSubtle mt-1">{hint}</p>
      ) : null}
    </div>
  )
}

