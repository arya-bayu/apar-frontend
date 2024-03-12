import AuthCard from '@/components/AuthCard'
import GuestLayout from '@/components/Layouts/GuestLayout'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useState, useEffect } from 'react'
import axios from '@/lib/axios'
import { useRouter } from 'next/router'
import LoadingSpinner from '@/components/LoadingSpinner'
import withPublic from '@/hoc/withPublic'
import * as z from 'zod'
import validator from 'validator'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { toast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'

const registerFormScheme = z
  .object({
    name: z.string(),
    phone: z.string().refine(validator.isMobilePhone, {
      message: 'Nomor telepon tidak valid',
    }),
    email: z.string().refine(validator.isEmail, {
      message: 'Alamat email tidak valid',
    }),
    inviteToken: z.string(),
    password: z.string().min(8),
    passwordConfirmation: z.string(),
  })
  .refine(data => data.password === data.passwordConfirmation, {
    message: 'Kata sandi tidak cocok',
    path: ['passwordConfirmation'],
  })

const Register = () => {
  const router = useRouter()
  const { register } = useAuth({
    middleware: 'guest',
    redirectIfAuthenticated: '/dashboard',
  })

  const [isSubmitted, setIsSubmitted] = useState(false)

  const form = useForm<z.infer<typeof registerFormScheme>>({
    resolver: zodResolver(registerFormScheme),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      inviteToken: '',
      password: '',
      passwordConfirmation: '',
    },
  })

  const onSubmit = async (values: z.infer<typeof registerFormScheme>) => {
    const data = {
      name: values.name,
      phone: values.phone,
      email: values.email,
      invite_token: values.inviteToken,
      password: values.password,
      password_confirmation: values.passwordConfirmation,
    }

    register({
      ...data,
      setErrors: (errors: any) => {
        if (errors) {
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
          setIsSubmitted(true)
        }
      },
      setStatus: status => {},
    })
  }

  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    if (!router.isReady) return
    if (router.query.invite) {
      axios
        .get(`/api/v1/users/invite/${router.query.invite}`)
        .then(response => {
          form.reset({
            email: response.data.data.email,
            inviteToken: String(router.query.invite),
          })
          setIsAuthorized(true)
        })
        .catch(error => {
          if (error.response.status === 404) {
            router.push('/login')
          }
        })
    } else if (!isSubmitted) {
      axios
        .get('/api/v1/register')
        .then(response => {
          response.status === 200 && setIsAuthorized(true)
        })
        .catch(error => {
          error.response.status === 403
            ? router.push('/login')
            : toast({
                variant: 'destructive',
                title: 'Terjadi kesalahan',
                description: error,
              })
        })
    }
  }, [router.isReady, router.query.invite, isSubmitted])

  if (!isAuthorized) return <LoadingSpinner className="h-screen" size={36} />

  return (
    <GuestLayout title="Register">
      <AuthCard>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama</FormLabel>
                  <FormControl>
                    <Input required {...field} />
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
                    <Input required {...field} />
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
                    <Input required {...field} />
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
                  <FormLabel>Password</FormLabel>
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
                  <FormLabel>Konfirmasi Password</FormLabel>
                  <FormControl>
                    <Input required type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="mt-4 flex items-center justify-end">
              <Link
                href="/login"
                className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:text-gray-400 dark:hover:text-gray-100 dark:focus:ring-offset-gray-800"
              >
                Sudah punya akun?
              </Link>

              <Button className="ml-4">Daftar</Button>
            </div>
          </form>
        </Form>
      </AuthCard>
    </GuestLayout>
  )
}

export default withPublic(Register)
