import useSWR from 'swr'
import axios, { csrf } from '@/lib/axios'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { IUser } from '@/types/user'

declare type AuthMiddleware = 'auth' | 'guest'

interface IUseAuth {
  middleware: AuthMiddleware
  redirectIfAuthenticated?: string
}

interface IApiRequest {
  setErrors: React.Dispatch<React.SetStateAction<never[]>>
  setStatus: React.Dispatch<React.SetStateAction<any | null>>
  [key: string]: any
}

export const useAuth = ({ middleware, redirectIfAuthenticated }: IUseAuth) => {
  const router = useRouter()

  const {
    data: authUser,
    isLoading: authLoading,
    error: authError,
    mutate,
  } = useSWR<IUser>('/api/v1/user', () =>
    axios
      .get('/api/v1/user')
      .then(res => res.data.data)
      .catch(error => {
        if (error.response.status !== 409) throw error
        router.push('/verify-email')
      }),
  )

  const can = (permission: string): boolean =>
    (authUser?.permissions || []).find(p => p == permission) ? true : false

  const register = async (args: IApiRequest) => {
    const { setErrors, ...props } = args

    await csrf()

    setErrors([])

    axios
      .post('/register', props)
      .then(() => mutate())
      .catch(error => {
        if (error.response.status !== 422) throw error

        setErrors(error.response.data.errors)
      })
  }

  const login = async (args: IApiRequest) => {
    const { setErrors, setStatus, ...props } = args

    await csrf()

    setErrors([])
    setStatus(null)

    axios
      .post('/login', props)
      .then(() => mutate())
      .catch(error => {
        if (error.response.status !== 422) throw error
        setErrors(error.response.data.errors)
      })
  }

  const forgotPassword = async (args: IApiRequest) => {
    const { setErrors, setStatus, email } = args
    await csrf()

    setErrors([])
    setStatus(null)

    axios
      .post('/forgot-password', { email })
      .then(response => setStatus(response.data.status))
      .catch(error => {
        if (error.response.status !== 422) throw error

        setErrors(error.response.data.errors)
      })
  }

  const resetPassword = async (args: IApiRequest) => {
    const { setErrors, setStatus, ...props } = args
    await csrf()

    setErrors([])
    setStatus(null)

    axios
      .post('/reset-password', { token: router.query.token, ...props })
      .then(response =>
        router.push('/login?reset=' + btoa(response.data.status)),
      )
      .catch(error => {
        if (error.response.status !== 422) throw error

        setErrors(error.response.data.errors)
      })
  }

  const resendEmailVerification = (args: IApiRequest) => {
    const { setStatus } = args

    axios
      .post('/email/verification-notification')
      .then(response => setStatus(response.data.status))
  }

  const logout = async () => {
    if (!authError) {
      await axios.post('/logout').then(() => mutate())
    }

    window.location.pathname = '/dashboard/login'
  }

  useEffect(() => {
    if (middleware === 'guest' && redirectIfAuthenticated && authUser)
      router.push(redirectIfAuthenticated)
    if (
      window.location.pathname === '/verify-email' &&
      redirectIfAuthenticated &&
      authUser?.email_verified_at
    ) {
      router.push(redirectIfAuthenticated)
    }
    if (middleware === 'auth' && authError) logout()
  }, [authUser, authError])

  return {
    authUser,
    authError,
    authLoading,
    can,
    register,
    login,
    forgotPassword,
    resetPassword,
    resendEmailVerification,
    logout,
    mutate,
  }
}
