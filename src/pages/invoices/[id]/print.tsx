import React, {
    useEffect,
    useState,
} from 'react'

import { useAuth } from '@/hooks/useAuth'

import _ from 'lodash'
import AppLayout from '@/components/Layouts/AppLayout'
import { Button } from '@/components/ui/button'
import withProtected from '@/hoc/withProtected'
import { useRouter } from 'next/router'
import { Check, Dot, Save, X } from 'lucide-react'
import ContentLayout from '@/components/Layouts/ContentLayout'
import { useBreakpoint } from "@/hooks/useBreakpoint"

import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import axios from '@/lib/axios'
import { toast } from '@/components/ui/use-toast'
import Link from "next/link"

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { AxiosError } from 'axios'
import { IInvoice } from '@/types/invoice'
import Dropzone, { CustomFile } from "@/components/ImageUploadHelpers/Dropzone"
import { IImage } from "@/types/image"
import { ScannerDrawerDialog } from "@/components/Scanner"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { CalendarIcon, Plus, Trash2 } from "lucide-react"
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar"
import { id as idLocale } from 'date-fns/locale';
import { ProductCombobox } from "@/components/Combobox/ProductCombobox"
import { IProduct } from "@/types/product"
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
import CustomAlertDialog from "@/components/AlertDialog"
import { EditText } from 'react-edit-text';
import currencyFormatter from "@/lib/currency"
import { CustomerCombobox } from "@/components/Combobox/CustomerCombobox"
import { CategoryCombobox } from "@/components/Combobox/CategoryCombobox"
import { Badge } from "@/components/ui/badge"

