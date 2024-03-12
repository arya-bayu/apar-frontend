import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import LoadingSpinner from '@/components/LoadingSpinner'

const withProtected = (WrappedComponent: React.ComponentType<any>) => {
  return (props: any) => {
    const router = useRouter()
    const { authUser, authLoading } = useAuth({ middleware: 'auth' })

    useEffect(() => {
      if (!authUser && !authLoading) {
        router.replace('/login')
      }
    }, [authUser, authLoading])

    if (!authUser || authLoading) {
      return <LoadingSpinner className="h-screen" size={36} />
    }

    return <WrappedComponent {...props} />
  }
}

export default withProtected
