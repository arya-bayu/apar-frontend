'use client'

import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
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
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'

import { Input } from '@/components/ui/input'
import { DataTablePagination } from '../DataTablePagination'
import { DataTableViewOptions } from '../DataTableViewOptions'

import '@tanstack/react-table'
import useDebounce from '@/hooks/useDebounce'
import { Button } from './button'
import { DatabaseBackup, FileDown, Trash2 } from 'lucide-react'
import { useRouter } from 'next/router'
import { KeyedMutator } from 'swr'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import LoadingSpinner from "../LoadingSpinner"

type DataTablePermission = {
  delete?: boolean
  forceDelete?: boolean
  restore?: boolean
}

interface DataTableProps<TData, TValue> {
  isTrash?: boolean
  permissions?: DataTablePermission
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
      fileType: 'XLSX' | 'CSV',
      id?: string[]
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
  const [isRestoring, setIsRestoring] = useState<boolean>(false)
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
    initialState: {
      pagination: {
        pageSize: 15,
      },
    },
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
          <div className="flex justify-start">
            <LoadingSpinner />
          </div>
        )
      )}
      <div className="rounded-md border border-zinc-200 dark:border-zinc-700">
        <ContextMenu>
          <ContextMenuTrigger
            disabled={data?.totalRowCount <= 0 || disabledContextMenu}
          >
            <div
              className={`${Object.keys(rowSelection).length === 0
                ? 'bg-inherit dark:bg-inherit'
                : 'bg-zinc-950 dark:bg-zinc-50'
                } flex h-16 w-full items-center justify-between rounded-t-md border-b border-zinc-200 px-4 dark:border-zinc-700`}
            >
              <div
                className={`flex-1 text-sm ${Object.keys(rowSelection).length === 0
                  ? 'text-zinc-950 dark:text-zinc-50'
                  : 'font-medium text-zinc-50 dark:text-zinc-950'
                  }`}
              >
                {Object.keys(table.getState().rowSelection).length} /{' '}
                {data?.totalRowCount ?? 0} data dipilih
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
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                {Object.keys(rowSelection).length > 0 && (
                  <>
                    {(isTrash
                      ? permissions?.forceDelete
                      : permissions?.delete) && (
                        <Button
                          disabled={isRestoring}
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
                    {isTrash && permissions?.restore && (
                      <Button
                        disabled={isRestoring}
                        onClick={async () => {
                          setIsRestoring(true)
                          try {
                            await table.options?.meta?.handleRestore(
                              Object.keys(rowSelection).length === 1
                                ? [
                                  table.getRow(Object.keys(rowSelection)[0])
                                    .original,
                                ]
                                : Object.keys(rowSelection),
                            )
                          } finally {
                            table.resetRowSelection()
                            setIsRestoring(false)
                          }
                        }}
                        variant="secondary"
                        size="expandableIcon"
                        className="ml-auto md:gap-2 md:px-4"
                      >
                        {isRestoring ? (
                          <>
                            <LoadingSpinner size={16} />
                            <span className="hidden md:block">Memulihkan</span>
                          </>
                        ) : (
                          <>
                            <DatabaseBackup size={16} />
                            <span className="hidden md:block">Pulihkan Data</span>
                          </>
                        )}
                      </Button>
                    )}
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
                      className={isLoading ? "opacity-50 transition-all ease-linear duration-100" : ""}
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
                      {!inputValue && isLoading ? (
                        <LoadingSpinner />
                      ) : "Tidak ada data."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ContextMenuTrigger>
          <ContextMenuContent className="w-80">
            {Object.keys(rowSelection).length > 0 &&
              (isTrash ? permissions?.forceDelete : permissions?.delete) && (
                <ContextMenuItem
                  disabled={isRestoring}
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
                </ContextMenuItem>
              )}
            {Object.keys(rowSelection).length > 0 && isTrash && permissions?.restore && (
              <ContextMenuItem
                disabled={isRestoring}
                onClick={async () => {
                  setIsRestoring(true)
                  try {
                    await table.options?.meta?.handleRestore(
                      Object.keys(rowSelection).length === 1
                        ? [
                          table.getRow(Object.keys(rowSelection)[0])
                            .original,
                        ]
                        : Object.keys(rowSelection),
                    )
                  } finally {
                    table.resetRowSelection()
                    setIsRestoring(false)
                  }
                }}
              >
                {isRestoring ? (
                  "Memulihkan data..."
                ) : (
                  "Pulihkan " + Object.keys(rowSelection).length + " Data"
                )}
              </ContextMenuItem>
            )}
            {!table.getIsAllPageRowsSelected() && (
              <ContextMenuItem
                onClick={() => table.toggleAllPageRowsSelected(true)}
              >
                Pilih semua data di halaman ini
              </ContextMenuItem>
            )}
            {!(Object.keys(rowSelection).length === data?.totalRowCount) && (
              <ContextMenuItem
                onClick={async () => {
                  const data: { id: number }[] = await meta.handleGetAllId()
                  let updatedRowSelection = {
                    ...rowSelection,
                  }
                  data?.map((item) => {
                    updatedRowSelection[item.id] = true
                  })
                  // for (const row of rows) {
                  //   updatedRowSelection[row.id] = true
                  // }

                  table.setRowSelection(updatedRowSelection)
                }}
              >
                Pilih semua data di tabel ini ({data?.totalRowCount})
              </ContextMenuItem>
            )}

            <ContextMenuItem onClick={() => router.reload()}>
              Reload
            </ContextMenuItem>
            {!isTrash && table.options?.meta?.handleRestore && (
              <ContextMenuItem
                onClick={() => {
                  setIsTrash && setIsTrash(true)
                  router.push(router.asPath + '/trash')
                }}
              >
                Sampah
              </ContextMenuItem>
            )}
            {!isTrash && table.options?.meta?.handleExportData && (
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
          </ContextMenuContent>
        </ContextMenu>
      </div>
      <DataTablePagination table={table} />
    </div>
  )
}
