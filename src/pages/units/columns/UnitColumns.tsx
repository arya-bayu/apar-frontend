'use client'
import { IUnit } from '@/types/unit'
import { Button } from '@/components/ui/button'
import { PenSquare, DatabaseBackup, Trash2 } from 'lucide-react'
import { ColumnDef, Row } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/DataTableColumnHeader'
import Link from 'next/link'
import createSelectColumn from '@/components/ColumnHelpers/CreateSelectColumn'
import UnitDialog from '../partials/UnitDialog'

export const unitColumns: ColumnDef<IUnit>[] = [
  createSelectColumn(),
  {
    accessorKey: 'name',
    meta: {
      title: 'Unit of Measure',
    },
    enableHiding: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Unit of Measure" disableHiding />
    ),
  },
  {
    accessorKey: 'aksi',
    header: '',
    enableHiding: false,
    cell: ({ row, table }) => {
      const unit = row.original

      const can = table.options.meta?.can

      if (!can) return null

      return (
        <div className="flex flex-row justify-end gap-2">
          {!table.options.meta?.isTrash && can('update units') && (
            <UnitDialog
              key={row.original.id}
              id={unit.id}
              mutate={table.options.meta?.mutate}
              setDisabledContextMenu={
                table.options.meta?.setDisabledContextMenu
              }
            >
              <Button size="icon" variant="outline" className="relative">
                <PenSquare size={16} />
                <span className="sr-only">Edit</span>
              </Button>
            </UnitDialog>
          )}
          {table.options.meta?.isTrash && can('restore units') && (
            <Button
              size="icon"
              variant="outline"
              className="relative"
              onClick={() => {
                unit.id && table.options.meta?.handleRestore([unit])
              }}
            >
              <DatabaseBackup size={16} />
              <span className="sr-only">Pulihkan</span>
            </Button>
          )}
          {can('delete units') && (
            <Button
              size="icon"
              variant="outline"
              className="relative"
              onClick={() => {
                table.options.meta?.handleDelete([unit])

                if (
                  Object.keys(
                    Object.keys(table.getState().rowSelection).includes(
                      String(unit.id),
                    ),
                  )
                ) {
                  let updatedRowSelection = {
                    ...table.getState().rowSelection,
                  }
                  delete updatedRowSelection[String(unit.id)]
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
