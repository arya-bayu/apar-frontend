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
import { Check, Dot, DownloadIcon, Save, X } from 'lucide-react'
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
import { ScannerDrawerDialog } from "@/components/ScannerDrawerDialog"
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
import CustomAlertDialog from "@/components/CustomAlertDialog"
import { EditText } from 'react-edit-text';
import currencyFormatter from "@/lib/currency"
import { CustomerCombobox } from "@/components/Combobox/CustomerCombobox"
import { CategoryCombobox } from "@/components/Combobox/CategoryCombobox"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import Image from "next/image"
import { Separator } from "@radix-ui/react-dropdown-menu"
import InvoiceDownloader from "./InvoiceDownloader"

const invoiceFormSchema = z.object({
    invoice_number: z.string(),
    date: z
        .coerce
        .date(),
    customerId: z
        .coerce
        .number({
            required_error: "Pilih customer penjualan.",
            invalid_type_error: "Pilih customer penjualan.",
        }),
})

const InvoicePage = () => {
    const { can } = useAuth({ middleware: 'auth' })
    const router = useRouter()
    const { id } = router.query

    if (!can('update invoices')) {
        router.push('/dashboard')
        return <></>
    }

    const { isBelowXs } = useBreakpoint('xs')
    const { isBelowSm } = useBreakpoint('sm')


    const [alert, setAlert] = useState(false)
    const [alertTitle, setAlertTitle] = useState<string>("")
    const [alertDescription, setAlertDescription] = useState<string>("")
    const [alertContinueAction, setAlertContinueAction] = useState(() => {
        return () => { };
    });

    const [title, setTitle] = useState<string>("Invoice")

    const [invoice, setInvoice] = useState<IInvoice>()
    const [invoiceItems, setInvoiceItems] = useState<IInvoiceItem[]>([])
    const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [description, setDescription] = useState<string | undefined>("")
    const [existingImages, setExistingImages] = useState<IImage[]>([])
    const [selectedImages, setSelectedImages] = useState<CustomFile[]>([]);
    const [scannerType, setScannerType] = useState<"BAR" | "QR">("BAR");

    const form = useForm<z.infer<typeof invoiceFormSchema>>({
        resolver: zodResolver(invoiceFormSchema),
    })

    useEffect(() => {
        if (!id) return

        async function fetchInvoice() {
            try {
                const response = await axios.get(`/api/v1/invoices/${id}`)
                setInvoice(response.data.data)
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
        setTitle(`Invoice #${invoice?.invoice_number.slice(-4)}`)

        form.reset({
            invoice_number: invoice?.invoice_number,
            date: invoice?.date,
            customerId: invoice?.customer_id,
        })

        setInvoiceItems(invoice?.invoice_items ?? [])
        setDescription(invoice?.description)
        setExistingImages(invoice?.images ?? [])
    }, [invoice])

    const uploadImages = async (selectedImages: CustomFile[]) => {
        const images = [];

        for (const image of selectedImages) {
            const formData = new FormData();
            formData.append('image', image);

            try {
                const response = await axios({
                    method: 'post',
                    url: '/api/v1/invoices/image/',
                    data: formData,
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                images.push(response.data.data);
            } catch (error) {
                if (error instanceof AxiosError) {
                    toast({
                        variant: 'destructive',
                        title: 'Terjadi kesalahan',
                        description: `Error ${error.response?.data.code}: ${error.response?.data.status}`,
                    })
                }
            }
        }

        return images;
    };

    const onSubmit = async (values: z.infer<typeof invoiceFormSchema>) => {
        if (invoiceItems.length === 0) {
            toast({
                variant: 'destructive',
                title: 'Daftar penjualan kosong!',
                description: 'Anda belum melakukan input data barang yang dibeli',
            })
            return;
        }

        const formData = new FormData();

        formData.append('_method', 'put')
        formData.append('status', "0");
        formData.append('date', format(values.date, 'yyyy-MM-dd'));
        formData.append('invoice_number', values.invoice_number);
        formData.append('customer_id', String(values.customerId));
        formData.append('discount', String(invoice?.discount));
        formData.append('tax', String(invoice?.tax));
        description && formData.append('description', String(description));

        // append existing image
        existingImages.forEach((image, index) => {
            formData.append(`images[${index}]`, String(image.id));
        })

        selectedImages && await uploadImages(selectedImages).then((images) => {
            images.forEach((image, index) => {
                formData.append(`images[${index + existingImages.length}]`, String(image.id));
            })
        })

        invoiceItems.forEach((item, index) => {
            item.id && formData.append(`invoice_items[${index}][id]`, String(item.id));
            formData.append(`invoice_items[${index}][category_id]`, String(item.product.category_id));
            formData.append(`invoice_items[${index}][product_id]`, String(item.product.id));
            formData.append(`invoice_items[${index}][unit_price]`, String(item.unit_price));
            formData.append(`invoice_items[${index}][quantity]`, String(item.quantity));
            if (item.description) {
                formData.append(`invoice_items[${index}][description]`, String(item.description));
            }
        });

        try {
            const response = await axios({
                method: 'post',
                url: `/api/v1/invoices/${invoice?.id}`,
                data: formData,
            })

            if (response) {
                toast({
                    variant: 'success',
                    title: 'Sukses',
                    description: `Data penjualan ${values.invoice_number} telah berhasil diperbarui.`,
                })
                router.push('/invoices')
            }
        } catch (error) {
            if (error instanceof AxiosError) {
                const errStatus = error.response?.status
                const errors = error.response?.data.errors
                if (errStatus === 422) {
                    if (errors.images) {
                        toast({
                            variant: 'destructive',
                            title: 'Terjadi kesalahan pada input gambar',
                            description: errors.images,
                        })
                    }
                    if (errors.date) {
                        form.setError('date', {
                            type: 'server',
                            message: errors.date,
                        })
                    }
                    if (errors.invoice_number) {
                        form.setError('invoice_number', {
                            type: 'server',
                            message: errors.invoice_number,
                        })
                    }
                } else {
                    toast({
                        variant: 'destructive',
                        title: 'Terjadi kesalahan',
                        description: error.response?.data.errors,
                    })
                }
            }
        }
    }


    const addInvoiceItem = async (id: IProduct["id"]) => {
        if (invoiceItems.some((item) => item.product_id === id)) {
            toast({
                variant: 'destructive',
                title: 'Gagal',
                description: 'Produk telah ada di penjualan ini.',
            })
            return
        }
        axios.get('api/v1/products/' + id).then((response) => {
            const newProduct: IProduct = response.data.data
            const newInvoiceItem: IInvoiceItem = {
                category_id: newProduct.category_id,
                product_id: newProduct.id,
                description: '',
                unit_price: newProduct.price,
                quantity: 1,
                total_price: newProduct.price * 1,
                category: newProduct.category,
                product: newProduct,
            }
            setInvoiceItems([...invoiceItems, newInvoiceItem])
        }).catch((error) => {
            toast({
                variant: 'destructive',
                title: 'Terjadi kesalahan',
                description: 'Error ' + error.response?.status + ': ' + error.response?.data.errors,
            })
        })
    }

    if (!invoice) return <></>

    return (
        <AppLayout
            title={title}
            headerAction={
                <div className="flex flex-row space-x-2 ml-4" >
                    <Button className="uppercase" variant={"outline"} onClick={router.back}>
                        Kembali
                    </Button>
                    {
                        invoice?.status === 0 && (
                            <Button size={isBelowSm ? 'icon' : 'default'} onClick={form.handleSubmit(onSubmit)} className={`uppercase ${isBelowXs ? 'px-2' : ''}`}>
                                {isBelowSm ? <Save size={18} /> : 'Simpan'}
                            </Button>
                        )
                    }
                </div>
            }
        >
            <ContentLayout className="my-0 sm:my-12 sm:mx-6 lg:mx-8 overflow-hidden z-10">
                {(invoice.status = 0) ?
                    (<Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="flex flex-col gap-4 overflow-scroll px-6 py-8">
                            <div className="flex flex-col md:flex-row  items-center gap-4">
                                <FormField
                                    control={form.control}
                                    name="date"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col w-full">
                                            <FormLabel className="mt-1 mb-2">Tanggal Penjualan</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            disabled={invoice?.status === 1 ? true : false}
                                                            variant={"outline"}
                                                            className={cn(
                                                                "w-full pl-3 text-left font-normal py-2",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            {field.value ? (
                                                                format(field.value, "PPP", { locale: idLocale })
                                                            ) : (
                                                                <span>Tanggal</span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        disabled={(date) =>
                                                            date > new Date() || date < new Date("1900-01-01")
                                                        }
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="invoice_number"
                                    render={({ field }) => (
                                        <FormItem className="w-full">
                                            <FormLabel>No. Penjualan</FormLabel>
                                            <FormControl>
                                                <Input
                                                    disabled={invoice.status === 1}
                                                    {...field}
                                                    placeholder="Nomor Penjualan"
                                                    required
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="customerId"
                                    render={({ field }) => (
                                        <FormItem className="w-full md:mt-0">
                                            <FormLabel>Customer</FormLabel>
                                            <FormControl>
                                                <CustomerCombobox
                                                    disabled={invoice?.status === 1 ? true : false}
                                                    value={field.value ?? null}
                                                    onSelect={(customerId) => {
                                                        form.setValue("customerId", customerId);
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            {invoice?.status === 0 && (
                                <div className="w-full flex flex-row items-center gap-4">
                                    <FormField
                                        name="categoryId"
                                        render={() => (
                                            <FormItem className="w-1/3 md:mt-0">
                                                <FormLabel>Kategori</FormLabel>
                                                <FormControl>
                                                    <CategoryCombobox
                                                        value={selectedCategoryId}
                                                        onSelect={(categoryId) => {
                                                            setSelectedCategoryId(categoryId);
                                                            setSelectedProductId(null)
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        name="productId"
                                        render={() => (
                                            <FormItem className="w-full md:mt-0">
                                                <FormLabel>Produk</FormLabel>
                                                <div className="w-full flex flex-row justify-between space-x-4">

                                                    <FormControl>
                                                        <ProductCombobox
                                                            categoryId={selectedCategoryId ?? null}
                                                            value={selectedProductId ?? null}
                                                            onSelect={(productId) => {
                                                                setSelectedProductId(productId);
                                                            }}
                                                        />
                                                    </FormControl>

                                                    <ScannerDrawerDialog
                                                        scannerType={scannerType}
                                                        onScanResult={(res: string) => {
                                                            if (res) {
                                                                axios.get(`/api/v1/products/serial-number/${res}`).then((res) => {
                                                                    if (res.data.code === 200) {
                                                                        addInvoiceItem(res.data.data.id)
                                                                    }
                                                                }).catch((error) => {
                                                                    let errTitle;
                                                                    let errDescription;

                                                                    if (error.response.data.code === 404) {
                                                                        errTitle = "Barang tidak ditemukan"
                                                                        errDescription = "Kode serial " + res + " tidak ditemukan pada sistem."
                                                                    }

                                                                    toast({
                                                                        variant: 'destructive',
                                                                        title: errTitle ?? 'Terjadi kesalahan',
                                                                        description: errDescription ?? 'Error ' + error.response?.data.code + ': ' + error.response?.data.status,
                                                                    })
                                                                })
                                                            }
                                                        }} />

                                                    <Button
                                                        onClick={() =>
                                                            selectedProductId && addInvoiceItem(selectedProductId)
                                                        }
                                                        type="button"
                                                        className="aspect-square px-2 py-0">
                                                        <Plus size={20} />
                                                    </Button>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}

                            {/* data table */}
                            <Table>
                                {!isBelowSm && (
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
                                                {invoice.status === 0 && (
                                                    <TableRow>
                                                        <TableHead className="gap-2">Stok </TableHead>
                                                        <TableCell className="whitespace-nowrap">{item.product.stock} {invoice.status === 0 && item.quantity > item.product.stock && (<><Badge variant="warning" className="w-auto px-1">Low Stock</Badge></>)}</TableCell>
                                                    </TableRow>
                                                )}
                                                <TableRow>
                                                    <TableHead>Qty</TableHead>
                                                    <TableCell className="whitespace-nowrap">
                                                        <FormField
                                                            name="quantity"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormControl>
                                                                        <Input
                                                                            readOnly={invoice.status === 1}
                                                                            {...field}
                                                                            type="number"
                                                                            step={1}
                                                                            min={1}
                                                                            placeholder="Kuantitas"
                                                                            width={80}
                                                                            value={(item.quantity).toString()}
                                                                            className={invoice.status === 0 && item.quantity > item.product.stock ? `text-zinc-800 border-yellow-300 bg-yellow-100` : ''}
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
                                                                            readOnly={invoice.status === 1}
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
                                                                            readOnly={invoice.status === 1}
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
                                                {
                                                    invoice.status == 0 && (
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
                                                    )
                                                }
                                            </TableBody>
                                        ))}
                                    </>
                                ) : (
                                    <TableBody>
                                        {invoiceItems.map((item, index) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">{item.product?.name}</TableCell>
                                                <TableCell>{item.category?.name}</TableCell>
                                                {invoice.status === 0 && (<TableCell className="gap-2">{item.product?.stock} {invoice.status === 0 && item.quantity > item.product.stock && (<><Badge variant="warning" className="w-auto px-1">Low Stock</Badge></>)}</TableCell>)}
                                                <TableCell>
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
                                                                        inline
                                                                        readonly={invoice.status === 1}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </TableCell>
                                                <TableCell>
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
                                                                        readonly={invoice.status === 1}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </TableCell>
                                                <TableCell className="text-right">
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
                                                                        readonly={invoice.status === 1}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </TableCell>
                                                <TableCell className="text-right">{currencyFormatter(item.total_price)}</TableCell>
                                                {invoice.status == 0 && (
                                                    <TableCell className="text-center w-0">
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
                                    <TableRow className="bg-zinc-50 font-medium text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50 hover:bg-zinc-50/90 dark:hover:bg-zinc-800/90">
                                        <TableCell colSpan={isBelowSm ? 1 : invoice.status === 0 ? 6 : 5} className="sm:text-right">Subtotal</TableCell>
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
                                        {!isBelowSm && (<TableCell />)}
                                    </TableRow>
                                    <TableRow className="bg-zinc-50 font-medium text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50 hover:bg-zinc-50/90 dark:hover:bg-zinc-800/90">
                                        <TableCell colSpan={isBelowSm ? 1 : invoice.status === 0 ? 6 : 5} className="sm:text-right">Diskon</TableCell>
                                        <TableCell className="text-right">
                                            <EditText
                                                readonly={invoice.status === 1 ? true : false}
                                                placeholder="0"
                                                type="number"
                                                value={String(invoice.discount)}
                                                inputClassName="flex h-9 w-full items-center justify-center rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300"
                                                onChange={(e) => {
                                                    const newValue = Number(e.target.value);
                                                    if (newValue >= 0)
                                                        setInvoice(prevInvoice => {
                                                            if (!prevInvoice) return prevInvoice;
                                                            return { ...prevInvoice, discount: newValue };
                                                        });
                                                }}
                                                formatDisplayText={(value) => `${currencyFormatter(Number(value))}`}
                                            />
                                        </TableCell>
                                        {!isBelowSm && (<TableCell />)}
                                    </TableRow>
                                    <TableRow className="bg-zinc-50 font-medium text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50 hover:bg-zinc-50/90 dark:hover:bg-zinc-800/90">
                                        <TableCell colSpan={isBelowSm ? 1 : invoice.status === 0 ? 6 : 5} className="sm:text-right">Pajak (%)</TableCell>
                                        <TableCell className="text-right">
                                            <EditText
                                                readonly={invoice.status === 1 ? true : false}
                                                placeholder="0"
                                                type="number"
                                                value={String(invoice.tax)}
                                                inputClassName="flex h-9 w-full items-center justify-center rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300"
                                                onChange={(e) => {
                                                    const newValue = Number(e.target.value);
                                                    if (newValue >= 0)
                                                        setInvoice(prevInvoice => {
                                                            if (!prevInvoice) return prevInvoice;
                                                            return { ...prevInvoice, tax: newValue };
                                                        });
                                                }}
                                                formatDisplayText={(value) => `${value}%`}
                                            />
                                        </TableCell>
                                        {!isBelowSm && (<TableCell />)}
                                    </TableRow>
                                    <TableRow className="bg-zinc-50 font-medium text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50 hover:bg-zinc-50/90 dark:hover:bg-zinc-800/90">
                                        <TableCell colSpan={isBelowSm ? 1 : invoice.status === 0 ? 6 : 5} className="sm:text-right">Pajak</TableCell>
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
                                        {!isBelowSm && (<TableCell />)}
                                    </TableRow>
                                    <TableRow>
                                        <TableCell colSpan={isBelowSm ? 1 : invoice.status === 0 ? 6 : 5}>Total</TableCell>
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
                                        {!isBelowSm && (<TableCell />)}
                                    </TableRow>
                                </TableFooter>
                            </Table>

                            <div className="space-y-4 mt-4">
                                <div className="space-y-3">
                                    <p className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Catatan Pembelian</p>
                                    <Textarea placeholder="Catatan Pembelian"
                                        readOnly={invoice.status === 1}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-3">
                                    {(invoice?.status === 0 || (invoice?.status === 1 && invoice.images.length > 0)) && (
                                        <p className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Lampiran</p>
                                    )}
                                    <Dropzone
                                        disabled={invoice?.status === 1 ? true : false}
                                        allowMultiple
                                        multipleImages={existingImages}
                                        onImagesChange={(images) => {
                                            setSelectedImages(images);
                                        }}
                                        onExistingImagesChange={(images) => {
                                            setExistingImages(images);
                                        }}
                                        maxFiles={20 - existingImages.length - selectedImages.length}
                                    />
                                </div>
                            </div>
                        </form>
                    </Form>) : null}
                {(invoice.status = 1) ?
                    (<div>
                        {
                            invoice?.status === 1 && (
                                <div className="flex justify-end">
                                    <InvoiceDownloader id={invoice?.id}>
                                        <Button size='icon'>
                                            {<DownloadIcon size={18} />}
                                        </Button>
                                    </InvoiceDownloader>
                                </div>
                            )
                        }
                        <div className="w-full px-6 py-8 flex justify-center">
                            <div className="flex flex-col justify-between w-full">
                                <div>
                                    <div className="flex flex-row gap-8 items-center justify-between dark:text-zinc-50">
                                        {/* company name from env */}
                                        <div>
                                            <div className="relative w-20 h-20 mb-4 block sm:hidden">
                                                <Image
                                                    src="/logo.png"
                                                    layout="fill"
                                                    objectFit='contain'
                                                    objectPosition='center'
                                                    unoptimized
                                                    alt="Logo" />
                                            </div>
                                            <h1 className="text-2xl font-bold">PT. INDOKA SURYA JAYA</h1>
                                            <p className="text-sm max-w-[80%]">Jl. Letda Reta No.19, Dangin Puri Klod, Kec. Denpasar Tim., Kota Denpasar, Bali 80232</p>
                                            <p className="text-sm">Telp: +6281000000 | Email: hello@indokasuryajaya.com</p>
                                        </div>
                                        <div className="relative w-20 h-20 hidden sm:block">
                                            <Image
                                                src="/logo.png"
                                                layout="fill"
                                                objectFit='contain'
                                                objectPosition='center'
                                                unoptimized
                                                alt="Logo" />
                                        </div>
                                    </div>
                                    <Separator className="my-4" />
                                    <div className="flex flex-row justify-between gap-8 dark:text-zinc-50">
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
                                                        <TableCell className="font-medium dark:text-zinc-50">{item.product?.name}</TableCell>
                                                        <TableCell className="dark:text-zinc-50">{item.category?.name}</TableCell>
                                                        <TableCell className="dark:text-zinc-50">{(item.quantity).toString()}</TableCell>
                                                        <TableCell className="dark:text-zinc-50">{(item.unit_price).toString()}</TableCell>
                                                        <TableCell className="text-right dark:text-zinc-50">{item.description}</TableCell>
                                                        {invoice.status === 1 && (<TableCell className="text-right dark:text-zinc-50">{item.expiry_date && format(item.expiry_date, "PPP", { locale: idLocale })}</TableCell>)}
                                                        <TableCell className="text-right dark:text-zinc-50">{currencyFormatter(item.total_price)}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                            <TableFooter>
                                                <TableRow className="bg-zinc-50 font-medium text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50 hover:bg-zinc-50/90 dark:hover:bg-zinc-800/90">
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
                                                <TableRow className="bg-zinc-50 font-medium text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50 hover:bg-zinc-50/90 dark:hover:bg-zinc-800/90">
                                                    <TableCell colSpan={invoice.status === 1 ? 6 : 5} className="sm:text-right">Diskon</TableCell>
                                                    <TableCell className="text-right">{currencyFormatter(Number(invoice.discount))}</TableCell>
                                                </TableRow>
                                                <TableRow className="bg-zinc-50 font-medium text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50 hover:bg-zinc-50/90 dark:hover:bg-zinc-800/90">
                                                    <TableCell colSpan={invoice.status === 1 ? 6 : 5} className="sm:text-right">Pajak (%)</TableCell>
                                                    <TableCell className="text-right">{invoice.tax}%</TableCell>
                                                </TableRow>
                                                <TableRow className="bg-zinc-50 font-medium text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50 hover:bg-zinc-50/90 dark:hover:bg-zinc-800/90">
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
                                                <TableRow>
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
                                        <div className="flex flex-row justify-between mt-4 dark:text-zinc-50">
                                            <div>
                                                <p className="text-sm">Pembayaran:</p>
                                                <p className="text-sm">PT. Indoka Surya Jaya</p>
                                                <p className="text-sm">5748377838 (Bank Central Asia)</p>
                                                <div className="space-y-3 mt-8">
                                                    <p className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Catatan Pembelian:</p>
                                                    <p className="text-sm font-normal">{invoice.description}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div></div>) : null}
                <CustomAlertDialog
                    open={alert}
                    onOpenChange={setAlert}
                    title={alertTitle}
                    description={alertDescription}
                    onContinue={alertContinueAction}
                />
            </ContentLayout>
        </AppLayout >
    )
}

export default withProtected(InvoicePage)
