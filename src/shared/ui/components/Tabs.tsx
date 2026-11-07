'use client'

import React, { createContext, useContext, useState } from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

interface TabsContextValue {
  value: string
  onChange: (val: string) => void
}

const TabsContext = createContext<TabsContextValue | null>(null)

export interface TabsProps {
  value?: string
  defaultValue?: string
  onValueChange?: (val: string) => void
  className?: string
  children: React.ReactNode
}

export function Tabs({
  value: controlledValue,
  defaultValue,
  onValueChange,
  className,
  children,
}: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue || '')
  const isControlled = controlledValue !== undefined
  const currentValue = isControlled ? controlledValue : internalValue

  const handleChange = (val: string) => {
    if (!isControlled) setInternalValue(val)
    onValueChange?.(val)
  }

  return (
    <TabsContext.Provider value={{ value: currentValue, onChange: handleChange }}>
      <div className={twMerge(clsx('w-full flex flex-col', className))}>{children}</div>
    </TabsContext.Provider>
  )
}

export function TabsList({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      role="tablist"
      className={twMerge(
        clsx(
          'flex items-center gap-2 border-b border-border w-full overflow-x-auto scrollbar-none pb-px',
          className
        )
      )}
    >
      {children}
    </div>
  )
}

export interface TabsTriggerProps {
  value: string
  disabled?: boolean
  className?: string
  children: React.ReactNode
}

export function TabsTrigger({
  value,
  disabled,
  className,
  children,
}: TabsTriggerProps) {
  const context = useContext(TabsContext)
  if (!context) throw new Error('TabsTrigger must be used within Tabs')

  const isActive = context.value === value

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      disabled={disabled}
      onClick={() => context.onChange(value)}
      className={twMerge(
        clsx(
          'min-h-[44px] px-4 py-2.5 text-body font-medium transition-colors border-b-2 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          isActive
            ? 'border-primary text-primary font-bold'
            : 'border-transparent text-textMuted hover:text-text hover:border-border',
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
          className
        )
      )}
    >
      {children}
    </button>
  )
}

export interface TabsContentProps {
  value: string
  className?: string
  children: React.ReactNode
}

export function TabsContent({ value, className, children }: TabsContentProps) {
  const context = useContext(TabsContext)
  if (!context) throw new Error('TabsContent must be used within Tabs')

  if (context.value !== value) return null

  return (
    <div
      role="tabpanel"
      className={twMerge(clsx('pt-4 focus:outline-none', className))}
    >
      {children}
    </div>
  )
}

