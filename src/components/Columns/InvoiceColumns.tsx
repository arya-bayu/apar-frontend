'use client'
import { Button } from '@/components/ui/button'
import { Eye, EditIcon, Download, DownloadIcon, Loader2 } from 'lucide-react'
import { ColumnDef, Row } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/DataTableColumnHeader'
import createSelectColumn from '@/components/Columns/ColumnHelpers/CreateSelectColumn'
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
import CustomAlertDialog from "@/components/CustomAlertDialog"
import { useState } from "react"
import { Dialog } from "@/components/ui/dialog"
import { useRouter } from "next/router"
import InvoiceDownloader from "../../pages/dashboard/invoices/InvoiceDownloader"

export const invoiceColumns: ColumnDef<IInvoice>[] = [
  createSelectColumn(),
  {
    accessorKey: 'invoice_number',
    meta: {
      title: 'No. Invoice',
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="No. Invoice" />
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
      title: 'Total Penjualan',
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total Penjualan" />
    ),
    cell: ({ row }) => {
      const invoice = row.original
      return currencyFormatter(invoice.total)
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
              <Badge variant={invoice.status === 1 ? 'success' : 'warning'}>{invoice.status === 1 ? 'Disetujui' : 'Pending'}</Badge>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">

              {/* approve invoice */}
              {can('approve invoices') && (
                <DropdownMenuItem onClick={() => {
                  axios.post(`/api/v1/invoices/${invoice?.id}/approve`).then(() => {
                    toast({
                      variant: 'success',
                      title: 'Sukses',
                      description: `Data penjualan ${invoice?.invoice_number} telah disetujui.`,
                    })

                    table.options.meta?.mutate?.()
                  }).catch(error => {
                    toast({
                      variant: 'destructive',
                      title: 'Gagal',
                      description: error.response?.data.errors,
                    })
                    router.push('/dashboard/invoices/' + invoice?.id)
                  })
                }}>
                  Setujui
                </DropdownMenuItem>
              )}

              {/* reject invoice */}
              {can('delete invoices') && (
                <DropdownMenuItem onClick={() => {
                  setAlertTitle("Tolak Penjualan")
                  setAlertDescription("Apakah Anda yakin ingin mengubah status penjualan menjadi ditolak? Menolak penjualan akan menghapus data penjualan ini.")
                  setAlertContinueAction(() => {
                    return () => {
                      axios.delete(`/api/v1/invoices`, {
                        params: { id: [invoice?.id] },
                      }).then(() => {
                        toast({
                          variant: 'success',
                          title: 'Sukses',
                          description: `Data penjualan ${invoice?.invoice_number} telah dihapus.`,
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
      const [isDownloading, setIsDownloading] = useState<boolean>(false);

      const can = table.options.meta?.can

      if (!can) return null

      return (
        <div className="flex flex-row justify-end gap-2">
          <Link href={`/dashboard/invoices/${invoice.id}`}>
            <Button size="icon" variant="outline" className="relative">
              {invoice.status === 1 ? <Eye size={16} /> : <EditIcon size={16} />}
              <span className="sr-only">{invoice.status === 1 ? "View" : "Edit"}</span>
            </Button>
          </Link>
          <InvoiceDownloader id={invoice.id} setIsDownloading={setIsDownloading}>
            <Button size="icon" variant="outline" className="relative">
              {isDownloading ? <Loader2 className="animate-spin h-4 w-4" /> : <DownloadIcon size={16} />}
              <span className="sr-only">Download</span>
            </Button>
          </InvoiceDownloader>
        </div>
      )
    },
  },
]
