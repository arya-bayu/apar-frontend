import { ColumnDef, Row } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function createSelectColumn<T>(): ColumnDef<T> {
  let lastSelectedId = ''

  return {
    id: 'select',
    header: ({ table }) => (
      <>
        <div className="block sm:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Checkbox
                checked={table.getIsAllPageRowsSelected()}
                onCheckedChange={(value: boolean) =>
                  table.toggleAllPageRowsSelected(!!value)
                }
                aria-label="Pilih semua"
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              {!table.getIsAllPageRowsSelected() && (
                <DropdownMenuItem
                  onClick={() => table.toggleAllPageRowsSelected(true)}
                >
                  Pilih semua data di halaman ini
                </DropdownMenuItem>
              )}
              {!(
                Object.keys(table.getState().rowSelection).length ===
                table.options.meta?.data?.totalRowCount
              ) && (
                  <DropdownMenuItem
                    onClick={async () => {
                      const rows = await table.options.meta?.handleGetAllId()
                      if (
                        Array.isArray(rows) &&
                        rows.every(row => row && typeof row.id !== 'undefined')
                      ) {
                        let updatedRowSelection = {
                          ...table.getState().rowSelection,
                        }
                        for (const row of rows) {
                          updatedRowSelection[row.id] = true
                        }
                        table.setRowSelection(updatedRowSelection)
                      }
                    }}
                  >
                    Pilih semua data di tabel ini (
                    {table.options.meta?.data?.totalRowCount})
                  </DropdownMenuItem>
                )}

              {Object.keys(table.getState().rowSelection).length > 0 && (
                <DropdownMenuItem onClick={() => table.resetRowSelection()}>
                  Batalkan pilihan untuk{' '}
                  {Object.keys(table.getState().rowSelection).length} data
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Checkbox
          className="hidden sm:block"
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value: boolean) =>
            table.toggleAllPageRowsSelected(!!value)
          }
          aria-label="Pilih semua"
        />
      </>
    ),
    cell: ({ row, table }) => (
      <Checkbox
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onCheckedChange={row.getToggleSelectedHandler()}
        aria-label="Pilih baris"
        onClick={e => {
          if (e.shiftKey) {
            const { rows, rowsById } = table.getRowModel()
            const rowsToToggle = getRowRange(rows, row.id, lastSelectedId)
            const isLastSelected = rowsById[lastSelectedId].getIsSelected()
            rowsToToggle.forEach(row => row.toggleSelected(isLastSelected))
          }

          lastSelectedId = row.id
        }}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  }
}

function getRowRange<T>(rows: Array<Row<T>>, idA: string, idB: string) {
  const range: Array<Row<T>> = []
  let foundStart = false
  let foundEnd = false
  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index]
    if (row.id === idA || row.id === idB) {
      if (foundStart) {
        foundEnd = true
      }
      if (!foundStart) {
        foundStart = true
      }
    }

    if (foundStart) {
      range.push(row)
    }

    if (foundEnd) {
      break
    }
  }

  return range
}
