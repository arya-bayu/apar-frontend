'use client'
import { Button } from '@/components/ui/button'
import { PenSquare, DatabaseBackup, Trash2 } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/DataTableColumnHeader'
import createSelectColumn from '@/components/Columns/ColumnHelpers/CreateSelectColumn'
import ProductDialog from '../../pages/dashboard/products/partials/ProductDialog'
import { IProduct } from "@/types/product"
import BarcodeExportDialog from "@/components/BarcodeExportDialog"
import currencyFormatter from "@/lib/currency"
import { Switch } from "@/components/ui/switch"
import axios from "@/lib/axios"
import { usePathname } from "next/navigation"


export const productColumns: ColumnDef<IProduct>[] = [
  createSelectColumn(),
  {
    accessorKey: 'status',
    meta: {
      title: 'Status',
    },
    sortDescFirst: true,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row, table }) => {
      const product = row.original
      const pathname = usePathname()

      if (pathname === '/products/trash') return <></>
      return (
        <Switch
          className="ml-2"
          checked={product.status}
          onCheckedChange={(checked) => {
            axios.put(`/api/v1/products/update-status`, {
              'product_ids': [product.id],
              'active': checked
            }).then(() => table.options?.meta?.mutate?.())
          }}
        />
      )
    }
  },
  {
    accessorKey: 'serial_number',
    meta: {
      title: 'Kode',
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Kode" />
    ),
    cell: ({ row, table }) => {
      const product = row.original

      return (
        <BarcodeExportDialog
          setDisabledContextMenu={
            table.options.meta?.setDisabledContextMenu
          }
          value={product.serial_number}
          productName={product.name}
          company={process.env.NEXT_PUBLIC_APP_NAME}
        >
          <p>{product.serial_number}</p>
        </BarcodeExportDialog>
      )
    }
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
    cell: ({ row }) => {
      const product = row.original
      return currencyFormatter(product.price)
    }
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
      const product = row.original

      const can = table.options.meta?.can

      if (!can) return null

      return (
        <div className="flex flex-row justify-end gap-2">
          {!table.options.meta?.isTrash && can('update products') && (
            <ProductDialog
              key={row.original.id}
              id={product.id}
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
          {table.options.meta?.isTrash && can('restore products') && (
            <Button
              size="icon"
              variant="outline"
              className="relative"
              onClick={() => {
                product.id && table.options.meta?.handleRestore([product])
              }}
            >
              <DatabaseBackup size={16} />
              <span className="sr-only">Pulihkan</span>
            </Button>
          )}
          {can('delete products') && (
            <Button
              size="icon"
              variant="outline"
              className="relative"
              onClick={() => {
                table.options.meta?.handleDelete([product])

                if (
                  Object.keys(
                    Object.keys(table.getState().rowSelection).includes(
                      String(product.id),
                    ),
                  )
                ) {
                  let updatedRowSelection = {
                    ...table.getState().rowSelection,
                  }
                  delete updatedRowSelection[String(product.id)]
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
