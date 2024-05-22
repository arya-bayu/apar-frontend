import React, {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useEffect,
  useState,
} from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import axios from '@/lib/axios'
import { toast } from '@/components/ui/use-toast'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { AxiosError } from 'axios'
import { IProduct } from '@/types/product'
import { KeyedMutator } from 'swr'
import { DataTable } from '@/components/ui/data-table'
import Dropzone, { CustomFile } from "@/components/ImageUploadHelpers/Dropzone"
import { SupplierCombobox } from "@/components/Combobox/SupplierCombobox"
import { CategoryCombobox } from "@/components/Combobox/CategoryCombobox"
import { IImage } from "@/types/image"
import { ScannerDrawerDialog } from "@/components/ScannerDrawerDialog"
import { UnitCombobox } from "@/components/Combobox/UnitCombobox"
import { Loader2, RefreshCcw } from "lucide-react"
import RichTextEditor from "@/components/TextEditor"

interface IProductDialog<TData> {
  data?: DataTable<TData>
  id?: number
  mutate?: KeyedMutator<any>
  setDisabledContextMenu?: Dispatch<SetStateAction<boolean | undefined>>
}

const productFormSchema = z.object({
  name: z.string(),
  serial_number: z.string(),
  description: z.string(),
  stock: z
    .coerce
    .number(),
  price: z
    .coerce
    .number()
    .nullable(),
  expiry_period: z
    .coerce
    .number()
    .nullable(),
  unitId: z
    .coerce
    .number({
      required_error: "Pilih unit produk.",
      invalid_type_error: "Pilih unit produk.",
    })
    .nullable(),
  supplierId: z
    .coerce
    .number({
      required_error: "Pilih supplier produk.",
      invalid_type_error: "Pilih supplier produk.",
    })
    .nullable(),
  categoryId: z
    .coerce
    .number({
      required_error: "Pilih kategori produk.",
      invalid_type_error: "Pilih kategori produk.",
    })
    .nullable(),
})

