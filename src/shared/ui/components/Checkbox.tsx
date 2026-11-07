import React from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Check } from 'lucide-react'

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  description?: string
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, id, checked, disabled, onChange, ...props }, ref) => {
    return (
      <label
        htmlFor={id}
        className={twMerge(
          clsx(
            'inline-flex items-start gap-3 min-h-[44px] cursor-pointer select-none py-1.5',
            disabled ? 'opacity-50 cursor-not-allowed' : '',
            className
          )
        )}
      >
        <div className="relative flex items-center justify-center min-w-[24px] min-h-[24px] mt-0.5">
          <input
            ref={ref}
            id={id}
            type="checkbox"
            checked={checked}
            disabled={disabled}
            onChange={onChange}
            className="peer sr-only"
            {...props}
          />
          <div
            className={clsx(
              'w-5 h-5 rounded-[4px] border border-border bg-surface transition-colors flex items-center justify-center',
              'peer-checked:bg-primary peer-checked:border-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2',
              'hover:border-primary'
            )}
          >
            <Check
              className={clsx(
                'w-3.5 h-3.5 text-white transition-opacity',
                checked ? 'opacity-100' : 'opacity-0'
              )}
              strokeWidth={2.5}
            />
          </div>
        </div>

        {(label || description) && (
          <div className="flex flex-col pt-0.5">
            {label && <span className="text-body font-medium text-text">{label}</span>}
            {description && <span className="text-small text-textMuted">{description}</span>}
          </div>
        )}
      </label>
    )
  }
)

Checkbox.displayName = 'Checkbox'

