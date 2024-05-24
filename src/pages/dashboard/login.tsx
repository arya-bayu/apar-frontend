import AuthCard from '@/components/AuthCard'
import GuestLayout from '@/components/Layouts/GuestLayout'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Checkbox } from '@/components/ui/checkbox'
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
import { Button } from '@/components/ui/button'
import { EyeIcon, EyeOffIcon, Loader2 } from "lucide-react"
import { useState } from "react"

const loginSchema = z.object({
  email: z.string().refine(validator.isEmail, {
    message: 'Alamat email tidak valid',
  }),
  password: z.string(),
  shouldRemember: z.boolean(),
})

const Login = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [showPassword, setShowPassword] = useState<boolean>(false)

  const { login } = useAuth({
    middleware: 'guest',
    redirectIfAuthenticated: '/dashboard',
  })

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      shouldRemember: false,
    },
  })

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true)
    const data = {
      email: values.email,
      password: values.password,
      shouldRemember: values.shouldRemember,
    }

    try {
      await login({
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
          }
        },
        setStatus: () => { },
      })
    } finally {
      setIsLoading(false)
    }

  }

  return (
    <GuestLayout title="Login">
      <AuthCard>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input autoComplete="current-password" type={showPassword ? 'text' : 'password'} {...field} />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 cursor-pointer">
                        {showPassword ? (
                          <EyeOffIcon className="h-5 w-5" onClick={() => setShowPassword(!showPassword)} />
                        ) : (
                          <EyeIcon className=" h-5 w-5" onClick={() => setShowPassword(!showPassword)} />
                        )}
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="shouldRemember"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />

                      <label
                        htmlFor="remember"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Ingat saya
                      </label>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="mt-4 flex items-center justify-end">
              <Link
                href="/dashboard/forgot-password"
                className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:text-gray-400 dark:hover:text-gray-100 dark:focus:ring-offset-gray-800"
              >
                Lupa kata sandi?
              </Link>
              <Button
                disabled={isLoading}
                className="ml-4">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Login"
                )}</Button>
            </div>
          </form>
        </Form>
      </AuthCard>
    </GuestLayout>
  )
}

export default withPublic(Login)
