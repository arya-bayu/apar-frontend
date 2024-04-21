'use client'
import { useUserRoles } from '@/hooks/useUserRoles'
import { IUser } from '@/types/user'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { ColumnDef, RowData } from '@tanstack/react-table'
import { Role } from '@/enums/Role'
import { DataTableColumnHeader } from '@/components/DataTableColumnHeader'
import Shortcut from '@/components/Shortcut'

import '@tanstack/react-table'
import createSelectColumn from '@/components/Columns/ColumnHelpers/CreateSelectColumn'
import { Dialog } from "@/components/ui/dialog"

declare module '@tanstack/table-core' {
  interface TableMeta<TData extends RowData> {
    authUser?: IUser
    handleUpdateRole: (data: IUser[] | string[], role: Role) => Promise<void>
  }
}

export const userColumns: ColumnDef<IUser>[] = [
  createSelectColumn(),
  {
    accessorKey: 'name',
    meta: {
      title: 'Nama',
    },
    size: 180,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nama" />
    ),
  },
  {
    accessorKey: 'phone',
    meta: {
      title: 'Telepon',
    },
    size: 180,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Telepon" />
    ),
  },
  {
    accessorKey: 'email',
    meta: {
      title: 'Email',
    },
    size: 180,
    header: 'Email',
  },
  {
    accessorKey: 'role',
    meta: {
      title: 'Role',
    },
    size: 180,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    cell: ({ row, table }) => {
      const user = row.original
      const authUser = table.options.meta?.authUser
      const can = table.options.meta?.can
      const { roles } = useUserRoles()

      if (!can) return null

      return can('update roles') ? (
        <Select
          disabled={user.id === authUser?.id}
          defaultValue={user.role}
          onValueChange={(newValue: Role) => {
            table.options.meta?.handleUpdateRole([user], newValue)
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Update Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Update Role</SelectLabel>
              {roles?.data.map((role: Role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      ) : (
        user.role
      )
    },
  },
  {
    accessorKey: 'aksi',
    header: '',
    size: 50,
    enableHiding: false,
    cell: ({ row, table }) => {
      const user = row.original
      const authUser = table.options.meta?.authUser
      const can = table.options.meta?.can

      if (!can) return null

      return (
        <Dialog>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="relative float-right">
                <DotsHorizontalIcon />
                <span className="sr-only">Action</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Menu</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>Kontak</DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent className="w-44">
                      <DropdownMenuItem
                        onClick={() =>
                          (window.location.href = `mailto:${user.email}`)
                        }
                      >
                        Email
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          window.open(`https://wa.me/${user.phone}`, '_blank')
                        }
                      >
                        WhatsApp
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          (window.location.href = `tel:${user.phone}`)
                        }
                      >
                        Telepon
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
              </DropdownMenuGroup>
              {(authUser?.id === user.id || can('delete users')) && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() =>
                      user.id && table.options.meta?.handleDelete([user])
                    }
                    className="bg-red-500 text-white focus:bg-red-600 focus:text-white dark:focus:bg-red-600"
                  >
                    Hapus Akun
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </Dialog>
      )
    },
  },
]
