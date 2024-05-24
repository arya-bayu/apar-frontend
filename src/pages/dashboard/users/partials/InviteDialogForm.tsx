import React, { PropsWithChildren, useState } from 'react'
import { useUserRoles } from '@/hooks/useUserRoles'
import axios from '@/lib/axios'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '../../../../components/ui/use-toast'
import { Role } from '@/enums/Role'
import * as z from 'zod'
import validator from 'validator'
import { AxiosError } from 'axios'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from "lucide-react"
import { env } from "process"

const inviteUserFormSchema = z.object({
  email: z.string().refine(validator.isEmail, {
    message: 'Alamat email tidak valid',
  }),
  role: z.string().refine(
    value => {
      return Object.values(Role).includes(value as Role)
    },
    {
      message: 'Role tidak valid',
    },
  ),
})

export default function InviteUserDialog({ children }: PropsWithChildren) {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [open, setOpen] = useState(false)
  const { roles } = useUserRoles()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof inviteUserFormSchema>>({
    resolver: zodResolver(inviteUserFormSchema),
  })

  const onSubmit = async (values: z.infer<typeof inviteUserFormSchema>) => {
    const data = {
      email: values.email,
      role: values.role,
    }

    try {
      const response = await axios.post('/api/v1/users/invite', data)

      if (response)
        toast({
          variant: 'default',
          title: 'Sukses',
          description: `${response.data.data.email} telah diundang untuk bergabung.`,
        })
    } catch (error) {
      if (error instanceof AxiosError) {
        const errStatus = error.response?.status
        const errors = error.response?.data.errors
        if (errStatus === 422) {
          if (errors.email) {
            form.setError('email', {
              type: 'server',
              message: errors.email,
            })
          }
          if (errors.role) {
            form.setError('role', {
              type: 'server',
              message: errors.role,
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
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="space-y-2">
          <DialogTitle>Undang Pengguna</DialogTitle>
          <DialogDescription>
            Undang seseorang menjadi pengguna sistem inventaris ${process.env.NEXT_APP_NAME}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-4 py-2"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="grid grid-cols-5 items-center gap-4">
                  <FormLabel className="text-right">Email</FormLabel>
                  <FormControl className="col-span-4">
                    <div className="flex flex-col">
                      <Input
                        placeholder="hello@indokasuryajaya.com"
                        {...field}
                        required
                      />
                      <FormMessage />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="grid grid-cols-5 items-center gap-4">
                  <FormLabel className="text-right">Role</FormLabel>
                  <FormControl className="col-span-4">
                    <div className="flex flex-col">
                      <Select
                        {...field}
                        value={field.value}
                        onValueChange={field.onChange}
                        required
                      >
                        <SelectTrigger id="role" className="col-span-4">
                          <SelectValue placeholder="Pilih Role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Pilih Role</SelectLabel>
                            {roles?.data.map((role: Role) => {
                              return (
                                <SelectItem key={role} value={role}>
                                  {role}
                                </SelectItem>
                              )
                            })}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter className="mt-4">
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
                type="submit"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mengundang...
                  </>
                ) : (
                  "Kirim Undangan"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
