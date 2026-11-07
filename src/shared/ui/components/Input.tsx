import React from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, leftIcon, rightIcon, disabled, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        {leftIcon && (
          <div className="absolute left-3 text-textMuted pointer-events-none flex items-center justify-center">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          disabled={disabled}
          className={twMerge(
            clsx(
              'w-full min-h-[40px] max-md:min-h-[44px] px-3 py-2 text-sm font-roboto font-normal text-text bg-surface border rounded-control transition-colors placeholder:text-textSubtle',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
              'disabled:bg-background disabled:text-textSubtle disabled:cursor-not-allowed',
              error ? 'border-dangerText focus:ring-dangerText' : 'border-border',
              leftIcon ? 'pl-9' : '',
              rightIcon ? 'pr-9' : '',
              className
            )
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 text-textMuted pointer-events-none flex items-center justify-center">
            {rightIcon}
          </div>
        )}
      </div>
    )
  }
)

export default Input
