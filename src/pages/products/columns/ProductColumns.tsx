'use client'
import { Button } from '@/components/ui/button'
import { PenSquare, DatabaseBackup, Trash2 } from 'lucide-react'
import { ColumnDef, Row } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/DataTableColumnHeader'
import Link from 'next/link'
import createSelectColumn from '@/components/ColumnHelpers/CreateSelectColumn'
import ProductDialog from '../partials/ProductDialog'
import { SupplierCombobox } from "../partials/combobox/SupplierCombobox"
import { IProduct } from "@/types/product"

export const productColumns: ColumnDef<IProduct>[] = [
  createSelectColumn(),
  {
    accessorKey: 'serial_number',
    meta: {
      title: 'Kode',
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Kode" />
    ),
  },
  {
    accessorKey: 'name',
    meta: {
      title: 'Nama Produk',
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nama Produk" />
    ),
  },
  {
    accessorKey: 'stock',
    meta: {
      title: 'Stok',
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Stok" />
    )
  },
  {
    accessorKey: 'price',
    meta: {
      title: 'Harga',
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Harga" />
    ),
  },
  {
    accessorKey: 'supplier_id',
    meta: {
      title: 'Supplier',
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Supplier" />
    ),
    cell: ({ row }) => {
      const product = row.original
      return product.supplier?.name
    }
  },
  {
    accessorKey: 'category_id',
    meta: {
      title: 'Kategori',
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Kategori" />
    ),
    cell: ({ row }) => {
      const product = row.original
      return product.category?.name
    }
  },
  {
    accessorKey: 'aksi',
    header: '',
    enableHiding: false,
    cell: ({ row, table }) => {
      const supplier = row.original

      const can = table.options.meta?.can

      if (!can) return null

      return (
        <div className="flex flex-row justify-end gap-2">
          {!table.options.meta?.isTrash && can('update suppliers') && (
            <ProductDialog
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
            </ProductDialog>
          )}
          {table.options.meta?.isTrash && can('restore suppliers') && (
            <Button
              size="icon"
              variant="outline"
              className="relative"
              onClick={() => {
                supplier.id && table.options.meta?.handleRestore([supplier])
              }}
            >
              <DatabaseBackup size={16} />
              <span className="sr-only">Pulihkan</span>
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
