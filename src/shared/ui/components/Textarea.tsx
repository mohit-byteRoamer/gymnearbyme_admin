import React from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, disabled, rows = 3, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        disabled={disabled}
        className={twMerge(
          clsx(
            'w-full px-3.5 py-2.5 text-body font-roboto text-text bg-surface border rounded-control transition-colors placeholder:text-textSubtle resize-y',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary',
            'disabled:bg-background disabled:text-textSubtle disabled:cursor-not-allowed',
            error ? 'border-dangerText focus:ring-dangerText' : 'border-border',
            className
          )
        )}
        {...props}
      />
    )
  }
)

Textarea.displayName = 'Textarea'

