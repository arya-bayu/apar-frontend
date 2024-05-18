import React, {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useEffect,
  useState,
} from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useForm, useFieldArray } from 'react-hook-form'
import axios, { csrf } from '@/lib/axios'
import { toast } from '@/components/ui/use-toast'
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
import { ICategory } from '@/types/category'
import { KeyedMutator } from 'swr'
import { DataTable } from '@/components/ui/data-table'
import { IImage } from '@/types/image'
import LucideIconPicker from "@/components/IconPicker/LucideIconPicker"
import * as Lucide from 'lucide-react';
import Dropzone, { CustomFile } from "@/components/ImageUploadHelpers/Dropzone"

interface ICategoryDialog<TData> {
  data?: DataTable<TData>
  id?: number
  mutate?: KeyedMutator<any>
  setDisabledContextMenu?: Dispatch<SetStateAction<boolean | undefined>>
}

const categoryFormSchema = z.object({
  image: z.any().optional(),
  name: z.string(),
  description: z.string(),
  features: z.array(
    z
      .object({
        icon: z.string(),
        name: z.string(),
        description: z.string(),
      })
      .optional(),
  ),
})

export default function CategoryDialog({
  id,
  mutate,
  children,
  setDisabledContextMenu,
}: PropsWithChildren<ICategoryDialog<ICategory>>) {
  const [open, setOpen] = useState(false)
  const [category, setCategory] = useState<ICategory>()
  const [isPopoverOpen, setPopoverOpen] = useState<boolean[]>([false]);
  const [featureIcons, setFeatureIcons] = useState<string[]>([]);
  const [featureNames, setFeatureNames] = useState<string[]>([])
  const [bannerImage, setBannerImage] = useState<CustomFile>();

  const form = useForm<z.infer<typeof categoryFormSchema>>({
    resolver: zodResolver(categoryFormSchema),
  })

  const { control } = form

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'features',
  })

  const handleFeatureNameChange = (index: number, value: string) => {
    if (value.trim() !== '') {
      const updatedNames = [...featureNames]
      updatedNames[index] = value.trim()
      setFeatureNames(updatedNames)
    }
  }

  const handleFeatureRemove = (index: number) => {
    const updatedNames = [...featureNames]
    updatedNames.splice(index, 1)
    setFeatureNames(updatedNames)
    remove(index)
  }

  setDisabledContextMenu &&
    useEffect(() => {
      setDisabledContextMenu(open)
    }, [open])

  useEffect(() => {
    if (!open || !id) return

    async function fetchCategory() {
      try {
        const response = await axios.get(`/api/v1/categories/${id}`)
        setCategory(() => response.data.data)
      } catch (error) {
        if (error instanceof AxiosError)
          toast({
            variant: 'destructive',
            title: 'Terjadi kesalahan',
            description: error.response?.data.errors,
          })
      }
    }

    fetchCategory()
  }, [id, open])

  useEffect(() => {
    if (!open) return
    form.reset({
      name: category?.name ?? '',
      description: category?.description ?? '',
      features: category?.features ?? [],
      image: category?.image ?? undefined,
    })
  }, [open, category])

  useEffect(() => {
    if (form.formState.isSubmitSuccessful) {
      form.reset()
    }
  }, [form.formState, form.reset])

  const handleDeleteImage = async () => {
    if (!mutate) return

    await axios
      .delete(`api/v1/categories/image/${category?.image?.id}`)
      .then(() => {
        form.reset({
          image: undefined,
        })
      })


    mutate()
  }

  const onSubmit = async (values: z.infer<typeof categoryFormSchema>) => {
    if (!mutate) return

    if (!values.image && category?.image?.id) {
      handleDeleteImage();
    }

    let uploadedImage: IImage = values.image

    if (bannerImage) {
      const formData = new FormData()
      formData.append('image', bannerImage)

      try {
        const response = await axios({
          method: 'post',
          url: '/api/v1/categories/image/',
          data: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })

        uploadedImage = response.data.data
        form.setValue("image", uploadedImage)
      } catch (error) {
        if (error instanceof AxiosError) {
          toast({
            variant: 'destructive',
            title: 'Terjadi kesalahan',
            description: error.response?.data.errors,
          })
        }
        return;
      }
    }

    const formData = new FormData()

    category && formData.append('_method', 'put')
    formData.append('name', values.name)
    formData.append('description', values.description)

    if (uploadedImage) {
      formData.append('image', String(uploadedImage.id))
    }

    for (var i = 0; i < values.features.length; i++) {
      const feature = values.features[i]
      formData.append(`features[${i}][icon]`, featureIcons[i] ?? feature?.icon ?? 'Plus')
      formData.append(`features[${i}][name]`, feature?.name ?? '')
      formData.append(`features[${i}][description]`, feature?.description ?? '')
    }

    const url = category
      ? `/api/v1/categories/${category?.id}` // update
      : '/api/v1/categories/' // create

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
          description: `Data kategori ${values.name} telah berhasil ${category ? 'diperbarui' : 'disimpan'
            }.`,
        })
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        const errStatus = error.response?.status
        const errors = error.response?.data.errors
        if (errStatus === 422) {
          Object.keys(errors).forEach((key: string) => {
            const fieldErrors = errors[key]
            if (Array.isArray(fieldErrors)) {
              fieldErrors.forEach((message: string) => {
                form.setError(
                  key as
                  | 'image'
                  | 'name'
                  | 'description'
                  | `features.${number}.icon`
                  | `features.${number}.name`
                  | `features.${number}.description`,
                  {
                    type: 'server',
                    message: message,
                  },
                )
              })
            } else {
              form.setError(
                key as
                | 'image'
                | 'name'
                | 'description'
                | `features.${number}.icon`
                | `features.${number}.name`
                | `features.${number}.description`,
                {
                  type: 'server',
                  message: fieldErrors,
                },
              )
            }
          })
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

  const handleImagesChange = (files: CustomFile[]) => {
    setBannerImage(files[0]);

    if (!mutate) return;
    form.setValue("image", files.length > 0 ? files[0] : undefined)
    mutate()
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[100vh] space-y-0 overflow-hidden overflow-y-scroll md:overflow-y-hidden px-0 sm:max-w-[50vw]">
        <DialogHeader className="space-y-2 px-6">
          <DialogTitle>{category ? 'Edit' : 'Tambah'} kategori</DialogTitle>
          <DialogDescription>
            {category ? 'Edit' : 'Tambah'} data kategori produk{' '}
            {category ? 'yang sudah tersimpan di' : 'ke'} database sistem
            inventaris {process.env.NEXT_PUBLIC_APP_NAME}
          </DialogDescription>
        </DialogHeader>
        <div className="mx-6 flex flex-col-reverse gap-6 md:flex-row">
          {/* <div className="md:w-[45%]"> */}
          <div className="w-full">
            <h3 className="text-md mb-4 mt-6 font-semibold md:mt-0">
              Metadata
            </h3>
            <Form {...form}>
              <div className="flex max-h-[50vh] flex-col gap-4 overflow-y-scroll rounded-lg border border-zinc-200 px-4 py-4 dark:border-zinc-700">
                <div className="space-y-3">
                  <Dropzone
                    singleImage={form?.getValues("image")}
                    onImagesChange={handleImagesChange}
                  />
                </div>
                <FormField
                  control={control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Kategori</FormLabel>
                      <FormControl>
                        <Input placeholder="Hydrant" {...field} required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deskripsi Kategori</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={5}
                          placeholder="Tingkatkan proteksi kebakaran dengan Fire Hydrant andalan Indoka untuk perlindungan terbaik dalam keadaan darurat"
                          {...field}
                          required
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="mt-2 flex justify-between align-middle">
                  <div>
                    <div className="text-md font-medium">Fitur</div>
                    <div className="text-xs font-light">
                      Highlight fitur unggulan untuk kategori produk ini
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="my-auto text-sm"
                    onClick={() =>
                      append({
                        icon: 'Plus',
                        name: '',
                        description: '',
                      })
                    }
                  >
                    +
                  </Button>
                </div>

                {/* feature form set */}
                {fields.map((field, index) => (
                  <div key={field.id} className="space-y-4">
                    <div className="flex flex-row space-x-4 align-middle">
                      <LucideIconPicker
                        onSelect={(icon) => {
                          setFeatureIcons(prevState => {
                            const newState = [...prevState];
                            newState[index] = icon;
                            return newState;
                          });
                        }}
                      >
                        <Button
                          variant="circle"
                          size="expandableIcon"
                          className="my-auto"
                        >
                          {React.createElement((Lucide as any)[featureIcons[index] ?? category?.features?.[index]?.icon ?? 'Plus'], { size: 18 })}
                        </Button>
                      </LucideIconPicker>
                      <div className="w-full space-y-2">
                        <FormField
                          control={control}
                          name={`features.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  placeholder={`Nama Fitur #${index + 1}`}
                                  {...field}
                                  required
                                  onChange={e => {
                                    field.onChange(e)
                                    handleFeatureNameChange(
                                      index,
                                      e.target.value,
                                    )
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={control}
                          name={`features.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea
                                  rows={5}
                                  placeholder={`Deskripsi Fitur #${index + 1}`}
                                  {...field}
                                  required
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    <div className="flex flex-row justify-end space-x-2">
                      <Button
                        variant="destructive"
                        className="text-sm"
                        size="sm"
                        onClick={() => handleFeatureRemove(index)}
                      >
                        Hapus #{index + 1}
                      </Button>
                      {index === fields.length - 1 &&
                        <Button
                          type="button"
                          variant="secondary"
                          className="text-sm"
                          size="sm"
                          onClick={() =>
                            append({
                              icon: 'Plus',
                              name: '',
                              description: '',
                            })
                          }
                        >
                          Tambah
                        </Button>
                      }
                    </div>
                  </div>
                ))}
              </div>
            </Form>

            <DialogFooter className="mt-4 h-10">
              <Button
                onClick={form.handleSubmit(onSubmit)}
                className="w-full text-sm"
                type="submit"
              >
                Simpan
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
