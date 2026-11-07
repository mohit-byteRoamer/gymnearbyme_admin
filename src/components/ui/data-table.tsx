import React, { useState } from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table'
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Search,
  ArrowUpDown,
  AlertCircle,
  Inbox,
} from 'lucide-react'
import { Input } from './input'
import { Button } from './button'
import { EmptyState } from './empty-state'
import { Skeleton } from './skeleton'
import { exportToCSV, cn } from '@/lib/utils'

export interface FilterOption {
  id: string
  label: string
  options: { label: string; value: string }[]
}

export interface DataTableProps<TData, TValue = any> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchKey?: string
  searchPlaceholder?: string
  filters?: FilterOption[]
  exportFilename?: string
  toolbarActions?: React.ReactNode
  onRowClick?: (row: TData) => void
  pageSizeDefault?: number
  isLoading?: boolean
  error?: string | null
  onRetry?: () => void
  emptyTitle?: string
  emptyDescription?: string
  emptyActionLabel?: string
  onEmptyAction?: () => void
}

export function DataTable<TData, TValue = any>({
  columns,
  data,
  searchKey,
  searchPlaceholder = 'Search records...',
  filters,
  exportFilename = 'export',
  toolbarActions,
  onRowClick,
  pageSizeDefault = 10,
  isLoading = false,
  error = null,
  onRetry,
  emptyTitle = 'No records found',
  emptyDescription = 'There are no items to display at this time.',
  emptyActionLabel,
  onEmptyAction,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: pageSizeDefault,
  })

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter: searchKey ? undefined : globalFilter,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const handleExport = () => {
    const rowsToExport = table.getFilteredRowModel().rows.map((r) => r.original as Record<string, any>)
    exportToCSV(exportFilename, rowsToExport)
  }

  // Calculate pagination label: "1-6 of 6"
  const totalRows = table.getFilteredRowModel().rows.length
  const pageIndex = table.getState().pagination.pageIndex
  const pageSize = table.getState().pagination.pageSize
  const startRow = totalRows === 0 ? 0 : pageIndex * pageSize + 1
  const endRow = Math.min((pageIndex + 1) * pageSize, totalRows)
  const paginationLabel = `${startRow}-${endRow} of ${totalRows}`

  return (
    <div className="space-y-4 font-roboto">
      {/* Table Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          {/* Search (left) */}
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-textMuted pointer-events-none" strokeWidth={1.75} />
            {searchKey ? (
              <Input
                placeholder={searchPlaceholder}
                value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ''}
                onChange={(event) =>
                  table.getColumn(searchKey)?.setFilterValue(event.target.value)
                }
                className="pl-9 bg-surface"
              />
            ) : (
              <Input
                placeholder={searchPlaceholder}
                value={globalFilter ?? ''}
                onChange={(event) => setGlobalFilter(event.target.value)}
                className="pl-9 bg-surface"
              />
            )}
          </div>

          {/* One filter select */}
          {filters && filters.length > 0 && (
            <div className="flex items-center gap-2">
              {filters.slice(0, 1).map((filter) => {
                const column = table.getColumn(filter.id)
                const currentValue = (column?.getFilterValue() as string) ?? 'ALL'
                return (
                  <select
                    key={filter.id}
                    value={currentValue}
                    onChange={(e) => {
                      const val = e.target.value
                      column?.setFilterValue(val === 'ALL' ? undefined : val)
                    }}
                    className="min-h-[40px] max-md:min-h-[44px] rounded-control border border-border bg-surface px-3 py-2 text-sm font-normal text-text shadow-subtle focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                  >
                    <option value="ALL">All {filter.label.toLowerCase()}</option>
                    {filter.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )
              })}
            </div>
          )}
        </div>

        {/* Toolbar Actions + Ghost Export Button (right) */}
        <div className="flex items-center gap-2">
          {toolbarActions}
          <Button
            variant="ghost"
            onClick={handleExport}
            leftIcon={<Download className="h-4 w-4 text-textMuted" strokeWidth={1.75} />}
            title="Export filtered records to CSV"
          >
            Export
          </Button>
        </div>
      </div>

      {/* Table Card Container */}
      <div className="rounded-card border border-border bg-surface shadow-subtle overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-14 w-full rounded-control" />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center space-y-3">
            <AlertCircle className="h-6 w-6 text-dangerText mx-auto" strokeWidth={1.75} />
            <p className="text-sm text-dangerText font-medium">{error}</p>
            {onRetry && (
              <Button variant="secondary" onClick={onRetry}>
                Try again
              </Button>
            )}
          </div>
        ) : totalRows === 0 ? (
          <EmptyState
            icon={<Inbox className="h-6 w-6 text-textSubtle" strokeWidth={1.75} />}
            title={emptyTitle}
            description={emptyDescription}
            actionLabel={emptyActionLabel}
            onAction={onEmptyAction}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm font-roboto border-collapse">
              {/* Header row on #F8FAFC with 14px/500 muted sentence-case labels */}
              <thead className="bg-background border-b border-border">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      const canSort = header.column.getCanSort()
                      const isSorted = header.column.getIsSorted()
                      return (
                        <th
                          key={header.id}
                          className={cn(
                            'group px-4 py-3.5 select-none font-medium text-sm text-textMuted',
                            canSort && 'cursor-pointer hover:text-text'
                          )}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <div className="flex items-center gap-1.5">
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {canSort && (
                              <ArrowUpDown
                                className={cn(
                                  'h-3.5 w-3.5 transition-opacity',
                                  isSorted
                                    ? 'opacity-100 text-primary'
                                    : 'opacity-0 group-hover:opacity-100 text-textMuted'
                                )}
                                strokeWidth={1.75}
                              />
                            )}
                          </div>
                        </th>
                      )
                    })}
                  </tr>
                ))}
              </thead>
              {/* 56px rows, subtle row hover */}
              <tbody className="divide-y divide-border bg-surface">
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => onRowClick && onRowClick(row.original)}
                    className={cn(
                      'h-14 transition-colors hover:bg-background/60',
                      onRowClick && 'cursor-pointer'
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3.5 align-middle text-sm text-text font-normal">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer: "1-6 of 6" on left, Previous/Next on right */}
        {!isLoading && !error && totalRows > 0 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3 bg-surface text-sm text-textMuted">
            <div>
              <span>{paginationLabel}</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                leftIcon={<ChevronLeft className="h-4 w-4" strokeWidth={1.75} />}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                rightIcon={<ChevronRight className="h-4 w-4" strokeWidth={1.75} />}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DataTable
