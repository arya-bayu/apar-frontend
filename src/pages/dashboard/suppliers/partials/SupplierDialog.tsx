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
import { ISupplier } from '@/types/supplier'
import { KeyedMutator } from 'swr'
import { DataTable } from '@/components/ui/data-table'
import validator from 'validator'

interface ISupplierDialog<TData> {
  data?: DataTable<TData>
  id?: number
  mutate?: KeyedMutator<any>
  setDisabledContextMenu?: Dispatch<SetStateAction<boolean | undefined>>
}

const supplierFormSchema = z.object({
  name: z.string(),
  phone: z.string().refine(validator.isMobilePhone, {
    message: 'Nomor telepon tidak valid',
  }),
  email: z.string().refine(validator.isEmail, {
    message: 'Alamat email tidak valid',
  }),
  address: z.string(),
})

export default function SupplierDialog({
  id,
  mutate,
  children,
  setDisabledContextMenu,
}: PropsWithChildren<ISupplierDialog<ISupplier>>) {
  const [open, setOpen] = useState(false)
  const [supplier, setSupplier] = useState<ISupplier>()

  setDisabledContextMenu &&
    useEffect(() => {
      setDisabledContextMenu(open)
    }, [open])

  const form = useForm<z.infer<typeof supplierFormSchema>>({
    resolver: zodResolver(supplierFormSchema),
  })

  useEffect(() => {
    if (!open || !id) return

    async function fetchSupplier() {
      try {
        const response = await axios.get(`/api/v1/suppliers/${id}`)
        setSupplier(response.data.data)
      } catch (error) {
        if (error instanceof AxiosError)
          toast({
            variant: 'destructive',
            title: 'Terjadi kesalahan',
            description: error.response?.data.errors,
          })
      }
    }

    fetchSupplier()
  }, [id, open])

  useEffect(() => {
    form.reset({
      name: supplier?.name ?? '',
      phone: supplier?.phone ?? '',
      email: supplier?.email ?? '',
      address: supplier?.address ?? '',
    })
  }, [supplier])

  useEffect(() => {
    if (form.formState.isSubmitSuccessful) {
      form.reset()
    }
  }, [form.formState, form.reset])

  const onSubmit = async (values: z.infer<typeof supplierFormSchema>) => {
    if (!mutate) return

    const data = {
      name: values.name,
      phone: values.phone,
      email: values.email,
      address: values.address,
    }

    try {
      const response = supplier
        ? await axios.put(`/api/v1/suppliers/${supplier?.id}`, data)
        : await axios.post('/api/v1/suppliers/', data)

      mutate()

      if (response) {
        setOpen(false)
        toast({
          variant: 'success',
          title: 'Sukses',
          description: `Data supplier ${values.name} telah berhasil ${supplier ? 'diperbarui' : 'disimpan'
            }.`,
        })
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        const errStatus = error.response?.status
        const errors = error.response?.data.errors
        if (errStatus === 422) {
          if (errors.name) {
            form.setError('name', {
              type: 'server',
              message: errors.name,
            })
          }
          if (errors.phone) {
            form.setError('phone', {
              type: 'server',
              message: errors.phone,
            })
          }
          if (errors.email) {
            form.setError('email', {
              type: 'server',
              message: errors.email,
            })
          }
          if (errors.alamat) {
            form.setError('address', {
              type: 'server',
              message: errors.address,
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
      <DialogContent className="max-h-[calc(100dvh)] md:max-h-[90vh] overflow-y-scroll sm:max-w-[525px]">
        <DialogHeader className="space-y-2">
          <DialogTitle>{supplier ? 'Edit' : 'Tambah'} supplier</DialogTitle>
          <DialogDescription>
            {supplier ? 'Edit' : 'Tambah'} data supplier produk{' '}
            {supplier ? 'yang sudah tersimpan di' : 'ke'} database sistem
            inventaris {process.env.NEXT_PUBLIC_APP_NAME}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Perusahaan</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="PT. Alat Pemadam Api Ringan"
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
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telepon</FormLabel>
                  <FormControl>
                    <Input placeholder="+6281000000" {...field} required />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="hello@indokasuryajaya.com"
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
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alamat</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={5}
                      placeholder="Jl. Tukad Badung No.135, Renon, Denpasar Selatan, Kota Denpasar, Bali 80226"
                      {...field}
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="mt-2">
              <Button className="w-full" type="submit">
                {supplier ? 'Edit' : 'Tambah'} Supplier
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
