'use client'

import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  ColumnDef,
  PaginationState,
  RowData,
  RowSelectionState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export interface DataTable<TData> {
  totalRowCount: number
  filteredRowCount: number
  pageCount: number
  rows: TData[]
}

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'

import { Input } from '@/components/ui/input'
import { DataTablePagination } from '../DataTablePagination'
import { DataTableViewOptions } from '../DataTableViewOptions'
import Shortcut from '../Shortcut'

import '@tanstack/react-table'
import useDebounce from '@/hooks/useDebounce'
import { Button } from './button'
import { DatabaseBackup, FileDown, RefreshCwIcon, Trash2 } from 'lucide-react'
import { useRouter } from 'next/router'
import { KeyedMutator } from 'swr'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type DataTablePermission = {
  delete?: boolean
  forceDelete?: boolean
  restore?: boolean
}

interface DataTableProps<TData, TValue> {
  isTrash?: boolean
  permissions: DataTablePermission
  setIsTrash?: Dispatch<SetStateAction<boolean | undefined>>
  disabledContextMenu?: boolean
  isValidating: boolean
  columns: ColumnDef<TData, TValue>[]
  data: DataTable<TData>
  pagination: PaginationState
  setPagination: Dispatch<SetStateAction<PaginationState>>
  setFilter: Dispatch<SetStateAction<string>>
  meta?: any
}

declare module '@tanstack/table-core' {
  interface TableMeta<TData extends RowData> {
    can: (permission: string) => boolean
    isTrash?: boolean | undefined
    setDisabledContextMenu: Dispatch<SetStateAction<boolean | undefined>>
    handleDelete: (arg0: TData[] | string[]) => Promise<void>
    handleRestore: (arg0: TData[] | string[]) => Promise<void>
    handleGetAllId: () => Promise<void>
    handleExportData: (
      fileType: 'XLSX' | 'CSV' | 'PDF',
      id?: string[],
      startDate?: string,
      endDate?: string,
    ) => Promise<void>
    mutate?: KeyedMutator<any>
    data: DataTable<TData>
  }
  interface ColumnMeta<TData extends RowData, TValue> {
    title: string
  }
}