export default function ProductDialog({
  id,
  mutate,
  children,
  setDisabledContextMenu,
}: PropsWithChildren<IProductDialog<IProduct>>) {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [open, setOpen] = useState(false)
  const [product, setProduct] = useState<IProduct>()
  const [selectedPeriod, setSelectedPeriod] = useState<"Bulan" | "Tahun">("Bulan")
  const [existingImages, setExistingImages] = useState<IImage[]>([])
  const [selectedImages, setSelectedImages] = useState<CustomFile[]>([]);
  const [scannerType, setScannerType] = useState<"BAR" | "QR">("BAR");

  useEffect(() => {
    setDisabledContextMenu && setDisabledContextMenu(open)
  }, [open])

  const form = useForm<z.infer<typeof productFormSchema>>({
    resolver: zodResolver(productFormSchema),
  })

  useEffect(() => {
    if (!open || !id) return

    async function fetchProduct() {
      try {
        const response = await axios.get(`/api/v1/products/${id}`)
        setProduct(response.data.data)
      } catch (error) {
        if (error instanceof AxiosError)
          toast({
            variant: 'destructive',
            title: 'Terjadi kesalahan',
            description: error.response?.data.errors,
          })
      }
    }

    fetchProduct()
  }, [id, open])

  const generateSerialNumber = async () => {
    try {
      const response = await axios.post('/api/v1/products/serial-number/generate');
      if (response.data.code === 200) {
        form.setValue("serial_number", response.data.data);
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        toast({
          variant: 'destructive',
          title: 'Terjadi kesalahan',
          description: error.response?.data.errors,
        })
      }
    }
  };

  useEffect(() => {
    form.reset({
      name: product?.name ?? '',
      serial_number: product?.serial_number ?? '',
      description: product?.description ?? '',
      stock: product?.stock ?? 0,
      price: product?.price ?? null,
      expiry_period: product?.expiry_period ?? null,
      unitId: product?.unit_id ?? null,
      supplierId: product?.supplier_id ?? null,
      categoryId: product?.category_id ?? null,
    })

    !product?.serial_number && generateSerialNumber()

    setSelectedImages([])
    setExistingImages(product?.images ?? [])
    setSelectedPeriod("Bulan")

  }, [product])


  useEffect(() => {
    if (form.formState.isSubmitSuccessful) {
      form.reset()
    }
  }, [form.formState, form.reset])

  const uploadImages = async (selectedImages: CustomFile[]) => {
    const images = [];

    for (const image of selectedImages) {
      const formData = new FormData();
      formData.append('image', image);

      try {
        const response = await axios({
          method: 'post',
          url: '/api/v1/products/image/',
          data: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        images.push(response.data.data);
      } catch (error) {
        if (error instanceof AxiosError) {
          console.log(error)
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

  const onSubmit = async (values: z.infer<typeof productFormSchema>) => {
    if (!mutate) return

    const formData = new FormData();

    product && formData.append('_method', 'put')
    formData.append('status', "1");
    formData.append('name', values.name);
    formData.append('serial_number', values.serial_number);
    formData.append('description', values.description);
    formData.append('price', String(values.price));
    { values.expiry_period && formData.append('expiry_period', String(selectedPeriod === 'Bulan' ? values.expiry_period : values.expiry_period && values.expiry_period * 12)) };
    formData.append('unit_id', String(values.unitId));
    formData.append('supplier_id', String(values.supplierId));
    formData.append('category_id', String(values.categoryId));

    // append existing image
    existingImages.forEach((image, index) => {
      formData.append(`images[${index}]`, String(image.id));
    })

    selectedImages && await uploadImages(selectedImages).then((images) => {
      images.forEach((image, index) => {
        formData.append(`images[${index + existingImages.length}]`, String(image.id));
      })
    })

    const url = product
      ? `/api/v1/products/${product?.id}` // update
      : '/api/v1/products/' // create

    try {
      const response = await axios({
        method: 'post',
        url: url,
        data: formData,
      })

      mutate()

      if (response) {
        setOpen(false)
        toast({
          variant: 'success',
          title: 'Sukses',
          description: `Data produk ${values.name} telah berhasil ${product ? 'diperbarui' : 'disimpan'
            }.`,
        })
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
          if (errors.name) {
            form.setError('name', {
              type: 'server',
              message: errors.name,
            })
          }
          if (errors.serial_number) {
            form.setError('serial_number', {
              type: 'server',
              message: errors.serial_number,
            })
          }
          if (errors.description) {
            form.setError('description', {
              type: 'server',
              message: errors.description,
            })
          }
          if (errors.price) {
            form.setError('price', {
              type: 'server',
              message: errors.price,
            })
          }
          if (errors.unitId) {
            form.setError('unitId', {
              type: 'server',
              message: errors.unitId,
            })
          }
          if (errors.supplierId) {
            form.setError('supplierId', {
              type: 'server',
              message: errors.supplierId,
            })
          }
          if (errors.categoryId) {
            form.setError('categoryId', {
              type: 'server',
              message: errors.categoryId,
            })
          }
          if (errors.expiry_period) {
            form.setError('expiry_period', {
              type: 'server',
              message: errors.expiry_period
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


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh)] supports-[max-height:100svh]:max-h-[calc(100svh)] supports-[max-height:100cqh]:max-h-[calc(100cqh)]md:max-h-[calc(90dvh)] overflow-y-scroll sm:max-w-3xl">
        <DialogHeader className="space-y-2">
          <DialogTitle>{product ? 'Edit' : 'Tambah'} produk</DialogTitle>
          <DialogDescription>
            {product ? 'Edit' : 'Tambah'} data produk{' '}
            {product ? 'yang sudah tersimpan di' : 'ke'} database sistem
            inventaris {process.env.NEXT_PUBLIC_APP_NAME}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4">
            <div className="space-y-3">
              <Dropzone
                required
                allowMultiple
                multipleImages={existingImages}
                onImagesChange={(images) => {
                  setSelectedImages(images);
                }}
                onExistingImagesChange={(images) => {
                  setExistingImages(images);
                }}
                maxFiles={12 - existingImages.length - selectedImages.length}
              />
            </div>
            <FormField
              control={form.control}
              name="serial_number"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Serial Number</FormLabel>
                  <div className="flex flex-row justify-between space-x-4">
                    <FormControl>
                      <Input
                        placeholder="Kode S/N Produk"
                        {...field}
                        required
                      />
                    </FormControl>
                    <Button
                      onClick={() => generateSerialNumber()}
                      type="button"
                      variant="secondary"
                      className="aspect-square px-2 py-0">
                      <RefreshCcw size={20} />
                    </Button>
                    <ScannerDrawerDialog
                      scannerType={scannerType}
                      onScanResult={(res: string) => {
                        if (res) {
                          form.setValue("serial_number", res);
                        }
                      }}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nama Produk"
                      {...field}
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem className='w-full'>
                  <FormLabel>Harga</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      min={0}
                      placeholder="Harga Produk"
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-row justify-between space-x-4">
              {id && (
                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem className="w-1/2">
                      <FormLabel>Stok</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          min={0}
                          placeholder="Stok Produk"
                          disabled
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="unitId"
                render={({ field }) => (
                  <FormItem className={`md:mt-0 ${id ? 'w-1/2' : 'w-full'}`}>
                    <FormLabel>Unit</FormLabel>
                    <FormControl>
                      <UnitCombobox
                        value={field.value}
                        onSelect={(unitId) => {
                          form.setValue("unitId", unitId);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi</FormLabel>
                  <FormControl>
                    {/* <Textarea
                      rows={5}
                      placeholder="Deskripsi Produk"
                      {...field}
                      required
                    /> */}
                    <RichTextEditor {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="w-full flex flex-col md:flex-row md:justify-between md:gap-x-4 gap-4 md:space-y-0">
              <FormField
                control={form.control}
                name="supplierId"
                render={({ field }) => (
                  <FormItem className="w-full md:w-1/2 md:mt-0">
                    <FormLabel>Supplier</FormLabel>
                    <FormControl>
                      <SupplierCombobox
                        value={field.value ?? null}
                        onSelect={(supplierId) => {
                          form.setValue("supplierId", supplierId);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem className="w-full md:w-1/2 md:mt-0">
                    <FormLabel>Kategori</FormLabel>
                    <FormControl>
                      <CategoryCombobox
                        value={field.value}
                        onSelect={(categoryId) => {
                          form.setValue("categoryId", categoryId);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="expiry_period"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Periode Kedaluwarsa</FormLabel>
                  <div className="flex flex-row justify-between space-x-4">
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        type="number"
                        step={1}
                        min={0}
                        placeholder={`Periode Kedaluwarsa (${selectedPeriod})`}
                      />
                    </FormControl>
                    <Select
                      defaultValue="Bulan"
                      onValueChange={(value: "Bulan" | "Tahun") => setSelectedPeriod(value)}
                      required
                    >
                      <SelectTrigger id="periode" className="w-[25%]">
                        <SelectValue placeholder="Periode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Periode</SelectLabel>
                          <SelectItem key="0" value="Bulan">
                            Bulan
                          </SelectItem>
                          <SelectItem key="1" value="Tahun">
                            Tahun
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="mt-4 h-10">
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
                className="w-full text-sm"
                type="submit"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog >
  )
}
