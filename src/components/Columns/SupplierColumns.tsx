'use client'
import { ISupplier } from '@/types/supplier'
import { Button } from '@/components/ui/button'
import { PenSquare, DatabaseBackup, Trash2 } from 'lucide-react'
import { ColumnDef, Row } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/DataTableColumnHeader'
import Link from 'next/link'
import createSelectColumn from '@/components/Columns/ColumnHelpers/CreateSelectColumn'
import SupplierDialog from '../../pages/dashboard/suppliers/partials/SupplierDialog'
import { useState } from "react"
import LoadingSpinner from "../LoadingSpinner"

export const supplierColumns: ColumnDef<ISupplier>[] = [
  createSelectColumn(),
  {
    accessorKey: 'name',
    meta: {
      title: 'Nama',
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nama" />
    ),
  },
  {
    accessorKey: 'category',
    meta: {
      title: 'Kategori',
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Kategori" />
    ),
  },
  {
    accessorKey: 'telepon',
    meta: {
      title: 'Telepon',
    },
    header: 'Telepon',
    cell: ({ row }) => {
      const supplier = row.original

      return <Link href={`tel:${supplier.phone}`}>{supplier.phone}</Link>
    },
  },
  {
    accessorKey: 'email',
    meta: {
      title: 'Email',
    },
    header: 'Email',
    cell: ({ row }) => {
      const supplier = row.original

      return <Link href={`mailto:${supplier.email}`}>{supplier.email}</Link>
    },
  },
  {
    accessorKey: 'alamat',
    meta: {
      title: 'Alamat',
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Alamat" />
    ),
    cell: ({ row }) => {
      const supplier = row.original
      return (
        <Link
          href={`https://maps.google.com/?q=${supplier.address}`}
          rel="noopener noreferrer"
          target="_blank"
        >
          {supplier.address}
        </Link>
      )
    },
  },
  {
    accessorKey: 'aksi',
    header: '',
    enableHiding: false,
    cell: ({ row, table }) => {
      const supplier = row.original
      const [isLoading, setIsLoading] = useState<boolean>(false)

      const can = table.options.meta?.can

      if (!can) return null

      return (
        <div className="flex flex-row justify-end gap-2">
          {!table.options.meta?.isTrash && can('update suppliers') && (
            <SupplierDialog
              key={row.original.id}
              id={supplier.id}
              mutate={table.options.meta?.mutate}
              setDisabledContextMenu={
                table.options.meta?.setDisabledContextMenu
              }
            >
              <Button size="icon" variant="outline" className="relative">
                <PenSquare size={16} />
                <span className="sr-only">Edit</span>
              </Button>
            </SupplierDialog>
          )}
          {table.options.meta?.isTrash && can('restore suppliers') && (
            <Button
              size="icon"
              variant="outline"
              className="relative"
              onClick={async () => {
                setIsLoading(true)
                try {
                  supplier.id && await table.options.meta?.handleRestore([supplier])
                } finally {
                  setIsLoading(false)
                }
              }}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size={16} />
                  <span className="sr-only">Memulihkan...</span>
                </>
              ) : (
                <>
                  <DatabaseBackup size={16} />
                  <span className="sr-only">Pulihkan</span>
                </>
              )}
            </Button>
          )}
          {can('delete suppliers') && (
            <Button
              size="icon"
              variant="outline"
              className="relative"
              onClick={() => {
                table.options.meta?.handleDelete([supplier])

                if (
                  Object.keys(
                    Object.keys(table.getState().rowSelection).includes(
                      String(supplier.id),
                    ),
                  )
                ) {
                  let updatedRowSelection = {
                    ...table.getState().rowSelection,
                  }
                  delete updatedRowSelection[String(supplier.id)]
                  table.setRowSelection(updatedRowSelection)
                }
              }}
            >
              <Trash2 size={16} className="text-red-500 dark:text-red-500" />
              <span className="sr-only">Hapus</span>
            </Button>
          )}
        </div>
      )
    },
  },
]
