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
import { ColumnDef, Row, RowData } from '@tanstack/react-table'
import { Role } from '@/enums/Role'
import { DataTableColumnHeader } from '@/components/DataTableColumnHeader'
import Shortcut from '@/components/Shortcut'

import '@tanstack/react-table'
import createSelectColumn from '@/components/Columns/ColumnHelpers/CreateSelectColumn'
import { Dialog } from "@/components/ui/dialog"
import { Badge } from "../ui/badge"

declare module '@tanstack/table-core' {
  interface TableMeta<TData extends RowData> {
    authUser?: IUser
    handleUpdateRole: (data: IUser[] | string[], role: Role) => Promise<void>
  }
}

export const userColumns: ColumnDef<IUser>[] = [
  {
    accessorKey: 'name',
    meta: {
      title: 'Nama',
    },
    size: 180,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nama" />
    ),
    cell: ({ row }) => {
      const user = row.original
      return (
        <p style={{ opacity: user.deleted_at ? 0.5 : 1 }}>{user.name}</p>
      )
    }
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
    cell: ({ row }) => {
      const user = row.original
      return (
        <p style={{ opacity: user.deleted_at ? 0.5 : 1 }}>{user.phone}</p>
      )
    }
  },
  {
    accessorKey: 'email',
    meta: {
      title: 'Email',
    },
    size: 180,
    header: 'Email',
    cell: ({ row }) => {
      const user = row.original
      return (
        <p style={{ opacity: user.deleted_at ? 0.5 : 1 }}>{user.email}</p>
      )
    }
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
          disabled={user.id === authUser?.id || user.deleted_at != null}
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
    accessorKey: 'deleted_at',
    meta: {
      title: 'Status',
    },
    size: 180,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const user = row.original

      return (
        <div className={`min-w-20 flex items-center ${user.deleted_at ? 'opacity-50' : 'opacity-1'}`} title={user.deleted_at ? `Dihapus pada: ${new Date(user.deleted_at).toLocaleString()}` : user.created_at && `Dibuat pada: ${new Date(user.created_at).toLocaleString()}`}>
          {user.deleted_at ? <span className="h-2 w-2 rounded-full bg-red-500 mr-2"></span> : <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>}
          <span>{user.deleted_at ? 'Dihapus' : 'Aktif'}</span>
        </div>
      )
    }
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
              {(authUser?.id === user.id || can('delete users')) && (!user.deleted_at) && (
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
