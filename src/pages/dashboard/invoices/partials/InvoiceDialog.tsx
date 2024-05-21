import React, {
    Dispatch,
    PropsWithChildren,
    SetStateAction,
    useEffect,
    useRef,
    useState,
} from 'react'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ICustomer } from '@/types/customer'
import { KeyedMutator } from 'swr'
import { DataTable } from '@/components/ui/data-table'
import axios from "@/lib/axios"
import generatePDF, { Margin, Options } from "react-to-pdf";
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import currencyFormatter from "@/lib/currency"
import { IInvoice } from '@/types/invoice'
import { IInvoiceItem } from "@/types/invoiceItem"
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { format } from "date-fns";
import { AxiosError } from 'axios'
import { useRouter } from "next/router"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/hooks/useAuth"


interface IInvoiceDialog<TData> {
    data?: DataTable<TData>
    id?: number
    setDisabledContextMenu?: Dispatch<SetStateAction<boolean | undefined>>
    onSuccess?: () => void;
}

export default function InvoiceDialog({
    id,
    children,
    setDisabledContextMenu
}: PropsWithChildren<IInvoiceDialog<ICustomer>>) {
    const { authUser } = useAuth({ middleware: 'auth' })
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const invoiceRef = useRef<HTMLDivElement>(null);
    const [invoice, setInvoice] = useState<IInvoice>()
    const [invoiceItems, setInvoiceItems] = useState<IInvoiceItem[]>([])
    const [description, setDescription] = useState<string | undefined>("")

    setDisabledContextMenu &&
        useEffect(() => {
            setDisabledContextMenu(open)
        }, [open])

    useEffect(() => {
        if (!id) return

        async function fetchInvoice() {
            try {
                const response = await axios.get(`/api/v1/invoices/${id}`)
                setInvoice(response.data.data)
            } catch (error) {
                if (error instanceof AxiosError) {
                    if (error.response?.data.code === 404) {
                        router.push('/dashboard/invoices')
                    } else {
                        toast({
                            variant: 'destructive',
                            title: 'Terjadi kesalahan',
                            description: `Error ${error.response?.data.code}: ${error.response?.data.status}`,
                        })
                    }
                }
            }
        }

        fetchInvoice()
    }, [id])


    const options: Options = {
        filename: "invoice.pdf",
        method: "save",
        page: {
            // margin is in MM, default is Margin.NONE = 0
            margin: Margin.MEDIUM,
        },
        canvas: {
            mimeType: "image/jpeg",
            qualityRatio: 1
        },
        overrides: {
            pdf: {
                compress: true
            },
            canvas: {
                useCORS: true
            }
        }
    };

    if (!invoice) return <></>

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-h-[calc(100dvh)] md:max-h-[90vh] overflow-y-scroll sm:max-w-[525px]">
                <DialogHeader className="space-y-2">
                    <DialogTitle>Invoice</DialogTitle>
                </DialogHeader>
                <div className="w-[210mm] flex flex-col min-h-[297mm] justify-between"
                    ref={invoiceRef}>
                    <div className="px-6 py-8">
                        <div className="flex flex-row gap-4 items-center justify-between">
                            {/* company name from env */}
                            <div>
                                <h1 className="text-2xl font-bold">PT. INDOKA SURYA JAYA</h1>
                                <p className="text-sm max-w-[80%]">Jl. Letda Reta No.19, Dangin Puri Klod, Kec. Denpasar Tim., Kota Denpasar, Bali 80232</p>
                                <p className="text-sm">Telp: +6281000000 | Email: hello@indokasuryajaya.com</p>
                            </div>
                            <div className="relative w-20 h-20">
                                <Image src="/logo.png"
                                    layout="fill"
                                    objectFit='cover'
                                    objectPosition='center'
                                    unoptimized
                                    alt="Logo" />
                            </div>
                        </div>
                        <Separator className="my-4" />
                        <div className="flex flex-row justify-between">
                            <div>
                                <p className="text-sm">Kepada Yth:</p>
                                <p className="text-sm">{invoice?.customer?.company_name}</p>
                                <p className="text-sm">{invoice?.customer?.address}</p>
                                <p className="text-sm">PIC: {invoice?.customer?.pic_name}</p>
                                <p className="text-sm">{invoice?.customer?.phone}</p>
                            </div>
                            <div>
                                <p className="text-sm">{invoice?.invoice_number}</p>
                                <p className="text-sm">Date: {format(invoice?.date, 'dd MMMM yyyy')}</p>
                            </div>
                        </div>
                        <div
                            className="flex flex-col gap-4 overflow-scroll">
                            {/* data table */}
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nama</TableHead>
                                        <TableHead>Kategori</TableHead>
                                        {invoice.status === 0 && (<TableHead>Stok</TableHead>)}
                                        <TableHead>Qty</TableHead>
                                        <TableHead>Harga</TableHead>
                                        <TableHead className="text-right">Note</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                        {invoice.status == 0 && (<TableHead className="text-right"></TableHead>)}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {invoiceItems.map((item, index) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.product?.name}</TableCell>
                                            <TableCell>{item.category?.name}</TableCell>
                                            {invoice.status === 0 && (<TableCell className="gap-2">{item.product?.stock} {invoice.status === 0 && item.quantity > item.product.stock && (<><Badge variant="warning" className="w-auto px-1">Low Stock</Badge></>)}</TableCell>)}
                                            <TableCell>{(item.quantity).toString()}</TableCell>
                                            <TableCell>{(item.unit_price).toString()}</TableCell>
                                            <TableCell className="text-right">{item.description}</TableCell>
                                            <TableCell className="text-right">{currencyFormatter(item.total_price)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                                <TableFooter>
                                    <TableRow className="bg-zinc-50 font-medium text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50 hover:bg-zinc-50/90 dark:hover:bg-zinc-800/90">
                                        <TableCell colSpan={invoice.status === 0 ? 6 : 5} className="sm:text-right">Subtotal</TableCell>
                                        <TableCell className="text-right">
                                            {
                                                currencyFormatter(
                                                    Math.max(
                                                        invoiceItems.reduce((acc, item) => acc + item.total_price, 0),
                                                        0
                                                    )
                                                )
                                            }
                                        </TableCell>
                                    </TableRow>
                                    <TableRow className="bg-zinc-50 font-medium text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50 hover:bg-zinc-50/90 dark:hover:bg-zinc-800/90">
                                        <TableCell colSpan={invoice.status === 0 ? 6 : 5} className="sm:text-right">Diskon</TableCell>
                                        <TableCell className="text-right">{currencyFormatter(Number(invoice.discount))}</TableCell>
                                    </TableRow>
                                    <TableRow className="bg-zinc-50 font-medium text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50 hover:bg-zinc-50/90 dark:hover:bg-zinc-800/90">
                                        <TableCell colSpan={invoice.status === 0 ? 6 : 5} className="sm:text-right">Pajak (%)</TableCell>
                                        <TableCell className="text-right">{invoice.tax}%</TableCell>
                                    </TableRow>
                                    <TableRow className="bg-zinc-50 font-medium text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50 hover:bg-zinc-50/90 dark:hover:bg-zinc-800/90">
                                        <TableCell colSpan={invoice.status === 0 ? 6 : 5} className="sm:text-right">Pajak</TableCell>
                                        <TableCell className="text-right">
                                            {
                                                currencyFormatter(
                                                    Math.max(
                                                        (invoiceItems.reduce((acc, item) => acc + item.total_price, 0) - invoice.discount) * Number(invoice.tax) / 100,
                                                        0
                                                    )
                                                )
                                            }
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell colSpan={invoice.status === 0 ? 6 : 5}>Total</TableCell>
                                        <TableCell className="text-right">
                                            {
                                                currencyFormatter(
                                                    Math.max(
                                                        invoiceItems.reduce((acc, item) => acc + item.total_price, 0) - invoice.discount
                                                        + (invoiceItems.reduce((acc, item) => acc + item.total_price, 0) - invoice.discount) * Number(invoice.tax) / 100,
                                                        0
                                                    )
                                                )
                                            }
                                        </TableCell>
                                    </TableRow>
                                </TableFooter>
                            </Table>
                            <div className="flex flex-row justify-between mt-4">
                                <div>
                                    <p className="text-sm">Pembayaran:</p>
                                    <p className="text-sm">PT. Indoka Surya Jaya</p>
                                    <p className="text-sm">5748377838 (Bank Central Asia</p>
                                    {!description && (
                                        <div className="space-y-3 mt-8">
                                            <p className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Catatan Pembelian</p>
                                            <p className="text-sm font-normal">{description}</p>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-28 text-center mr-12 mt-48">
                                    <p className="text-sm font-bold">PT. Indoka Surya Jaya</p>
                                    <p className="text-sm">Garin S.</p>
                                </div>
                            </div>
                        </div>
                    </div>


                    <div className="flex flex-row justify-between gap-4 py-4 px-6">
                        <p className="text-sm font-normal">Printed by: {(authUser?.name)?.toUpperCase()}</p>
                        <p className="text-sm font-normal">Printed at: {new Date().toLocaleString()}</p>
                    </div>
                </div>
                <DialogFooter className="mt-2 justify-end">
                    <Button className="w-full" type="button" onClick={() => { }}>
                        Print
                    </Button>
                    <Button onClick={() => generatePDF(invoiceRef, options)}>
                        Download PDF
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
