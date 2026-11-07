'use client'

import React, { useState, useMemo } from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import {
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  AlertCircle,
  RotateCcw,
} from 'lucide-react'
import { Input } from './Input'
import { Button } from './Button'
import { Select } from './Select'
import { Skeleton } from './Skeleton'
import { EmptyState } from './EmptyState'

export interface Column<T> {
  key: string
  header: string | React.ReactNode
  render?: (row: T, index: number) => React.ReactNode
  className?: string
}

export interface FilterOption {
  key: string
  label: string
  options: { label: string; value: string }[]
}

export interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyExtractor?: (row: T, index: number) => string | number
  searchPlaceholder?: string
  searchableKeys?: (keyof T)[]
  filters?: FilterOption[]
  selectedFilters?: Record<string, string>
  onFilterChange?: (key: string, value: string) => void
  pageSize?: number
  isLoading?: boolean
  error?: string
  onRetry?: () => void
  emptyTitle?: string
  emptyDescription?: string
  emptyActionLabel?: string
  onEmptyAction?: () => void
  onExportCSV?: (filteredData: T[]) => void
  exportFileName?: string
  className?: string
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  keyExtractor,
  searchPlaceholder = 'Search records...',
  searchableKeys,
  filters,
  selectedFilters: controlledFilters,
  onFilterChange: controlledOnFilterChange,
  pageSize = 10,
  isLoading = false,
  error,
  onRetry,
  emptyTitle = 'No records found',
  emptyDescription = 'There are currently no items matching your criteria. Try adjusting your search query or filters.',
  emptyActionLabel,
  onEmptyAction,
  onExportCSV,
  exportFileName = 'export-data.csv',
  className,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('')
  const [internalFilters, setInternalFilters] = useState<Record<string, string>>({})
  const [currentPage, setCurrentPage] = useState(1)

  const activeFilters = controlledFilters || internalFilters

  const handleFilterChange = (key: string, value: string) => {
    setCurrentPage(1)
    if (controlledOnFilterChange) {
      controlledOnFilterChange(key, value)
    } else {
      setInternalFilters((prev) => ({ ...prev, [key]: value }))
    }
  }

  // Filter and search data
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      // Search matching
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim()
        const keysToSearch = searchableKeys || (Object.keys(row) as (keyof T)[])
        const matchesSearch = keysToSearch.some((k) => {
          const val = row[k]
          if (val === null || val === undefined) return false
          return String(val).toLowerCase().includes(query)
        })
        if (!matchesSearch) return false
      }

      // Filter matching
      for (const [filterKey, filterValue] of Object.entries(activeFilters)) {
        if (!filterValue || filterValue === 'all') continue
        const rowVal = String(row[filterKey] || '').toLowerCase()
        if (rowVal !== filterValue.toLowerCase()) return false
      }

      return true
    })
  }, [data, searchQuery, searchableKeys, activeFilters])

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredData.slice(start, start + pageSize)
  }, [filteredData, currentPage, pageSize])

  // Built-in CSV export handler
  const handleExport = () => {
    if (onExportCSV) {
      onExportCSV(filteredData)
      return
    }

    // Default CSV generator
    if (!filteredData.length) return
    const headers = columns.map((col) => (typeof col.header === 'string' ? col.header : col.key))
    const rows = filteredData.map((row) =>
      columns.map((col) => {
        const val = row[col.key]
        if (val === null || val === undefined) return '""'
        return `"${String(val).replace(/"/g, '""')}"`
      }).join(',')
    )
    const csvContent = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', exportFileName)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className={twMerge(clsx('w-full bg-surface border border-border rounded-card shadow-subtle overflow-hidden', className))}>
      {/* Table Controls Header */}
      <div className="p-4 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-3 bg-surface">
        <div className="flex flex-1 items-center gap-3">
          <div className="max-w-xs w-full">
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              leftIcon={<Search className="h-4 w-4" strokeWidth={1.75} />}
            />
          </div>

          {/* Filters */}
          {filters?.map((f) => (
            <div key={f.key} className="w-40 hidden sm:block">
              <Select
                value={activeFilters[f.key] || 'all'}
                onChange={(e) => handleFilterChange(f.key, e.target.value)}
              >
                <option value="all">All {f.label}</option>
                {f.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </div>
          ))}
        </div>

        {/* CSV Export Action */}
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={handleExport}
            disabled={isLoading || filteredData.length === 0}
            leftIcon={<Download className="h-4 w-4" strokeWidth={1.75} />}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Table Body / State Views */}
      {isLoading ? (
        <div className="p-6 space-y-4">
          <div className="flex gap-4">
            <Skeleton height={20} className="w-1/4" />
            <Skeleton height={20} className="w-1/4" />
            <Skeleton height={20} className="w-1/4" />
            <Skeleton height={20} className="w-1/4" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4 pt-3 border-t border-border">
              <Skeleton height={40} className="w-1/4" />
              <Skeleton height={40} className="w-1/4" />
              <Skeleton height={40} className="w-1/4" />
              <Skeleton height={40} className="w-1/4" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-8 text-center space-y-3">
          <div className="h-10 w-10 mx-auto rounded-control bg-dangerBg text-dangerText flex items-center justify-center">
            <AlertCircle className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <h4 className="text-cardTitle font-medium text-text">Failed to load data</h4>
          <p className="text-small text-dangerText max-w-md mx-auto">{error}</p>
          {onRetry && (
            <Button
              variant="secondary"
              onClick={onRetry}
              leftIcon={<RotateCcw className="h-4 w-4" strokeWidth={1.75} />}
            >
              Retry Loading
            </Button>
          )}
        </div>
      ) : paginatedData.length === 0 ? (
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          actionLabel={emptyActionLabel}
          onAction={onEmptyAction}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-small border-collapse">
            <thead>
              <tr className="bg-background border-b border-border">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={twMerge(
                      clsx(
                        'px-4 py-3.5 font-medium text-textMuted text-sm select-none',
                        col.className
                      )
                    )}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-surface">
              {paginatedData.map((row, idx) => {
                const rowKey = keyExtractor ? keyExtractor(row, idx) : idx
                return (
                  <tr
                    key={rowKey}
                    className="hover:bg-background/60 transition-colors"
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={twMerge(clsx('px-4 py-3.5 text-text align-middle', col.className))}
                      >
                        {col.render ? col.render(row, idx) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      {!isLoading && !error && filteredData.length > 0 && (
        <div className="px-4 py-3 border-t border-border flex items-center justify-between text-small text-textMuted bg-surface">
          <div>
            Showing{' '}
            <span className="font-medium text-text">
              {(currentPage - 1) * pageSize + 1}
            </span>{' '}
            to{' '}
            <span className="font-medium text-text">
              {Math.min(currentPage * pageSize, filteredData.length)}
            </span>{' '}
            of <span className="font-medium text-text">{filteredData.length}</span> records
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
            </Button>
            <span className="px-2 text-small font-medium text-text">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

