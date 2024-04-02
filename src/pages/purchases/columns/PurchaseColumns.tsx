'use client'
import { Button } from '@/components/ui/button'
import { PenSquare, DatabaseBackup, Trash2, X, Check, Eye, EditIcon } from 'lucide-react'
import { ColumnDef, Row } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/DataTableColumnHeader'
import createSelectColumn from '@/components/ColumnHelpers/CreateSelectColumn'
import { IPurchase } from "@/types/purchase"
import currencyFormatter from "@/lib/currency"
import Link from 'next/link'
import { Badge } from "@/components/ui/badge"
import axios from '@/lib/axios'
import { toast } from "@/components/ui/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AxiosError } from "axios"
import CustomAlertDialog from "@/components/CustomAlertDialog"
import { useState } from "react"
import { Dialog } from "@/components/ui/dialog"

export const purchaseColumns: ColumnDef<IPurchase>[] = [
  createSelectColumn(),
  {
    accessorKey: 'purchase_number',
    meta: {
      title: 'No. Pembelian',
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="No. Pembelian" />
    ),
  },
  {
    accessorKey: 'date',
    meta: {
      title: 'Tanggal',
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tanggal" />
    )
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
      const purchase = row.original
      return purchase.supplier?.name
    }
  },
  {
    accessorKey: 'total',
    meta: {
      title: 'Total Pembelian',
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total Pembelian" />
    ),
    cell: ({ row }) => {
      const purchase = row.original
      return currencyFormatter(purchase.total)
    }
  },
  {
    accessorKey: 'status',
    meta: {
      title: 'Status',
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row, table }) => {
      const purchase = row.original
      const can = table.options?.meta?.can

      const [alert, setAlert] = useState(false)
      const [alertTitle, setAlertTitle] = useState<string>("")
      const [alertDescription, setAlertDescription] = useState<string>("")
      const [alertContinueAction, setAlertContinueAction] = useState(() => {
        return () => { };
      });

      if (!can) return null

      return (
        <Dialog>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger disabled={purchase.status === 1}>
              <Badge variant={purchase.status === 0 ? 'warning' : 'success'}>{purchase.status === 0 ? 'Pending' : 'Disetujui'}</Badge>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">

              {can('approve purchases') && (
                <DropdownMenuItem onClick={() => {
                  axios.post(`/api/v1/purchases/${purchase?.id}/approve`).then(() => {
                    toast({
                      variant: 'success',
                      title: 'Sukses',
                      description: `Data pembelian ${purchase?.purchase_number} telah disetujui.`,
                    })

                    table.options.meta?.mutate?.()
                  })
                }}>
                  Setujui
                </DropdownMenuItem>
              )}

              {can('delete purchases') && (
                <DropdownMenuItem onClick={() => {
                  setAlertTitle("Tolak Pembelian")
                  setAlertDescription("Apakah Anda yakin ingin mengubah status pembelian menjadi ditolak? Menolak pembelian akan menghapus data pembelian ini.")
                  setAlertContinueAction(() => {
                    return () => {
                      axios.delete(`/api/v1/purchases`, {
                        params: { id: [purchase?.id] },
                      }).then(() => {
                        toast({
                          variant: 'success',
                          title: 'Sukses',
                          description: `Data pembelian ${purchase?.purchase_number} telah dihapus.`,
                        })

                        table.options.meta?.mutate?.()
                      }).catch(error => {
                        toast({
                          variant: 'destructive',
                          title: 'Gagal',
                          description:
                            error instanceof AxiosError
                              ? error.response?.data.status
                              : 'Terjadi kesalahan',
                        })
                      })
                    }
                  })
                  setAlert(true)
                }}>
                  Tolak
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <CustomAlertDialog
            open={alert}
            onOpenChange={setAlert}
            title={alertTitle}
            description={alertDescription}
            onContinue={alertContinueAction}
          />
        </Dialog>
      )
    }
  },
  {
    accessorKey: 'Aksi',
    enableHiding: false,
    header: '',
    cell: ({ row, table }) => {
      const purchase = row.original

      const can = table.options.meta?.can

      if (!can) return null

      return (
        <div className="flex flex-row justify-end gap-2">
          {!table.options.meta?.isTrash && can('access purchases') && (
            <Link href={`/purchases/${purchase.id}`}>
              <Button size="icon" variant="outline" className="relative">
                {purchase.status === 0 ? <EditIcon size={16} /> : <Eye size={16} />}
                <span className="sr-only">View</span>
              </Button>
            </Link>
          )}
        </div>
      )
    },
  },
]
