'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { clsx } from 'clsx'
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastItem {
  id: string
  title: string
  message?: string
  type: ToastType
}

interface ToastContextValue {
  showToast: (toast: Omit<ToastItem, 'id'>) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback(
    ({ title, message, type }: Omit<ToastItem, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9)
      setToasts((prev) => [...prev, { id, title, message, type }])
      setTimeout(() => {
        removeToast(id)
      }, 5000)
    },
    [removeToast]
  )

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none p-2">
        {toasts.map((toast) => {
          const icon = {
            success: <CheckCircle2 className="h-5 w-5 text-successText shrink-0" strokeWidth={1.75} />,
            error: <AlertCircle className="h-5 w-5 text-dangerText shrink-0" strokeWidth={1.75} />,
            warning: <AlertTriangle className="h-5 w-5 text-warningText shrink-0" strokeWidth={1.75} />,
            info: <Info className="h-5 w-5 text-primary shrink-0" strokeWidth={1.75} />,
          }[toast.type]

          return (
            <div
              key={toast.id}
              className={clsx(
                'pointer-events-auto flex items-start gap-3 p-4 bg-surface border border-border rounded-card shadow-subtle transition-all',
                'animate-in fade-in slide-in-from-bottom-2'
              )}
              role="alert"
            >
              {icon}
              <div className="flex-1 space-y-0.5">
                <h5 className="text-small font-medium text-text">{toast.title}</h5>
                {toast.message && (
                  <p className="text-caption text-textMuted leading-relaxed">{toast.message}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="min-h-[44px] min-w-[44px] -mr-2 -mt-2 p-2.5 text-textSubtle hover:text-text rounded-control flex items-center justify-center"
                aria-label="Dismiss message"
              >
                <X className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    return {
      showToast: ({ title, message, type }: Omit<ToastItem, 'id'>) => {
        console.log(`[Toast ${type}]: ${title} - ${message || ''}`)
      },
    }
  }
  return context
}

