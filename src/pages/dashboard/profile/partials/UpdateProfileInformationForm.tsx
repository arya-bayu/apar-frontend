import { Input } from '@/components/ui/input'
import axios, { csrf } from '@/lib/axios'
import { useAuth } from '@/hooks/useAuth'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from '@/components/ui/use-toast'
import { AxiosError } from 'axios'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import validator from 'validator'
import { Button } from '@/components/ui/button'

const updateProfileFormSchema = z.object({
  name: z.string(),
  phone: z.string().refine(validator.isMobilePhone, {
    message: 'Nomor telepon tidak valid',
  }),
  email: z.string().refine(validator.isEmail, {
    message: 'Alamat email tidak valid',
  }),
})

const UpdateProfileInformationForm = () => {
  const { authUser, mutate, resendEmailVerification } = useAuth({
    middleware: 'auth',
  })

  const form = useForm<z.infer<typeof updateProfileFormSchema>>({
    resolver: zodResolver(updateProfileFormSchema),
    defaultValues: {
      name: authUser?.name ?? '',
      phone: authUser?.phone ?? '',
      email: authUser?.email ?? '',
    },
  })

  const onSubmit = async (values: z.infer<typeof updateProfileFormSchema>) => {
    const data = {
      name: values.name,
      phone: values.phone,
      email: values.email,
    }

    try {
      await csrf()

      const response = await axios.put('api/v1/profile', { ...data })

      if (response.data.status === 'profile-updated') {
        mutate()
        toast({
          variant: 'success',
          title: 'Sukses',
          description: 'Profil telah berhasil diperbarui.',
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
    <section>
      <header>
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Informasi Akun
        </h2>

        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Perbarui informasi profil dan kontak Anda.
        </p>
      </header>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-3">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama</FormLabel>
                <FormControl>
                  <Input {...field} />
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
                  <Input {...field} />
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
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {authUser?.must_verify_email &&
            authUser?.email_verified_at === null && (
              <div>
                <p className="mt-2 text-sm text-gray-800 dark:text-gray-200">
                  Alamat email Anda belum terverifikasi.
                  <button
                    className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:text-gray-400 dark:hover:text-gray-100 dark:focus:ring-offset-gray-800"
                    onClick={() =>
                      resendEmailVerification({
                        setStatus: status => {
                          status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-medium text-green-600 dark:text-green-400">
                              Link verifikasi baru telah terkirim ke alamat
                              email Anda.
                            </div>
                          )
                        },
                        setErrors: () => {},
                      })
                    }
                  >
                    Verifikasi email
                  </button>
                </p>
              </div>
            )}

          <div className="flex items-center gap-4">
            <Button className="mt-2 uppercase tracking-widest">Simpan</Button>
          </div>
        </form>
      </Form>
    </section>
  )
}

export default UpdateProfileInformationForm
