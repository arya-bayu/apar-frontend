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
import { ICustomer } from '@/types/customer'
import { KeyedMutator } from 'swr'
import { DataTable } from '@/components/ui/data-table'
import validator from 'validator'
import { Loader2 } from "lucide-react"

interface ICustomerDialog<TData> {
  data?: DataTable<TData>
  id?: number
  mutate?: KeyedMutator<any>
  setDisabledContextMenu?: Dispatch<SetStateAction<boolean | undefined>>
  onSuccess?: () => void;
}

const customerFormSchema = z.object({
  companyName: z.string(),
  picName: z.string(),
  phone: z.string().refine(validator.isMobilePhone, {
    message: 'Nomor telepon tidak valid',
  }),
  email: z.string().refine(validator.isEmail, {
    message: 'Alamat email tidak valid',
  }),
  address: z.string(),
})

export default function CustomerDialog({
  id,
  mutate,
  children,
  setDisabledContextMenu,
  onSuccess
}: PropsWithChildren<ICustomerDialog<ICustomer>>) {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [open, setOpen] = useState(false)
  const [customer, setCustomer] = useState<ICustomer>()

  setDisabledContextMenu &&
    useEffect(() => {
      setDisabledContextMenu(open)
    }, [open])

  const form = useForm<z.infer<typeof customerFormSchema>>({
    resolver: zodResolver(customerFormSchema),
  })

  useEffect(() => {
    if (!open || !id) return

    async function fetchCustomer() {
      try {
        const response = await axios.get(`/api/v1/customers/${id}`)
        setCustomer(response.data.data)
      } catch (error) {
        if (error instanceof AxiosError)
          toast({
            variant: 'destructive',
            title: 'Terjadi kesalahan',
            description: error.response?.data.errors,
          })
      }
    }

    fetchCustomer()
  }, [id, open])

  useEffect(() => {
    form.reset({
      companyName: customer?.company_name ?? '',
      picName: customer?.pic_name ?? '',
      phone: customer?.phone ?? '',
      email: customer?.email ?? '',
      address: customer?.address ?? '',
    })
  }, [customer])

  useEffect(() => {
    if (form.formState.isSubmitSuccessful) {
      form.reset()
    }
  }, [form.formState, form.reset])

  const onSubmit = async (values: z.infer<typeof customerFormSchema>) => {

    const data = {
      company_name: values.companyName,
      pic_name: values.picName,
      phone: values.phone,
      email: values.email,
      address: values.address,
    }

    try {
      const response = customer
        ? await axios.put(`/api/v1/customers/${customer?.id}`, data)
        : await axios.post('/api/v1/customers/', data)

      mutate && mutate()

      if (response) {
        setOpen(false)
        toast({
          variant: 'success',
          title: 'Sukses',
          description: `Data pelanggan ${values.companyName} telah berhasil ${customer ? 'diperbarui' : 'disimpan'
            }.`,
        })
        onSuccess && onSuccess()
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        const errStatus = error.response?.status
        const errors = error.response?.data.errors
        if (errStatus === 422) {
          if (errors.company_name) {
            form.setError('companyName', {
              type: 'server',
              message: errors.company_name,
            })
          }
          if (errors.pic_name) {
            form.setError('picName', {
              type: 'server',
              message: errors.pic_name,
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
      <DialogContent className="max-h-[calc(100dvh)] supports-[max-height:100svh]:max-h-[calc(100svh)] supports-[max-height:100cqh]:max-h-[calc(100cqh)]md:max-h-[calc(90dvh)] overflow-y-scroll sm:max-w-[525px]">
        <DialogHeader className="space-y-2">
          <DialogTitle>{customer ? 'Edit' : 'Tambah'} pelanggan</DialogTitle>
          <DialogDescription>
            {customer ? 'Edit' : 'Tambah'} data pelanggan{' '}
            {customer ? 'yang sudah tersimpan di' : 'ke'} database sistem
            inventaris {process.env.NEXT_PUBLIC_APP_NAME}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className="mt-4 flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Perusahaan</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Villa Indoka"
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
              name="picName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Person in Contact</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Arya"
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
                      placeholder="hello@indokavilla.com"
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
    </Dialog>
  )
}
