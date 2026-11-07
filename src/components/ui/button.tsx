import * as React from 'react'
import { Button as UIButton, ButtonProps as UIButtonProps } from '@/shared/ui'
import { clsx } from 'clsx'

export interface ButtonProps extends Omit<UIButtonProps, 'variant'> {
  variant?: 'default' | 'primary' | 'destructive' | 'danger' | 'outline' | 'secondary' | 'ghost'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'secondary', className, children, ...props }, ref) => {
    let uiVariant: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' = 'secondary'
    if (variant === 'primary' || variant === 'default') {
      uiVariant = 'primary'
    } else if (variant === 'destructive' || variant === 'danger') {
      uiVariant = 'danger'
    } else if (variant === 'outline') {
      uiVariant = 'outline'
    } else if (variant === 'ghost') {
      uiVariant = 'ghost'
    } else {
      uiVariant = 'secondary'
    }

    return (
      <UIButton
        ref={ref}
        variant={uiVariant}
        className={clsx(className)}
        {...props}
      >
        {children}
      </UIButton>
    )
  }
)

Button.displayName = 'Button'
export default Button