export function DataTable<TData, TValue>({
  isTrash,
  permissions,
  setIsTrash,
  disabledContextMenu,
  isValidating,
  columns,
  data,
  pagination,
  setPagination,
  setFilter,
  meta,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [inputValue, setInputValue] = useState('')
  const [debouncedFilter, setDebouncedFilter] = useDebounce('', 1000)
  const [isLoading, setIsLoading] = useState(true)

  const router = useRouter()

  useEffect(() => {
    setIsLoading(isValidating)
  }, [isValidating])

  useEffect(() => {
    setDebouncedFilter(inputValue)
  }, [inputValue])

  useEffect(() => {
    setFilter(debouncedFilter)
  }, [debouncedFilter])

  const table = useReactTable({
    data: data?.rows ?? [],
    columns: columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      pagination: pagination,
    },
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    pageCount: data?.pageCount ?? 0,
    manualPagination: true,
    getRowId: useCallback((row: any) => {
      return row.id
    }, []),
    meta: {
      ...meta,
      data: data,
    },
  })

  useEffect(() => {
    table.resetPagination()
    table.resetRowSelection()
  }, [router.asPath])

  useEffect(() => {
    if (table.getState().pagination.pageIndex + 1 > table.getPageCount())
      table.setPageIndex(table.getState().pagination.pageIndex + 1)
  }, [data])

  return (
    <div className="space-y-6 py-6">
      <div className="flex justify-between">
        <Input
          placeholder="Cari..."
          value={inputValue}
          onChange={e => {
            e.preventDefault
            table.resetPageIndex()
            setIsLoading(true)
            setInputValue(e.target.value)
          }}
          className="md:w-[24rem]"
        />

        <DataTableViewOptions table={table} />
      </div>
      {inputValue && !isLoading ? (
        <p>Ditemukan {data?.filteredRowCount} hasil yang cocok</p>
      ) : (
        inputValue &&
        isLoading && (
          <div role="status">
            <svg
              aria-hidden="true"
              className="mr-2 h-6 w-6 animate-spin fill-red-600 text-gray-200 dark:text-gray-600"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill"
              />
            </svg>
            <span className="sr-only">Loading...</span>
          </div>
        )
      )}
      <div className="rounded-md border border-zinc-200 dark:border-zinc-800">
        <ContextMenu>
          <ContextMenuTrigger
            disabled={data?.totalRowCount <= 0 || disabledContextMenu}
          >
            <div
              className={`${Object.keys(rowSelection).length === 0
                ? 'bg-inherit dark:bg-inherit'
                : 'bg-zinc-950 dark:bg-zinc-50'
                } flex h-16 w-full items-center justify-between rounded-t-md border-b border-zinc-200 px-4 dark:border-zinc-800`}
            >
              <div
                className={`flex-1 text-sm ${Object.keys(rowSelection).length === 0
                  ? 'text-zinc-950 dark:text-zinc-50'
                  : 'font-medium text-zinc-50 dark:text-zinc-950'
                  }`}
              >
                {Object.keys(table.getState().rowSelection).length} /{' '}
                {data?.totalRowCount} data dipilih
              </div>
              <div className="flex justify-end space-x-2">
                {!isTrash &&
                  Object.keys(rowSelection).length > 0 &&
                  table.options?.meta?.handleExportData && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="secondary"
                          size="expandableIcon"
                          className="ml-auto md:gap-2 md:px-4"
                        >
                          <FileDown size={16} />
                          <span className="hidden md:block">
                            Ekspor{' '}
                            {Object.keys(rowSelection).length === 0 ||
                              Object.keys(rowSelection).length ===
                              data?.totalRowCount
                              ? 'Seluruh'
                              : Object.keys(rowSelection).length}{' '}
                            Data
                          </span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-24">
                        <DropdownMenuItem
                          onClick={() => {
                            if (
                              table.options?.meta?.handleExportData(
                                'CSV',
                                Object.keys(rowSelection).length === 0 ||
                                  Object.keys(rowSelection).length ===
                                  data?.totalRowCount
                                  ? undefined
                                  : Object.keys(rowSelection),
                              )
                            )
                              table.resetRowSelection()
                          }}
                        >
                          CSV
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            if (
                              table.options?.meta?.handleExportData(
                                'XLSX',
                                Object.keys(rowSelection),
                              )
                            )
                              table.resetRowSelection()
                          }}
                        >
                          XLSX
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            if (
                              table.options?.meta?.handleExportData(
                                'PDF',
                                Object.keys(rowSelection),
                              )
                            )
                              table.resetRowSelection()
                          }}
                        >
                          PDF
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                {Object.keys(rowSelection).length > 0 ? (
                  <>
                    {(isTrash
                      ? permissions.forceDelete
                      : permissions.delete) && (
                        <Button
                          onClick={() => {
                            if (
                              table.options?.meta?.handleDelete(
                                Object.keys(rowSelection).length === 1
                                  ? [
                                    table.getRow(Object.keys(rowSelection)[0])
                                      .original,
                                  ]
                                  : Object.keys(rowSelection),
                              )
                            )
                              table.resetRowSelection()
                          }}
                          variant="destructive"
                          size="icon"
                          className="ml-auto transition-none"
                        >
                          <Trash2 size={16} />
                        </Button>
                      )}
                    {isTrash && permissions.restore && (
                      <Button
                        onClick={() => {
                          if (
                            table.options?.meta?.handleRestore(
                              Object.keys(rowSelection).length === 1
                                ? [
                                  table.getRow(Object.keys(rowSelection)[0])
                                    .original,
                                ]
                                : Object.keys(rowSelection),
                            )
                          )
                            table.resetRowSelection()
                        }}
                        variant="secondary"
                        size="expandableIcon"
                        className="ml-auto md:gap-2 md:px-4"
                      >
                        <DatabaseBackup size={16} />
                        <span className="hidden md:block">Pulihkan Data</span>
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() => meta.mutate()}
                      variant="secondary"
                      size="expandableIcon"
                      className="ml-auto transition-none md:gap-2 md:px-4"
                    >
                      <RefreshCwIcon size={16} />
                      <span className="hidden md:block">Reload</span>
                    </Button>
                  </>
                )}
              </div>
            </div>
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map(headerGroup => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map(header => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="overflow-y-auto">
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map(row => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
                    >
                      {row.getVisibleCells().map(cell => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-[52.5px] text-center"
                    >
                      Tidak ada data.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ContextMenuTrigger>
          <ContextMenuContent className="w-80">
            {Object.keys(rowSelection).length > 0 &&
              (isTrash ? permissions.forceDelete : permissions.delete) && (
                <ContextMenuItem
                  onClick={() => {
                    if (
                      table?.options?.meta?.handleDelete(
                        Object.keys(rowSelection).length === 1
                          ? [
                            table.getRow(Object.keys(rowSelection)[0])
                              .original,
                          ]
                          : Object.keys(rowSelection),
                      )
                    ) {
                      table.resetRowSelection()
                    }
                  }}
                  className="bg-red-500 text-white focus:bg-red-600 focus:text-white dark:focus:bg-red-600"
                >
                  {isTrash || isTrash === undefined
                    ? `Hapus ${Object.keys(rowSelection).length} Data`
                    : `Pindahkan ${Object.keys(rowSelection).length
                    } Data ke Sampah`}
                  <ContextMenuShortcut>
                    <Shortcut
                      variant="destructive"
                      keys={['command', 'delete']}
                    />
                  </ContextMenuShortcut>
                </ContextMenuItem>
              )}
            {Object.keys(rowSelection).length > 0 && isTrash && (
              <ContextMenuItem
                onClick={() => {
                  if (
                    table.options?.meta?.handleRestore(
                      Object.keys(rowSelection).length === 1
                        ? [table.getRow(Object.keys(rowSelection)[0]).original]
                        : Object.keys(rowSelection),
                    )
                  )
                    table.resetRowSelection()
                }}
              >
                Pulihkan {Object.keys(rowSelection).length} Data
                <ContextMenuShortcut>
                  <Shortcut keys={['shift', 'option']}>R</Shortcut>
                </ContextMenuShortcut>
              </ContextMenuItem>
            )}
            {!table.getIsAllPageRowsSelected() && (
              <ContextMenuItem
                onClick={() => table.toggleAllPageRowsSelected(true)}
              >
                Pilih semua data di halaman ini
                <ContextMenuShortcut>
                  <Shortcut keys={['command']}>A</Shortcut>
                </ContextMenuShortcut>
              </ContextMenuItem>
            )}
            {!(Object.keys(rowSelection).length === data?.totalRowCount) && (
              <ContextMenuItem
                onClick={async () => {
                  const rows = await meta.handleGetAllId()
                  let updatedRowSelection = {
                    ...rowSelection,
                  }
                  for (const row of rows) {
                    updatedRowSelection[row.id] = true
                  }

                  table.setRowSelection(updatedRowSelection)
                }}
              >
                Pilih semua data di tabel ini ({data?.totalRowCount})
                <ContextMenuShortcut>
                  <Shortcut keys={['command']}>A</Shortcut>
                </ContextMenuShortcut>
              </ContextMenuItem>
            )}

            <ContextMenuItem onClick={() => router.reload()}>
              Reload
              <ContextMenuShortcut>
                <Shortcut keys={['command']}>R</Shortcut>
              </ContextMenuShortcut>
            </ContextMenuItem>
            {!isTrash && (
              <ContextMenuItem
                onClick={() => {
                  setIsTrash && setIsTrash(true)
                  router.push(router.asPath + '/trash')
                }}
              >
                Sampah
                <ContextMenuShortcut>
                  <Shortcut keys={['option', 'command', 'delete']} />
                </ContextMenuShortcut>
              </ContextMenuItem>
            )}
            {table.options?.meta?.handleExportData && (
              <ContextMenuSub>
                <ContextMenuSubTrigger>
                  Ekspor Seluruh Data
                </ContextMenuSubTrigger>
                <ContextMenuSubContent className="w-48">
                  <ContextMenuItem
                    onClick={() => table.options?.meta?.handleExportData('CSV')}
                  >
                    CSV
                  </ContextMenuItem>
                  <ContextMenuItem
                    onClick={() =>
                      table.options?.meta?.handleExportData('XLSX')
                    }
                  >
                    XLSX
                  </ContextMenuItem>
                </ContextMenuSubContent>
              </ContextMenuSub>
            )}
            {Object.keys(rowSelection).length > 0 && (
              <>
                <ContextMenuSeparator />
                <ContextMenuItem onClick={() => table.resetRowSelection()}>
                  Batalkan pilihan untuk {Object.keys(rowSelection).length} data
                </ContextMenuItem>
              </>
            )}
            {table.options?.meta?.handleExportData && (
              <>
                <ContextMenuSeparator />
                <ContextMenuItem
                  onClick={() => table.options?.meta?.handleExportData('PDF')}
                >
                  Cetak PDF
                  <ContextMenuShortcut>
                    <Shortcut keys={['command', 'option']}>P</Shortcut>
                  </ContextMenuShortcut>
                </ContextMenuItem>
              </>
            )}
          </ContextMenuContent>
        </ContextMenu>
      </div>
      <DataTablePagination table={table} />
    </div>
  )
}
