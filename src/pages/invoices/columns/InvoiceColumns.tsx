'use client'
import { Button } from '@/components/ui/button'
import { PenSquare, DatabaseBackup, Trash2, X, Check, Eye, EditIcon } from 'lucide-react'
import { ColumnDef, Row } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/DataTableColumnHeader'
import createSelectColumn from '@/components/ColumnHelpers/CreateSelectColumn'
import { IInvoice } from "@/types/invoice"
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
import CustomAlertDialog from "@/components/AlertDialog"
import { useState } from "react"
import { Dialog } from "@/components/ui/dialog"
import { useRouter } from "next/router"

export const invoiceColumns: ColumnDef<IInvoice>[] = [
  createSelectColumn(),
  {
    accessorKey: 'invoice_number',
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
    accessorKey: 'customer_id',
    meta: {
      title: 'Pelanggan',
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Pelanggan" />
    ),
    cell: ({ row }) => {
      const invoice = row.original
      return invoice.customer?.company_name
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
      const invoice = row.original
      return currencyFormatter(invoice.invoice_items.reduce((acc, item) => acc + item.total_price, 0))
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
      const invoice = row.original
      const can = table.options?.meta?.can

      const router = useRouter()
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
            <DropdownMenuTrigger disabled={invoice.status === 1}>
              <Badge variant={invoice.status === 0 ? 'warning' : 'success'}>{invoice.status === 0 ? 'Pending' : 'Disetujui'}</Badge>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">

              {can('approve invoices') && (
                <DropdownMenuItem onClick={() => {
                  axios.post(`/api/v1/invoices/${invoice?.id}/approve`).then(() => {
                    toast({
                      variant: 'success',
                      title: 'Sukses',
                      description: `Data pembelian ${invoice?.invoice_number} telah disetujui.`,
                    })

                    table.options.meta?.mutate?.()
                  }).catch(error => {
                    toast({
                      variant: 'destructive',
                      title: 'Gagal',
                      description: error.response?.data.errors,
                    })
                    router.push('/invoices/' + invoice?.id)
                  })
                }}>
                  Setujui
                </DropdownMenuItem>
              )}

              {can('delete invoices') && (
                <DropdownMenuItem onClick={() => {
                  setAlertTitle("Tolak Pembelian")
                  setAlertDescription("Apakah Anda yakin ingin mengubah status pembelian menjadi ditolak? Menolak pembelian akan menghapus data pembelian ini.")
                  setAlertContinueAction(() => {
                    return () => {
                      axios.delete(`/api/v1/invoices`, {
                        params: { id: [invoice?.id] },
                      }).then(() => {
                        toast({
                          variant: 'success',
                          title: 'Sukses',
                          description: `Data pembelian ${invoice?.invoice_number} telah dihapus.`,
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
      const invoice = row.original

      const can = table.options.meta?.can

      if (!can) return null

      return (
        <div className="flex flex-row justify-end gap-2">
          {!table.options.meta?.isTrash && can('access invoices') && (
            <Link href={`/invoices/${invoice.id}`}>
              <Button size="icon" variant="outline" className="relative">
                {invoice.status === 0 ? <EditIcon size={16} /> : <Eye size={16} />}
                <span className="sr-only">View</span>
              </Button>
            </Link>
          )}
        </div>
      )
    },
  },
]
