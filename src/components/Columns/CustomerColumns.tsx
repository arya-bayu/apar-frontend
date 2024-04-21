'use client'
import { ICustomer } from '@/types/customer'
import { Button } from '@/components/ui/button'
import { PenSquare, DatabaseBackup, Trash2 } from 'lucide-react'
import { ColumnDef, Row } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/DataTableColumnHeader'
import Link from 'next/link'
import createSelectColumn from '@/components/Columns/ColumnHelpers/CreateSelectColumn'
import CustomerDialog from '../../pages/dashboard/customers/partials/CustomerDialog'

export const customerColumns: ColumnDef<ICustomer>[] = [
  createSelectColumn(),
  {
    accessorKey: 'company_name',
    meta: {
      title: 'Perusahaan',
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Perusahaan" />
    ),
  },
  {
    accessorKey: 'pic_name',
    meta: {
      title: 'PIC',
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="PIC" />
    ),
  },
  {
    accessorKey: 'telepon',
    meta: {
      title: 'Telepon',
    },
    header: 'Telepon',
    cell: ({ row }) => {
      const customer = row.original

      return <Link href={`tel:${customer.phone}`}>{customer.phone}</Link>
    },
  },
  {
    accessorKey: 'email',
    meta: {
      title: 'Email',
    },
    header: 'Email',
    cell: ({ row }) => {
      const customer = row.original

      return <Link href={`mailto:${customer.email}`}>{customer.email}</Link>
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
      const customer = row.original
      return (
        <Link
          href={`https://maps.google.com/?q=${customer.address}`}
          rel="noopener noreferrer"
          target="_blank"
        >
          {customer.address}
        </Link>
      )
    },
  },
  {
    accessorKey: 'aksi',
    header: '',
    enableHiding: false,
    cell: ({ row, table }) => {
      const customer = row.original

      const can = table.options.meta?.can

      if (!can) return null

      return (
        <div className="flex flex-row justify-end gap-2">
          {!table.options.meta?.isTrash && can('update customers') && (
            <CustomerDialog
              key={row.original.id}
              id={customer.id}
              mutate={table.options.meta?.mutate}
              setDisabledContextMenu={
                table.options.meta?.setDisabledContextMenu
              }
            >
              <Button size="icon" variant="outline" className="relative">
                <PenSquare size={16} />
                <span className="sr-only">Edit</span>
              </Button>
            </CustomerDialog>
          )}
          {table.options.meta?.isTrash && can('restore customers') && (
            <Button
              size="icon"
              variant="outline"
              className="relative"
              onClick={() => {
                customer.id && table.options.meta?.handleRestore([customer])
              }}
            >
              <DatabaseBackup size={16} />
              <span className="sr-only">Pulihkan</span>
            </Button>
          )}
          {can('delete customers') && (
            <Button
              size="icon"
              variant="outline"
              className="relative"
              onClick={() => {
                table.options.meta?.handleDelete([customer])

                if (
                  Object.keys(
                    Object.keys(table.getState().rowSelection).includes(
                      String(customer.id),
                    ),
                  )
                ) {
                  let updatedRowSelection = {
                    ...table.getState().rowSelection,
                  }
                  delete updatedRowSelection[String(customer.id)]
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
