import React, {
    PropsWithChildren,
    useEffect,
    useState,
} from 'react'

import { useAuth } from '@/hooks/useAuth'

import _ from 'lodash'
import { useRouter } from 'next/router'
import axios from '@/lib/axios'
import { toast } from '@/components/ui/use-toast'
import { AxiosError } from 'axios'
import { IInvoice } from '@/types/invoice'
import { format } from "date-fns";
import { id as idLocale } from 'date-fns/locale';
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
import generatePDF, { Options, usePDF } from "react-to-pdf";
import { Separator } from "@/components/ui/separator"
import Image from "next/image"  // Alias the Next.js Image component
import moment from "moment"
import { PDFDocument, StandardFonts } from "pdf-lib"
import { saveAs } from 'file-saver';

interface InvoiceDownloaderProps {
    id: IInvoice["id"];
    setIsDownloading: React.Dispatch<React.SetStateAction<boolean>>;
}

interface InvoiceContentProps {
    invoice: IInvoice | undefined;
    setInvoice: React.Dispatch<React.SetStateAction<IInvoice | undefined>>
}

const InvoiceContent = ({ invoice, setInvoice }: InvoiceContentProps) => {
    if (!invoice) return null;

    const { authUser } = useAuth({ middleware: 'auth' })
    const { targetRef } = usePDF();

    const options: Options = {
        filename: "invoice.pdf",
        method: "build",
        page: {
            margin: 20,
            format: 'A4'
        },
        canvas: {
            mimeType: "image/jpeg",
            qualityRatio: 2
        },
        overrides: {
            pdf: {
                compress: true
            },
            canvas: {
                useCORS: true,
                allowTaint: true,
                ignoreElements: function (e) {
                    if ((e.tagName === "A" && e instanceof HTMLAnchorElement && e.host !== window.location.host) || e.getAttribute('loading') === "lazy") {
                        return true;
                    } else {
                        return false;
                    }
                }
            }
        }
    };

    useEffect(() => {
        if (!invoice) return;
        const generatePDFDocument = async () => {
            const document = await generatePDF(targetRef, options)

            const blob = await document.output("blob");
            const arrayBuffer = await blob.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);

            const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

            const textSize = 8;

            const pages = pdfDoc.getPages()
            pages.map((page, index) => {
                const printedBy = 'Printed by: ' + (authUser?.name && (authUser.name).length > 32
                    ? (authUser?.name)?.substring(0, 32).replace(/\s+\S*$/, '').toUpperCase()
                    : (authUser?.name)?.toUpperCase()); const pageOf = 'Page ' + (index + 1) + '/' + pages.length
                const printedAt = 'Printed at: ' + new Date().toLocaleString()

                page.drawText(printedBy, {
                    x: 56.6929,
                    y: 28.34645 - helveticaFont.heightAtSize(12) / 2,
                    size: textSize,
                    font: helveticaFont
                })

                page.drawText(pageOf, {
                    x: page.getWidth() / 2 - helveticaFont.widthOfTextAtSize(pageOf, textSize) / 2,
                    y: 28.34645 - helveticaFont.heightAtSize(12) / 2,
                    size: textSize,
                    font: helveticaFont
                })

                page.drawText(printedAt, {
                    x: page.getWidth() - helveticaFont.widthOfTextAtSize(printedAt, textSize) - 56.6929,
                    y: 28.34645 - helveticaFont.heightAtSize(12) / 2,
                    size: textSize,
                    font: helveticaFont
                })
            })
            const modifiedPdfBytes = await pdfDoc.save();
            const newBlob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });

            saveAs(newBlob, invoice.customer.company_name + "_" + invoice.invoice_number + "_" + moment().format("YYYY-MM-DD") + ".pdf");
        };

        generatePDFDocument().then(() => {
            setTimeout(() => {
                setInvoice(undefined);
            }, 100);
        })

    }, [invoice])

    return (
        <div className="absolute -left-96 z-[-50000] light tracking-[0.01px]">
            <div className="flex flex-col justify-between w-[210mm] min-h-[297mm]" ref={targetRef}>
                <div>
                    <div className="flex flex-row gap-4 items-center justify-between dark:text-zinc-900">
                        <div>
                            <h1 className="text-2xl font-bold">{process.env.NEXT_APP_NAME}</h1>
                            <p className="text-sm max-w-[80%]">Jl. Letda Made Putra No.4, Dangin Puri Klod, Denpasar, Bali</p>
                            <p className="text-sm">Telp: +6285100665789</p>
                        </div>
                        <div className="relative w-20 h-20">
                            <Image src="/logo.png"
                                height={80}
                                width={80}
                                loading="eager"
                                priority
                                unoptimized
                                alt="Logo" />
                        </div>
                    </div>
                    <Separator className="my-4" />
                    <div className="flex flex-row justify-between dark:text-zinc-900">
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
                            <p className="text-sm">Tgl: {format(invoice?.date, "PPP", { locale: idLocale })}</p>
                        </div>
                    </div>
                    <div
                        className="flex flex-col gap-4 overflow-scroll">
                        {/* data table */}
                        <Table>
                            <TableHeader>
                                <TableRow >
                                    <TableHead className="dark:text-zinc-500">Nama</TableHead>
                                    <TableHead className="dark:text-zinc-500">Kategori</TableHead>
                                    <TableHead className="dark:text-zinc-500">Qty</TableHead>
                                    <TableHead className="dark:text-zinc-500">Harga</TableHead>
                                    <TableHead className="text-right dark:text-zinc-500">Note</TableHead>
                                    {invoice.status === 1 && (<TableHead className="text-right dark:text-zinc-500">Expired</TableHead>)}
                                    <TableHead className="text-right dark:text-zinc-500">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invoice.invoice_items.map((item) => (
                                    <TableRow key={item.id} className="dark:border-zinc-200 dark:data-[state=selected]:bg-zinc-100">
                                        <TableCell className="font-medium dark:text-zinc-900">{item.product?.name}</TableCell>
                                        <TableCell className="dark:text-zinc-900">{item.category?.name}</TableCell>
                                        <TableCell className="dark:text-zinc-900">{(item.quantity).toString()}</TableCell>
                                        <TableCell className="dark:text-zinc-900">{(item.unit_price).toString()}</TableCell>
                                        <TableCell className="text-right dark:text-zinc-900">{item.description}</TableCell>
                                        {invoice.status === 1 && (<TableCell className="text-right dark:text-zinc-900">{item.expiry_date && format(item.expiry_date, "PPP", { locale: idLocale })}</TableCell>)}
                                        <TableCell className="text-right dark:text-zinc-900">{currencyFormatter(item.total_price)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                            <TableFooter>
                                <TableRow className="bg-zinc-50 text-zinc-900 border-zinc-200 dark:bg-zinc-50 dark:text-zinc-900 dark:border-zinc-200">
                                    <TableCell colSpan={invoice.status === 1 ? 6 : 5} className="sm:text-right">Subtotal</TableCell>
                                    <TableCell className="text-right">
                                        {
                                            currencyFormatter(
                                                Math.max(
                                                    invoice.invoice_items.reduce((acc, item) => acc + item.total_price, 0),
                                                    0
                                                )
                                            )
                                        }
                                    </TableCell>
                                </TableRow>
                                <TableRow className="bg-zinc-50 text-zinc-900 border-zinc-200 dark:bg-zinc-50 dark:text-zinc-900 dark:border-zinc-200">
                                    <TableCell colSpan={invoice.status === 1 ? 6 : 5} className="sm:text-right">Diskon</TableCell>
                                    <TableCell className="text-right">{currencyFormatter(Number(invoice.discount))}</TableCell>
                                </TableRow>
                                <TableRow className="bg-zinc-50 text-zinc-900 border-zinc-200 dark:bg-zinc-50 dark:text-zinc-900 dark:border-zinc-200">
                                    <TableCell colSpan={invoice.status === 1 ? 6 : 5} className="sm:text-right">Pajak (%)</TableCell>
                                    <TableCell className="text-right">{invoice.tax}%</TableCell>
                                </TableRow>
                                <TableRow className="bg-zinc-50 text-zinc-900 border-zinc-200 dark:bg-zinc-50 dark:text-zinc-900 dark:border-zinc-200">
                                    <TableCell colSpan={invoice.status === 1 ? 6 : 5} className="sm:text-right">Pajak</TableCell>
                                    <TableCell className="text-right">
                                        {
                                            currencyFormatter(
                                                Math.max(
                                                    (invoice.invoice_items.reduce((acc, item) => acc + item.total_price, 0) - invoice.discount) * Number(invoice.tax) / 100,
                                                    0
                                                )
                                            )
                                        }
                                    </TableCell>
                                </TableRow>
                                <TableRow className="dark:bg-zinc-900 dark:text-zinc-50 ">
                                    <TableCell colSpan={invoice.status === 1 ? 6 : 5}>Total</TableCell>
                                    <TableCell className="text-right">
                                        {
                                            currencyFormatter(
                                                Math.max(
                                                    invoice.invoice_items.reduce((acc, item) => acc + item.total_price, 0) - invoice.discount
                                                    + (invoice.invoice_items.reduce((acc, item) => acc + item.total_price, 0) - invoice.discount) * Number(invoice.tax) / 100,
                                                    0
                                                )
                                            )
                                        }
                                    </TableCell>
                                </TableRow>
                            </TableFooter>
                        </Table>
                        <div className="flex flex-row justify-between mt-4 dark:text-zinc-900">
                            <div>
                                <div className="space-y-3 mt-8">
                                    <p className="text-sm">Catatan Pembelian:</p>
                                    <p className="text-sm">{invoice.description ?? '-'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const InvoiceDownloader = ({ id, setIsDownloading, children }: PropsWithChildren<InvoiceDownloaderProps>) => {
    const router = useRouter()
    const [invoice, setInvoice] = useState<IInvoice>()
    const handleDownloadInvoice = async () => {
        try {
            const response = await axios.get(`/api/v1/invoices/${id}`)
            setInvoice(response.data.data)
            console.log(response.data.data)
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

    if (!id) return <></>
    return (
        <div>
            <div onClick={async () => {
                setIsDownloading(true)
                try {
                    await handleDownloadInvoice()
                } finally {
                    setIsDownloading(false)
                }
            }}>
                {children}
            </div>
            <InvoiceContent invoice={invoice} setInvoice={setInvoice} />
        </div>
    );
};

export default InvoiceDownloader