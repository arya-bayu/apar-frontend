'use client'
import { ICategory } from '@/types/category'
import { Button } from '@/components/ui/button'
import { PenSquare, DatabaseBackup, Trash2 } from 'lucide-react'
import { ColumnDef, Row } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/DataTableColumnHeader'
import createSelectColumn from '@/components/ColumnHelpers/CreateSelectColumn'
import CategoryDialog from '../partials/CategoryDialog'

export const categoryColumns: ColumnDef<ICategory>[] = [
  createSelectColumn(),
  {
    accessorKey: 'name',
    meta: {
      title: 'Kategori',
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Kategori" />
    ),
    cell: ({ row }) => {
      const category = row.original
      return (
        <>
          <span>{category.name}</span>
        </>
      )
    },
  },
  {
    accessorKey: 'description',
    meta: {
      title: 'Deskripsi',
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Deskripsi" />
    ),
  },
  {
    accessorKey: 'aksi',
    header: '',
    enableHiding: false,
    cell: ({ row, table }) => {
      const category = row.original

      const can = table.options.meta?.can

      if (!can) return null

      return (
        <div className="float-right flex flex-row gap-2">
          {!table.options.meta?.isTrash && can('update categories') && (
            <CategoryDialog
              key={row.original.id}
              id={category.id}
              mutate={table.options.meta?.mutate}
              setDisabledContextMenu={
                table.options.meta?.setDisabledContextMenu
              }
            >
              <Button size="icon" variant="outline" className="relative">
                <PenSquare size={16} />
                <span className="sr-only">Edit</span>
              </Button>
            </CategoryDialog>
          )}
          {table.options.meta?.isTrash && can('restore categories') && (
            <Button
              size="icon"
              variant="outline"
              className="relative"
              onClick={() => {
                category.id && table.options.meta?.handleRestore([category])
              }}
            >
              <DatabaseBackup size={16} />
              <span className="sr-only">Pulihkan</span>
            </Button>
          )}
          {can('delete categories') && (
            <Button
              size="icon"
              variant="outline"
              className="relative"
              onClick={() => {
                table.options.meta?.handleDelete([category])

                if (
                  Object.keys(
                    Object.keys(table.getState().rowSelection).includes(
                      String(category.id),
                    ),
                  )
                ) {
                  let updatedRowSelection = {
                    ...table.getState().rowSelection,
                  }
                  delete updatedRowSelection[String(category.id)]
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
