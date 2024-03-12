import AuthCard from '@/components/AuthCard'
import AuthSessionStatus from '@/components/AuthSessionStatus'
import GuestLayout from '@/components/Layouts/GuestLayout'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/useAuth'
import { useState } from 'react'
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

const forgotPasswordSchema = z.object({
  email: z.string().refine(validator.isEmail, {
    message: 'Alamat email tidak valid',
  }),
})

const ForgotPassword = () => {
  const { forgotPassword } = useAuth({
    middleware: 'guest',
    redirectIfAuthenticated: '/dashboard',
  })
  const [status, setStatus] = useState(null)

  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = async (values: z.infer<typeof forgotPasswordSchema>) => {
    const data = {
      email: values.email,
    }

    forgotPassword({
      ...data,
      setErrors: (errors: any) => {
        if (errors.email) {
          form.setError('email', {
            type: 'server',
            message: errors.email,
          })
        }
      },
      setStatus,
    })
  }

  return (
    <GuestLayout title="Forgot Password">
      <AuthCard>
        <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Masukkan alamat email Anda dan kami akan mengirim tautan untuk
          mengatur ulang kata sandi.
        </div>

        {/* Session Status */}
        <AuthSessionStatus className="mb-4" status={status} />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input required autoFocus autoComplete="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="mt-4 flex items-center justify-end">
              <Button>Email Password Reset Link</Button>
            </div>
          </form>
        </Form>
      </AuthCard>
    </GuestLayout>
  )
}

export default withPublic(ForgotPassword)
