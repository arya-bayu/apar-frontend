import { Input } from '@/components/ui/input'
import axios, { csrf } from '@/lib/axios'
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { toast } from '@/components/ui/use-toast'
import { AxiosError } from 'axios'
import { Button } from '@/components/ui/button'

const updatePasswordSchema = z
  .object({
    currentPassword: z.string(),
    password: z.string().min(8),
    passwordConfirmation: z.string(),
  })
  .refine(data => data.password === data.passwordConfirmation, {
    message: 'Kata sandi tidak cocok',
    path: ['passwordConfirmation'],
  })

const UpdatePasswordForm = () => {
  const form = useForm<z.infer<typeof updatePasswordSchema>>({
    resolver: zodResolver(updatePasswordSchema),
  })

  const onSubmit = async (values: z.infer<typeof updatePasswordSchema>) => {
    const data = {
      current_password: values.currentPassword,
      password: values.password,
      password_confirmation: values.passwordConfirmation,
    }

    await csrf()

    axios
      .put('/api/v1/password', { ...data })
      .then(response => {
        if (response.data.status === 'password-updated') {
          toast({
            variant: 'success',
            title: 'Sukses',
            description: 'Kata sandi telah berhasil diperbarui.',
          })
        }
      })
      .catch(error => {
        if (error instanceof AxiosError) {
          const errStatus = error.response?.status
          const errors = error.response?.data.errors
          if (errStatus === 422) {
            if (errors.current_password) {
              form.setError('currentPassword', {
                type: 'server',
                message: errors.current_password,
              })
            }
            if (errors.password) {
              form.setError('password', {
                type: 'server',
                message: errors.password,
              })
            }
            if (errors.password_confirmation) {
              form.setError('passwordConfirmation', {
                type: 'server',
                message: errors.password_confirmation,
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
      })
  }

  return (
    <section>
      <header>
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Kata Sandi
        </h2>

        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Pastikan akun Anda menggunakan kata sandi yang acak untuk tetap aman.
        </p>
      </header>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
          {/* Current password */}
          <FormField
            control={form.control}
            name="currentPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kata Sandi Lama</FormLabel>
                <FormControl>
                  <Input required type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kata Sandi Baru</FormLabel>
                <FormControl>
                  <Input required type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="passwordConfirmation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Konfirmasi Kata Sandi</FormLabel>
                <FormControl>
                  <Input required type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex items-center gap-4">
            <Button>Simpan</Button>
          </div>
        </form>
      </Form>
    </section>
  )
}

export default UpdatePasswordForm
