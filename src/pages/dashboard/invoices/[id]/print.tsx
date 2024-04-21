import React, {
    useEffect,
    useRef,
    useState,
} from 'react'

import { useAuth } from '@/hooks/useAuth'

import _ from 'lodash'
import withProtected from '@/hoc/withProtected'
import { useRouter } from 'next/router'
import axios from '@/lib/axios'
import { toast } from '@/components/ui/use-toast'
import { AxiosError } from 'axios'
import { IInvoice } from '@/types/invoice'
import { format } from "date-fns";
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
import currencyFormatter from "@/lib/currency"
import { Margin, Options } from "react-to-pdf";
import { Separator } from "@/components/ui/separator"
import Image from "next/image"

const InvoicePage = () => {
    const { can, authUser } = useAuth({ middleware: 'auth' })
    const router = useRouter()
    const { id } = router.query

    if (!can('access invoices')) {
        router.push('/dashboard')
        return <></>
    }

    const invoiceRef = useRef<HTMLDivElement>(null); // Specify the type of the ref
    const [invoice, setInvoice] = useState<IInvoice>()
    const [invoiceItems, setInvoiceItems] = useState<IInvoiceItem[]>([])
    const [description, setDescription] = useState<string | undefined>("")
    useEffect(() => {
        if (!id) return

        async function fetchInvoice() {
            try {
                const response = await axios.get(`/api/v1/invoices/${id}`)
                setInvoice(response.data.data)
                setInvoiceItems(response.data.data?.invoice_items ?? [])
                setDescription(response.data.data?.description)
            } catch (error) {
                if (error instanceof AxiosError) {
                    if (error.response?.data.code === 404) {
                        router.push('/invoices')
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
        // default is Resolution.MEDIUM = 3, which should be enough, higher values
        // increases the image quality but also the size of the PDF, so be careful
        // using values higher than 10 when having multiple pages generated, it
        // might cause the page to crash or hang.
        // resolution: Resolution.EXTREME,
        page: {
            // margin is in MM, default is Margin.NONE = 0
            margin: Margin.MEDIUM,
        },
        canvas: {
            // default is 'image/jpeg' for better size performance
            mimeType: "image/jpeg",
            qualityRatio: 1
        },
        // Customize any value passed to the jsPDF instance and html2canvas
        // function. You probably will not need this and things can break,
        // so use with caution.
        overrides: {
            // see https://artskydj.github.io/jsPDF/docs/jsPDF.html for more options
            pdf: {
                compress: true
            },
            // see https://html2canvas.hertzen.com/configuration for more options
            canvas: {
                useCORS: true
            }
        }
    };

    if (!invoice) return <></>


    return (
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
                    <div className="flex flex-col items-end">
                        <h2 className={`text-2xl font-bold ${invoice.status === 1 ? 'text-green-600' : 'text-red-500'}`}>{invoice.status === 1 ? 'Lunas' : 'Belum Lunas'}</h2>
                        <p className="text-sm">{invoice?.invoice_number}</p>
                        <p className="text-sm">Tgl: {format(invoice?.date, 'dd MMMM yyyy')}</p>
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
                                <TableHead>Qty</TableHead>
                                <TableHead>Harga</TableHead>
                                <TableHead className="text-right">Note</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoiceItems.map((item, index) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.product?.name}</TableCell>
                                    <TableCell>{item.category?.name}</TableCell>
                                    <TableCell>{(item.quantity).toString()}</TableCell>
                                    <TableCell>{(item.unit_price).toString()}</TableCell>
                                    <TableCell className="text-right">{item.description}</TableCell>
                                    <TableCell className="text-right">{currencyFormatter(item.total_price)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        <TableFooter>
                            <TableRow className="bg-zinc-50 font-medium text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50 hover:bg-zinc-50/90 dark:hover:bg-zinc-800/90">
                                <TableCell colSpan={5} className="sm:text-right">Subtotal</TableCell>
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
                                <TableCell colSpan={5} className="sm:text-right">Diskon</TableCell>
                                <TableCell className="text-right">{currencyFormatter(Number(invoice.discount))}</TableCell>
                            </TableRow>
                            <TableRow className="bg-zinc-50 font-medium text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50 hover:bg-zinc-50/90 dark:hover:bg-zinc-800/90">
                                <TableCell colSpan={5} className="sm:text-right">Pajak (%)</TableCell>
                                <TableCell className="text-right">{invoice.tax}%</TableCell>
                            </TableRow>
                            <TableRow className="bg-zinc-50 font-medium text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50 hover:bg-zinc-50/90 dark:hover:bg-zinc-800/90">
                                <TableCell colSpan={5} className="sm:text-right">Pajak</TableCell>
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
                                <TableCell colSpan={5}>Total</TableCell>
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
                            <div className="space-y-3 mt-8">
                                <p className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Catatan Pembelian:</p>
                                <p className="text-sm font-normal">{description}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            <div className="flex flex-row justify-between gap-4 py-4 px-6">
                <p className="text-sm font-normal">Printed by: {(authUser?.name)?.toUpperCase()}</p>
                <p className="text-sm font-normal">Printed at: {new Date().toLocaleString()}</p>
            </div>
        </div>
    )
}

export default withProtected(InvoicePage)
