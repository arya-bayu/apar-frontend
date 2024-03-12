import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import LoadingSpinner from '@/components/LoadingSpinner'

const withPublic = (WrappedComponent: React.ComponentType<any>) => {
  return (props: any) => {
    const router = useRouter()
    const { authUser, authError, authLoading } = useAuth({
      middleware: 'guest',
    })

    useEffect(() => {
      if (authUser) {
        router.replace('/dashboard')
      }
    }, [authUser])

    if ((authUser || authLoading) && authError?.response.status !== 401) {
      return <LoadingSpinner className="h-screen" size={36} />
    }

    return <WrappedComponent {...props} />
  }
}

export default withPublic