const InvoicePage = () => {
    const { can } = useAuth({ middleware: 'auth' })
    const router = useRouter()
    const { id } = router.query

    if (!can('access invoices')) {
        router.push('/dashboard')
        return <></>
    }

    const { isBelowXs } = useBreakpoint('xs')
    const { isBelowSm } = useBreakpoint('sm')


    const [title, setTitle] = useState<string>("Penjualan")

    const [invoice, setInvoice] = useState<IInvoice>()
    const [invoiceItems, setInvoiceItems] = useState<IInvoiceItem[]>([])

    useEffect(() => {
        if (!id) return

        async function fetchInvoice() {
            try {
                const response = await axios.get(`/api/v1/invoices/${id}`)
                setInvoice(response.data.data)
                router.push('/invoices')
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

    useEffect(() => {
        setTitle(`Penjualan #${invoice?.invoice_number.slice(-4)}`)

        setInvoiceItems(invoice?.invoice_items ?? [])
    }, [invoice])

    if (!invoice) return <></>

    return (
        <AppLayout
            title={title}
            headerAction={
                <div className="flex flex-row space-x-2" >
                    <Link href={`/invoices`}>
                        <Button className={`uppercase ${isBelowXs ? 'px-2' : ''}`}>
                            Kembali
                        </Button>
                    </Link>
                </div>
            }
        >
            <ContentLayout className="my-0 sm:my-12 px-6 py-8 sm:mx-6 lg:mx-8 overflow-hidden">


                {/* data table */}
                <Table>
                    {!isBelowSm && (
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nama</TableHead>
                                <TableHead>Kategori</TableHead>
                                <TableHead>Stok</TableHead>
                                <TableHead>Qty</TableHead>
                                <TableHead>Harga</TableHead>
                                <TableHead className="text-right">Note</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                {invoice.status == 0 && (<TableHead className="text-right">Aksi</TableHead>)}
                            </TableRow>
                        </TableHeader>
                    )}
                    {isBelowSm ? (
                        <>

                            {invoiceItems.map((item, index) => (
                                <TableBody key={item.id} className="my-2 border">
                                    <TableRow>
                                        <TableHead>#</TableHead>
                                        <TableCell className="font-medium">{index + 1}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableHead>SN</TableHead>
                                        <TableCell className="font-medium">{item.product.serial_number}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableHead>Nama</TableHead>
                                        <TableCell className="font-medium whitespace-nowrap">{item.product.name}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableHead>Kategori</TableHead>
                                        <TableCell className="whitespace-nowrap">{item.category.name}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableHead className="gap-2">Stok  {invoice.status === 0 && item.quantity > item.product.stock && (<><Badge variant="warning" className="w-auto px-1">Low Stock</Badge></>)}</TableHead>
                                        <TableCell className="whitespace-nowrap">{item.product.stock}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableHead>Qty</TableHead>
                                        <TableCell className="whitespace-nowrap">
                                            <FormField
                                                name="quantity"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input
                                                                disabled={invoice?.status === 1 ? true : false}
                                                                {...field}
                                                                type="number"
                                                                step={1}
                                                                min={1}
                                                                placeholder="Kuantitas"
                                                                width={80}
                                                                value={(item.quantity).toString()}
                                                                className={invoice.status === 0 && item.quantity > item.product.stock ? `border-yellow-300 bg-yellow-100` : ''}
                                                                onChange={(event) => {
                                                                    let newValue = Number(event.target.value);
                                                                    const updatedItems = [...invoiceItems];
                                                                    updatedItems[index] = {
                                                                        ...updatedItems[index],
                                                                        quantity: newValue,
                                                                        total_price: newValue * item.unit_price
                                                                    };
                                                                    setInvoiceItems(updatedItems);
                                                                }}
                                                                onBlur={(e) => {
                                                                    if (Number(e.target.value) < 1) {
                                                                        const updatedItems = [...invoiceItems];
                                                                        updatedItems[index] = {
                                                                            ...updatedItems[index],
                                                                            quantity: 1,
                                                                            total_price: 1 * item.unit_price
                                                                        };
                                                                        setInvoiceItems(updatedItems);
                                                                    }
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableHead>Harga</TableHead>
                                        <TableCell className="whitespace-nowrap">
                                            <FormField
                                                name="unit_price"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input
                                                                disabled={invoice?.status === 1 ? true : false}
                                                                {...field}
                                                                className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                                type="number"
                                                                step="any"
                                                                min={1}
                                                                placeholder="Harga/Unit"
                                                                value={(item.unit_price).toString()}
                                                                onChange={(event) => {
                                                                    const newValue = Number(event.target.value);
                                                                    const updatedItems = [...invoiceItems];
                                                                    updatedItems[index] = {
                                                                        ...updatedItems[index],
                                                                        unit_price: newValue,
                                                                        total_price: item.quantity * newValue
                                                                    };
                                                                    setInvoiceItems(updatedItems);
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableHead>
                                            Note
                                        </TableHead>

                                        <TableCell className="whitespace-nowrap">
                                            <FormField
                                                name="description"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input
                                                                disabled={invoice?.status === 1 ? true : false}
                                                                {...field}
                                                                type="text"
                                                                placeholder="Note"
                                                                value={item.description}
                                                                onChange={(event) => {
                                                                    const newValue = String(event.target.value);
                                                                    const updatedItems = [...invoiceItems];
                                                                    updatedItems[index] = {
                                                                        ...updatedItems[index],
                                                                        description: newValue,
                                                                    };
                                                                    setInvoiceItems(updatedItems);
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableHead>Total</TableHead>
                                        <TableCell className="text-right whitespace-nowrap">{currencyFormatter(item.total_price)}</TableCell>

                                    </TableRow>
                                    {invoice.status == 0 && (
                                        <TableRow className="">
                                            <TableCell colSpan={2} className="text-right">
                                                <Button
                                                    variant="destructive"
                                                    className="w-full"
                                                    onClick={() => {
                                                        const updatedItems = invoiceItems.filter((product) => product.id !== item.id);
                                                        setInvoiceItems(updatedItems);
                                                    }}>
                                                    Hapus {item.product.name}
                                                    <span className="sr-only">Hapus</span>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            ))}
                        </>
                    ) : (
                        <TableBody>
                            {invoiceItems.map((item, index) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.product?.name}</TableCell>
                                    <TableCell>{item.category?.name}</TableCell>
                                    <TableCell className="gap-2">{item.product?.stock} {invoice.status === 0 && item.quantity > item.product.stock && (<><Badge variant="warning" className="w-auto px-1">Low Stock</Badge></>)}</TableCell>
                                    {invoice.status == 1 && (<TableCell>{item.quantity}</TableCell>)}
                                    {invoice.status == 1 && (<TableCell>{currencyFormatter(item.total_price)}</TableCell>)}
                                    {invoice.status == 1 && (<TableCell className="text-right">{item.description}</TableCell>)}
                                    {invoice.status == 0 && (<TableCell>
                                        <FormField
                                            name="quantity"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <EditText
                                                            {...field}
                                                            type="number"
                                                            value={(item.quantity).toString()}
                                                            inputClassName="flex h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300"
                                                            onChange={(event) => {
                                                                let newValue = Number(event.target.value);
                                                                const updatedItems = [...invoiceItems];
                                                                updatedItems[index] = {
                                                                    ...updatedItems[index],
                                                                    quantity: newValue,
                                                                    total_price: newValue * item.unit_price
                                                                };
                                                                setInvoiceItems(updatedItems);
                                                            }}
                                                            onSave={(e) => {
                                                                if (Number(e.value) < 1) {
                                                                    const updatedItems = [...invoiceItems];
                                                                    updatedItems[index] = {
                                                                        ...updatedItems[index],
                                                                        quantity: Number(e.previousValue),
                                                                        total_price: Number(e.previousValue) * item.unit_price
                                                                    };
                                                                    setInvoiceItems(updatedItems);
                                                                }
                                                            }}
                                                            inline />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </TableCell>)}
                                    {invoice.status == 0 && (<TableCell>
                                        <FormField
                                            name="unit_price"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <EditText
                                                            {...field}
                                                            type="number"
                                                            value={(item.unit_price).toString()}
                                                            inputClassName="flex h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                            onChange={(event) => {
                                                                const newValue = Number(event.target.value);
                                                                const updatedItems = [...invoiceItems];
                                                                updatedItems[index] = {
                                                                    ...updatedItems[index],
                                                                    unit_price: newValue,
                                                                    total_price: item.quantity * newValue
                                                                };
                                                                setInvoiceItems(updatedItems);
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </TableCell>)}
                                    {invoice.status == 0 && (<TableCell className="text-right">
                                        <FormField
                                            name="description"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <EditText
                                                            {...field}
                                                            placeholder="-"
                                                            type="text"
                                                            value={item.description}
                                                            inputClassName="flex h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300"
                                                            onChange={(event) => {
                                                                const newValue = String(event.target.value);
                                                                const updatedItems = [...invoiceItems];
                                                                updatedItems[index] = {
                                                                    ...updatedItems[index],
                                                                    description: newValue,
                                                                };
                                                                setInvoiceItems(updatedItems);
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </TableCell>)}
                                    <TableCell className="text-right">{currencyFormatter(item.total_price)}</TableCell>
                                    {invoice.status == 0 && (
                                        <TableCell className="text-right">
                                            <Button
                                                size="icon"
                                                variant="outline"
                                                className="relative"
                                                onClick={() => {
                                                    const updatedItems = invoiceItems.filter((product) => product.id !== item.id);
                                                    setInvoiceItems(updatedItems);
                                                }}>
                                                <Trash2 size={16} className="text-red-500 dark:text-red-500" />
                                                <span className="sr-only">Hapus</span>
                                            </Button>
                                        </TableCell>)}
                                </TableRow>
                            ))}
                        </TableBody>
                    )}
                    <TableFooter>
                        <TableRow>
                            <TableCell colSpan={isBelowSm ? 1 : 6}>Total Penjualan</TableCell>
                            <TableCell className="text-right">{currencyFormatter(invoiceItems.reduce((acc, item) => acc + item.total_price, 0))}</TableCell>
                            {!isBelowSm && (<TableCell />)}
                        </TableRow>
                    </TableFooter>
                </Table>
            </ContentLayout>
        </AppLayout >
    )
}

export default withProtected(InvoicePage)
