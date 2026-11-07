import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDate as uiFormatDate, formatTime as uiFormatTime, formatRupees } from '@/shared/ui'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format currency to standard ₹1,000 notation
 */
export function formatCurrency(amount: number): string {
  return formatRupees(amount)
}

/**
 * Format date to standard "31 Oct 2026" notation
 */
export function formatDate(dateString: string | number | Date): string {
  return uiFormatDate(dateString)
}

/**
 * Format time to standard "6:30 PM" notation
 */
export function formatTime(dateString: string | number | Date): string {
  return uiFormatTime(dateString)
}

/**
 * Format date and time to standard "31 Oct 2026, 6:30 PM" notation
 */
export function formatDateTime(dateString: string | number | Date): string {
  if (!dateString) return '—'
  return `${uiFormatDate(dateString)}, ${uiFormatTime(dateString)}`
}

export function formatTimeAgo(dateString: string | number | Date): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return `${diffInSeconds}s ago`
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h ago`
  const diffInDays = Math.floor(diffInHours / 24)
  return `${diffInDays}d ago`
}

export function exportToCSV(filename: string, rows: Record<string, any>[]) {
  if (!rows || !rows.length) {
    alert('No data available to export.')
    return
  }

  const separator = ','
  const keys = Object.keys(rows[0])
  const csvContent =
    keys.map((k) => `"${k.replace(/"/g, '""')}"`).join(separator) +
    '\n' +
    rows
      .map((row) => {
        return keys
          .map((k) => {
            let cell = row[k] === null || row[k] === undefined ? '' : row[k]
            if (typeof cell === 'object') {
              cell = JSON.stringify(cell)
            }
            cell = String(cell).replace(/"/g, '""')
            return `"${cell}"`
          })
          .join(separator)
      })
      .join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
