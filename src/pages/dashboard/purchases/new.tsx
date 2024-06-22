import React, {
    useEffect,
    useState,
} from 'react'

import { useAuth } from '@/hooks/useAuth'

import _, { set } from 'lodash'
import AppLayout from '@/components/Layouts/AppLayout'
import { Button } from '@/components/ui/button'
import withProtected from '@/hoc/withProtected'
import { useRouter } from 'next/router'
import { ArrowLeft, Loader2, Save, ScanLine } from 'lucide-react'
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
import { SupplierCombobox } from "@/components/Combobox/SupplierCombobox"
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
import { IPurchaseItem } from "@/types/purchaseItem"
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
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"

const purchaseFormSchema = z.object({
    purchase_number: z.string(),
    date: z
        .coerce
        .date(),
    supplierId: z
        .coerce
        .number({
            required_error: "Pilih supplier produk.",
            invalid_type_error: "Pilih supplier produk.",
        }),
})

const NewPurchasePage = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const { can } = useAuth({ middleware: 'auth' })
    const router = useRouter()

    if (!can('create purchases')) {
        router.push('/dashboard')
        return <></>
    }

    const title = 'Pembelian Baru'
    const { isBelowSm } = useBreakpoint('sm')


    const [alert, setAlert] = useState(false)
    const [alertTitle, setAlertTitle] = useState<string>("")
    const [alertDescription, setAlertDescription] = useState<string>("")
    const [alertContinueAction, setAlertContinueAction] = useState(() => {
        return () => { };
    });

    const [purchaseItems, setPurchaseItems] = useState<IPurchaseItem[]>([])
    const [selectedProductId, setSelectedProductId] = useState<number | undefined>(undefined);
    const [selectedSupplierId, setSelectedSupplierId] = useState<number | undefined>(undefined);
    const [discount, setDiscount] = useState('0')
    const [taxPercentage, setTaxPercentage] = useState('0')
    const [description, setDescription] = useState('')
    const [selectedImages, setSelectedImages] = useState<CustomFile[]>([]);
    const [scannerType, setScannerType] = useState<"BAR" | "QR">("BAR");
    const [isFetchingBarcode, setIsFetchingBarcode] = useState<boolean>(false);
    const [isFetchingProduct, setIsFetchingProduct] = useState<boolean>(false);

    const form = useForm<z.infer<typeof purchaseFormSchema>>({
        resolver: zodResolver(purchaseFormSchema),
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
                    url: '/api/v1/purchases/image/',
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

    const onSubmit = async (values: z.infer<typeof purchaseFormSchema>) => {
        if (purchaseItems.length === 0) {
            toast({
                variant: 'destructive',
                title: 'Daftar pembelian kosong!',
                description: 'Anda belum melakukan input data barang yang dibeli',
            })
            return;
        }

        const formData = new FormData();

        formData.append('status', "0");
        formData.append('date', format(values.date, 'yyyy-MM-dd'));
        formData.append('purchase_number', values.purchase_number);
        formData.append('supplier_id', String(values.supplierId));
        formData.append('discount', discount);
        formData.append('tax', taxPercentage);
        formData.append('description', description);

        selectedImages && await uploadImages(selectedImages).then((images) => {
            images.forEach((image, index) => {
                formData.append(`images[${index}]`, String(image.id));
            })
        })

        purchaseItems.forEach((item, index) => {
            formData.append(`purchase_items[${index}][category_id]`, String(item.product.category_id));
            formData.append(`purchase_items[${index}][product_id]`, String(item.product.id));
            formData.append(`purchase_items[${index}][unit_price]`, String(item.unit_price));
            formData.append(`purchase_items[${index}][quantity]`, String(item.quantity));
            if (item.description) {
                formData.append(`purchase_items[${index}][description]`, String(item.description));
            }
        });

        try {
            const response = await axios({
                method: 'post',
                url: '/api/v1/purchases/',
                data: formData,
            })

            if (response) {
                toast({
                    variant: 'success',
                    title: 'Sukses',
                    description: `Data pembelian ${values.purchase_number} telah berhasil disimpan.`,
                })
                router.push('/dashboard/purchases')
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
                    if (errors.purchase_number) {
                        form.setError('purchase_number', {
                            type: 'server',
                            message: errors.purchase_number,
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

    const addPurchaseItem = async (id: IProduct["id"]) => {
        if (purchaseItems.some((item) => item.product_id === id)) {
            toast({
                variant: 'destructive',
                title: 'Gagal',
                description: 'Produk telah dimasukkan ke pembelian ini.',
            })
            return
        }
        try {
            const response = await axios.get('api/v1/products/' + id)
            const newProduct: IProduct = response.data.data


            if (!selectedSupplierId) {
                form.setValue("supplierId", newProduct.supplier_id);
                setSelectedSupplierId(newProduct.supplier_id)
            } else if (newProduct.supplier_id !== selectedSupplierId) {
                toast({
                    variant: 'destructive',
                    title: 'Gagal',
                    description: 'Produk tidak tersedia pada supplier yang dipilih.',
                })
                return
            }

            const newPurchaseItem: IPurchaseItem = {
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
            setPurchaseItems([...purchaseItems, newPurchaseItem])
        } catch (error) {
            if (error instanceof AxiosError)
                toast({
                    variant: 'destructive',
                    title: 'Terjadi kesalahan',
                    description: error.response?.data.errors,
                })
        }
    }

    useEffect(() => {
        axios.post(`/api/v1/purchases/po-number/generate`).then((res) => {
            form.setValue("purchase_number", res.data.data)
        })
    }, [])

    return (
        <AppLayout
            title={title}
            headerAction={
                <div className="flex flex-row space-x-2 ml-4">
                    <Link href={`/dashboard/purchases`}>
                        <Button variant="outline" className={`uppercase ${isBelowSm ? 'px-2' : ''}`}>
                            {isBelowSm ? <ArrowLeft size={15} /> : 'Kembali'}
                        </Button>
                    </Link>
                    <Button
                        disabled={isLoading}
                        onClick={async () => {
                            setIsLoading(true);
                            try {
                                await form.handleSubmit(onSubmit)();
                            } finally {
                                setIsLoading(false);
                            }
                        }}
                        size="sm"
                        className={`uppercase ${isBelowSm ? 'px-2' : ''}`}
                        type="submit">
                        {isLoading ? (
                            isBelowSm
                                ? <Loader2 className="h-4 w-4 animate-spin" />
                                : <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Menyimpan...
                                </>
                        ) : (
                            isBelowSm
                                ? <Save size={18} />
                                : 'Simpan'
                        )}
                    </Button>
                </div>
            }
        >
            <ContentLayout className="my-0 sm:my-12 sm:mx-6 lg:mx-8 overflow-hidden">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="flex flex-col gap-4 overflow-scroll px-6 py-8 ">
                        <div className="flex flex-col md:flex-row  items-center gap-4">
                            <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col w-full">
                                        <FormLabel className="mt-1 mb-2">Tanggal Pembelian</FormLabel>
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
                                name="purchase_number"
                                render={({ field }) => (
                                    <FormItem className="w-full">
                                        <FormLabel>No. Pembelian</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="Nomor Pembelian"
                                                required
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="supplierId"
                                render={({ field }) => (
                                    <FormItem className="w-full md:mt-0">
                                        <FormLabel>Supplier</FormLabel>
                                        <FormControl>
                                            <SupplierCombobox
                                                value={field.value ?? null}
                                                onSelect={(supplierId) => {
                                                    if (selectedSupplierId) {
                                                        if (selectedSupplierId !== supplierId && purchaseItems.length > 0) {
                                                            setAlertTitle("Peringatan")
                                                            setAlertDescription("Mengganti data supplier akan menghapus seluruh data pembelian produk yang sudah terinput pada tabel.")
                                                            setAlertContinueAction(() => {
                                                                return () => {
                                                                    setSelectedProductId(undefined);
                                                                    form.setValue("supplierId", supplierId);
                                                                    setSelectedSupplierId(supplierId);
                                                                    setPurchaseItems([]);
                                                                }
                                                            })
                                                            setAlert(true)
                                                        } else {
                                                            setSelectedProductId(undefined)
                                                            form.setValue("supplierId", supplierId);
                                                            setSelectedSupplierId(supplierId);
                                                        }
                                                    } else {
                                                        setSelectedProductId(undefined)
                                                        form.setValue("supplierId", supplierId);
                                                        setSelectedSupplierId(supplierId);
                                                    }

                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="w-full flex flex-row items-end gap-2 md:gap-4">
                            <div className="w-full min-w-0">
                                <FormField
                                    name="productId"
                                    render={() => (
                                        <FormItem>
                                            <FormLabel>Produk</FormLabel>
                                            <FormControl>
                                                <ProductCombobox
                                                    supplierId={selectedSupplierId ?? undefined}
                                                    value={selectedProductId ?? 0}
                                                    onSelect={(productId, supplierId) => {
                                                        if (selectedSupplierId === undefined && supplierId) {
                                                            form.setValue("supplierId", supplierId);
                                                            setSelectedSupplierId(supplierId);
                                                        }
                                                        setSelectedProductId(productId);
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <ScannerDrawerDialog
                                scannerType={scannerType}
                                onScanResult={(res: string) => {
                                    if (res) {
                                        setIsFetchingBarcode(true)
                                        try {
                                            axios.get(`/api/v1/products/serial-number/${res}`).then((res) => {
                                                if (res.data.code === 200) {
                                                    addPurchaseItem(res.data.data.id)
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
                                        } finally {
                                            setIsFetchingBarcode(false)
                                        }
                                    }

                                }}>
                                <Button
                                    disabled={isFetchingBarcode}
                                    type="button"
                                    variant="secondary"
                                    className="aspect-square px-2 py-0">
                                    {isFetchingBarcode ? <Loader2 className="animate-spin h-5 w-5" /> : <ScanLine size={20} />}
                                </Button>
                            </ScannerDrawerDialog>

                            <Button
                                disabled={isFetchingProduct}
                                onClick={async () => {
                                    setIsFetchingProduct(true)
                                    try {
                                        selectedProductId && await addPurchaseItem(selectedProductId)
                                    } finally {
                                        setIsFetchingProduct(false)
                                    }
                                }
                                }
                                type="button"
                                className="aspect-square px-2 py-0">
                                {isFetchingProduct ? <Loader2 className="animate-spin h-5 w-5" /> : <Plus size={20} />}
                            </Button>
                        </div>

                        {/* data table */}
                        <Table>
                            {!isBelowSm && (
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nama</TableHead>
                                        <TableHead>Kategori</TableHead>
                                        <TableHead>Qty</TableHead>
                                        <TableHead>Harga</TableHead>
                                        <TableHead className="text-right">Note</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                            )}
                            {isBelowSm ? (
                                <>

                                    {purchaseItems.map((item, index) => (
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
                                                <TableCell className="font-medium"><p className="line-clamp-2">{item.product.name}</p></TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableHead>Kategori</TableHead>
                                                <TableCell className="font-medium">{item.category.name}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableHead>Qty</TableHead>
                                                <TableCell>
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
                                                                        max={9999999999}
                                                                        placeholder="Kuantitas"
                                                                        width={80}
                                                                        value={(item.quantity).toString()}
                                                                        onChange={(event) => {
                                                                            const maxValue = 9999999999 // 10 digit
                                                                            let newValue = Number(event.target.value);
                                                                            if (newValue > maxValue) {
                                                                                newValue = maxValue
                                                                            }
                                                                            const updatedItems = [...purchaseItems];
                                                                            updatedItems[index] = {
                                                                                ...updatedItems[index],
                                                                                quantity: newValue,
                                                                                total_price: newValue * item.unit_price
                                                                            };
                                                                            setPurchaseItems(updatedItems);
                                                                        }}
                                                                        onBlur={(e) => {
                                                                            if (Number(e.target.value) < 1) {
                                                                                const updatedItems = [...purchaseItems];
                                                                                updatedItems[index] = {
                                                                                    ...updatedItems[index],
                                                                                    quantity: 1,
                                                                                    total_price: 1 * item.unit_price
                                                                                };
                                                                                setPurchaseItems(updatedItems);
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
                                                <TableCell>
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
                                                                            const maxValue = 9999999999 // 10 digit
                                                                            let newValue = Number(event.target.value);
                                                                            if (newValue > maxValue) {
                                                                                newValue = maxValue
                                                                            }
                                                                            const updatedItems = [...purchaseItems];
                                                                            updatedItems[index] = {
                                                                                ...updatedItems[index],
                                                                                unit_price: newValue,
                                                                                total_price: item.quantity * newValue
                                                                            };
                                                                            setPurchaseItems(updatedItems);
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

                                                <TableCell>
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
                                                                            const updatedItems = [...purchaseItems];
                                                                            updatedItems[index] = {
                                                                                ...updatedItems[index],
                                                                                description: newValue,
                                                                            };
                                                                            setPurchaseItems(updatedItems);
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
                                                <TableCell className="font-medium text-end"><p className="break-all">{currencyFormatter(item.total_price)}</p></TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell colSpan={2} className="text-right">
                                                    <Button
                                                        variant="destructive"
                                                        className="w-full"
                                                        onClick={() => {
                                                            const updatedItems = purchaseItems.filter((product) => product.id !== item.id);
                                                            setPurchaseItems(updatedItems);
                                                        }}>
                                                        <p className="line-clamp-2">Hapus {item.product.name}</p>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    ))}
                                </>
                            ) : (
                                <TableBody>
                                    {purchaseItems.map((item, index) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium"><p className="line-clamp-2">{item.product?.name}</p></TableCell>
                                            <TableCell>{item.category.name}</TableCell>
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
                                                                        const maxValue = 9999999999 // 10 digit
                                                                        let newValue = Number(event.target.value);
                                                                        if (newValue > maxValue) {
                                                                            newValue = maxValue
                                                                        }
                                                                        if (newValue >= 0) {
                                                                            const updatedItems = [...purchaseItems];
                                                                            updatedItems[index] = {
                                                                                ...updatedItems[index],
                                                                                quantity: newValue,
                                                                                total_price: newValue * item.unit_price
                                                                            };
                                                                            setPurchaseItems(updatedItems);
                                                                        }
                                                                    }}
                                                                    onSave={(e) => {
                                                                        if (Number(e.value) < 1) {
                                                                            const updatedItems = [...purchaseItems];
                                                                            updatedItems[index] = {
                                                                                ...updatedItems[index],
                                                                                quantity: Number(e.previousValue),
                                                                                total_price: Number(e.previousValue) * item.unit_price
                                                                            };
                                                                            setPurchaseItems(updatedItems);
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
                                                                        const maxValue = 9999999999 // 10 digit
                                                                        let newValue = Number(event.target.value);
                                                                        if (newValue > maxValue) {
                                                                            newValue = maxValue
                                                                        }
                                                                        if (newValue >= 0) {
                                                                            const updatedItems = [...purchaseItems];
                                                                            updatedItems[index] = {
                                                                                ...updatedItems[index],
                                                                                unit_price: newValue,
                                                                                total_price: item.quantity * newValue
                                                                            };
                                                                            setPurchaseItems(updatedItems);
                                                                        }
                                                                    }}
                                                                    formatDisplayText={(value) => `${currencyFormatter(Number(value))}`}
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
                                                                        const updatedItems = [...purchaseItems];
                                                                        updatedItems[index] = {
                                                                            ...updatedItems[index],
                                                                            description: newValue,
                                                                        };
                                                                        setPurchaseItems(updatedItems);
                                                                    }}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </TableCell>
                                            <TableCell className="text-right">{currencyFormatter(item.total_price)}</TableCell>
                                            <TableCell className="text-center w-0">
                                                <Button
                                                    size="icon"
                                                    variant="outline"
                                                    className="relative"
                                                    onClick={() => {
                                                        const updatedItems = purchaseItems.filter((product) => product.id !== item.id);
                                                        setPurchaseItems(updatedItems);
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
                                <TableRow className="bg-zinc-50 font-medium text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50 hover:bg-zinc-50/90 dark:hover:bg-zinc-800/90">
                                    <TableCell colSpan={isBelowSm ? 1 : 5} className="sm:text-right">Subtotal</TableCell>
                                    <TableCell className="text-right">
                                        {
                                            currencyFormatter(
                                                Math.max(
                                                    purchaseItems.reduce((acc, item) => acc + item.total_price, 0),
                                                    0
                                                )
                                            )
                                        }
                                    </TableCell>
                                    {!isBelowSm && (<TableCell />)}
                                </TableRow>
                                <TableRow className="bg-zinc-50 font-medium text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50 hover:bg-zinc-50/90 dark:hover:bg-zinc-800/90">
                                    <TableCell colSpan={isBelowSm ? 1 : 5} className="sm:text-right">Diskon</TableCell>
                                    <TableCell className="text-right">
                                        <EditText
                                            placeholder="0"
                                            type="number"
                                            value={discount === '0' ? '' : discount}
                                            inputClassName="flex h-9 w-full items-center justify-center rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300"
                                            onChange={(e) => {
                                                if (Number(e.target.value) >= 0)
                                                    setDiscount(e.target.value)
                                            }}
                                            formatDisplayText={(value) => `${currencyFormatter(Number(value))}`}
                                        />
                                    </TableCell>
                                    {!isBelowSm && (<TableCell />)}
                                </TableRow>
                                <TableRow className="bg-zinc-50 font-medium text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50 hover:bg-zinc-50/90 dark:hover:bg-zinc-800/90">
                                    <TableCell colSpan={isBelowSm ? 1 : 5} className="sm:text-right">Pajak (%)</TableCell>
                                    <TableCell className="text-right">
                                        <EditText
                                            placeholder="0"
                                            type="number"
                                            value={taxPercentage === '0' ? '' : taxPercentage}
                                            inputClassName="flex h-9 w-full items-center justify-center rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300"
                                            onChange={(e) => {
                                                if (Number(e.target.value) >= 0)
                                                    setTaxPercentage(e.target.value)
                                            }}
                                            formatDisplayText={(value) => `${Number(value)}%`}
                                        />
                                    </TableCell>
                                    {!isBelowSm && (<TableCell />)}
                                </TableRow>
                                <TableRow className="bg-zinc-50 font-medium text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50 hover:bg-zinc-50/90 dark:hover:bg-zinc-800/90">
                                    <TableCell colSpan={isBelowSm ? 1 : 5} className="sm:text-right">Pajak</TableCell>
                                    <TableCell className="text-right">
                                        {
                                            currencyFormatter(
                                                Math.max(
                                                    (purchaseItems.reduce((acc, item) => acc + item.total_price, 0) - Number(discount)) * Number(taxPercentage) / 100,
                                                    0
                                                )
                                            )
                                        }
                                    </TableCell>
                                    {!isBelowSm && (<TableCell />)}
                                </TableRow>
                                <TableRow>
                                    <TableCell colSpan={isBelowSm ? 1 : 5}>Total</TableCell>
                                    <TableCell className="text-right">
                                        {
                                            currencyFormatter(
                                                Math.max(
                                                    purchaseItems.reduce((acc, item) => acc + item.total_price, 0) - Number(discount) + (purchaseItems.reduce((acc, item) => acc + item.total_price, 0) - Number(discount)) * Number(taxPercentage) / 100,
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
                                <Textarea placeholder="Catatan Pembelian" value={description} onChange={(e) => setDescription(e.target.value)} />
                            </div>
                            <div className="space-y-3">
                                <p className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Lampiran</p>
                                <Dropzone
                                    allowMultiple
                                    onImagesChange={(images) => {
                                        setSelectedImages(images);
                                    }}
                                    maxFiles={20 - selectedImages.length}
                                />
                            </div>
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

export default withProtected(NewPurchasePage)
