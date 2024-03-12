import AuthCard from '@/components/AuthCard'
import AuthSessionStatus from '@/components/AuthSessionStatus'
import GuestLayout from '@/components/Layouts/GuestLayout'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/useAuth'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import withPublic from '@/hoc/withPublic'
import * as z from 'zod'
import validator from 'validator'
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
import { Button } from '@/components/ui/button'

const passwordResetScheme = z
  .object({
    email: z.string().refine(validator.isEmail, {
      message: 'Alamat email tidak valid',
    }),
    password: z.string().min(8),
    passwordConfirmation: z.string(),
  })
  .refine(data => data.password === data.passwordConfirmation, {
    message: 'Kata sandi tidak cocok',
    path: ['passwordConfirmation'],
  })

const PasswordReset = () => {
  const { query } = useRouter()

  const { resetPassword } = useAuth({ middleware: 'guest' })

  const [status, setStatus] = useState(null)

  const form = useForm<z.infer<typeof passwordResetScheme>>({
    resolver: zodResolver(passwordResetScheme),
  })

  const onSubmit = async (values: z.infer<typeof passwordResetScheme>) => {
    const data = {
      email: values.email,
      password: values.password,
      password_confirmation: values.passwordConfirmation,
    }

    resetPassword({
      ...data,

      setErrors: (errors: any) => {
        if (errors) {
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
              message: errors.password_confirmationr,
            })
          }
        }
      },
      setStatus,
    })
  }

  useEffect(() => {
    const email = query && query.email ? (query.email as string) : ''

    form.reset({
      email: email,
    })
  }, [query.email])

  return (
    <GuestLayout title="Reset Password">
      <AuthCard>
        {/* Session Status */}
        <AuthSessionStatus className="mb-4" status={status} />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input required type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="mt-4 flex items-center justify-end">
              <Button>Reset Kata Sandi</Button>
            </div>
          </form>
        </Form>
      </AuthCard>
    </GuestLayout>
  )
}

export default withPublic(PasswordReset)
