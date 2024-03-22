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
import { Save } from 'lucide-react'
import ContentLayout from '@/components/Layouts/ContentLayout'
import { useBreakpoint } from "@/hooks/useBreakpoint"

import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import axios from '@/lib/axios'
import { toast } from '@/components/ui/use-toast'

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
import Dropzone, { CustomFile } from "@/components/ImageUploadHelpers/Dropzone"
import { CategoryCombobox } from "@/components/Combobox/CategoryCombobox"
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
import { Badge } from "@/components/ui/badge"

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

const NewInvoicePage = () => {
    const { can } = useAuth({ middleware: 'auth' })
    const router = useRouter()

    if (!can('create invoices')) {
        router.push('/dashboard')
        return <></>
    }

    const title = 'Penjualan Baru'
    const { isBelowXs } = useBreakpoint('xs')
    const { isBelowSm } = useBreakpoint('sm')


    const [alert, setAlert] = useState(false)
    const [alertTitle, setAlertTitle] = useState<string>("")
    const [alertDescription, setAlertDescription] = useState<string>("")
    const [alertContinueAction, setAlertContinueAction] = useState(() => {
        return () => { };
    });

    const [invoiceItems, setInvoiceItems] = useState<IInvoiceItem[]>([])
    const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [existingImages, setExistingImages] = useState<IImage[]>([])
    const [selectedImages, setSelectedImages] = useState<CustomFile[]>([]);
    const [scannerType, setScannerType] = useState<"BAR" | "QR">("BAR");

    const form = useForm<z.infer<typeof invoiceFormSchema>>({
        resolver: zodResolver(invoiceFormSchema),
    })

    useEffect(() => {
        form.setValue("date", new Date())
    }, [])

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
                        description: error.response?.data.errors,
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

        formData.append('status', "0");
        formData.append('date', format(values.date, 'yyyy-MM-dd'));
        formData.append('invoice_number', values.invoice_number);
        formData.append('customer_id', String(values.customerId));

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
                url: '/api/v1/invoices/',
                data: formData,
            })

            if (response) {
                toast({
                    variant: 'success',
                    title: 'Sukses',
                    description: `Data penjualan ${values.invoice_number} telah berhasil disimpan.`,
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
                id: newProduct.id,
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

    useEffect(() => {
        axios.post(`/api/v1/invoices/invoice-number/generate`).then((res) => {
            form.setValue("invoice_number", res.data.data)
        })
    }, [])

    return (
        <AppLayout
            title={title}
            headerAction={
                <div className="flex flex-row space-x-2">
                    <Button onClick={form.handleSubmit(onSubmit)} size="sm" className={`uppercase ${isBelowXs ? 'px-2' : ''}`}>
                        {isBelowXs ? <Save size={18} /> : 'Simpan'}
                    </Button>
                </div>
            }
        >
            <ContentLayout className="my-0 sm:my-12 px-6 py-8 sm:mx-6 lg:mx-8 overflow-hidden">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="flex flex-col gap-4 overflow-scroll">
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
                                        <TableHead>Aksi</TableHead>
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
                                                <TableHead className="gap-2">Stok  {item.quantity > item.product.stock && (<><Badge variant="warning" className="w-auto px-1">Low Stock</Badge></>)}</TableHead>
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
                                                                        {...field}
                                                                        type="number"
                                                                        step={1}
                                                                        min={1}
                                                                        placeholder="Kuantitas"
                                                                        width={80}
                                                                        value={(item.quantity).toString()}
                                                                        className={item.quantity > item.product.stock ? `border-yellow-300 bg-yellow-100` : ''}
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
                                        </TableBody>
                                    ))}
                                </>
                            ) : (
                                <TableBody>
                                    {invoiceItems.map((item, index) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.product.name}</TableCell>
                                            <TableCell>{item.category.name}</TableCell>
                                            <TableCell className="gap-2">{item.product?.stock} {item.quantity > item.product.stock && (<><Badge variant="warning" className="w-auto px-1">Low Stock</Badge></>)}</TableCell>
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
                                                                    inline />
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
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </TableCell>
                                            <TableCell className="text-right">{currencyFormatter(item.total_price)}</TableCell>
                                            <TableCell>
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
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            )}
                            <TableFooter>
                                <TableRow>
                                    <TableCell colSpan={isBelowSm ? 1 : 6}>Total</TableCell>
                                    <TableCell className="text-right">{currencyFormatter(invoiceItems.reduce((acc, item) => acc + item.total_price, 0))}</TableCell>
                                    {!isBelowSm && (<TableCell />)}
                                </TableRow>
                            </TableFooter>
                        </Table>

                        <div className="space-y-3">
                            <Dropzone
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
                    </form>
                </Form>
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

export default withProtected(NewInvoicePage)
