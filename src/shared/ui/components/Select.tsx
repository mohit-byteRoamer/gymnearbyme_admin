import React from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { ChevronDown } from 'lucide-react'

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean
  options?: { value: string | number; label: string }[]
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, options, disabled, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        <select
          ref={ref}
          disabled={disabled}
          className={twMerge(
            clsx(
              'w-full min-h-[40px] max-md:min-h-[44px] appearance-none pl-3 pr-10 py-2 text-sm font-roboto font-normal text-text bg-surface border rounded-control transition-colors cursor-pointer',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
              'disabled:bg-background disabled:text-textSubtle disabled:cursor-not-allowed',
              error ? 'border-dangerText focus:ring-dangerText' : 'border-border',
              className
            )
          )}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        <div className="absolute right-3 pointer-events-none text-textMuted flex items-center">
          <ChevronDown className="h-4 w-4" strokeWidth={1.75} />
        </div>
      </div>
    )
  }
)

export default Select
