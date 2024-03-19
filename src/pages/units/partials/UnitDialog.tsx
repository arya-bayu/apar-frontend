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
import { IUnit } from '@/types/unit'
import { KeyedMutator } from 'swr'
import { DataTable } from '@/components/ui/data-table'
import validator from 'validator'

interface IUnitDialog<TData> {
  data?: DataTable<TData>
  id?: number
  mutate?: KeyedMutator<any>
  setDisabledContextMenu?: Dispatch<SetStateAction<boolean | undefined>>
}

const unitFormSchema = z.object({
  name: z.string()
})

export default function UnitDialog({
  id,
  mutate,
  children,
  setDisabledContextMenu,
}: PropsWithChildren<IUnitDialog<IUnit>>) {
  const [open, setOpen] = useState(false)
  const [unit, setUnit] = useState<IUnit>()

  setDisabledContextMenu &&
    useEffect(() => {
      setDisabledContextMenu(open)
    }, [open])

  const form = useForm<z.infer<typeof unitFormSchema>>({
    resolver: zodResolver(unitFormSchema),
  })

  useEffect(() => {
    if (!open || !id) return

    async function fetchUnit() {
      try {
        const response = await axios.get(`/api/v1/units/${id}`)
        setUnit(response.data.data)
      } catch (error) {
        if (error instanceof AxiosError)
          toast({
            variant: 'destructive',
            title: 'Terjadi kesalahan',
            description: error.response?.data.errors,
          })
      }
    }

    fetchUnit()
  }, [id, open])

  useEffect(() => {
    form.reset({
      name: unit?.name ?? '',
    })
  }, [unit])

  useEffect(() => {
    if (form.formState.isSubmitSuccessful) {
      form.reset()
    }
  }, [form.formState, form.reset])

  const onSubmit = async (values: z.infer<typeof unitFormSchema>) => {
    if (!mutate) return

    const data = {
      name: values.name,
    }

    try {
      const response = unit
        ? await axios.put(`/api/v1/units/${unit?.id}`, data)
        : await axios.post('/api/v1/units/', data)

      mutate()

      if (response) {
        setOpen(false)
        toast({
          variant: 'success',
          title: 'Sukses',
          description: `Data unit ${values.name} telah berhasil ${unit ? 'diperbarui' : 'disimpan'
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
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader className="space-y-2">
          <DialogTitle>{unit ? 'Edit' : 'Tambah'} unit</DialogTitle>
          <DialogDescription>
            {unit ? 'Edit' : 'Tambah'} data unit produk{' '}
            {unit ? 'yang sudah tersimpan di' : 'ke'} database sistem
            inventaris {process.env.NEXT_PUBLIC_APP_NAME}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-4 flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Unit</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Gram"
                      {...field}
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="mt-4">
              <Button className="w-full" type="submit">
                {unit ? 'Edit' : 'Tambah'} Unit
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
