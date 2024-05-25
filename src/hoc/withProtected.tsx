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
        router.replace('/dashboard/login')
      }
    }, [authUser, authLoading])

    if (!authUser || authLoading) {
      return <LoadingSpinner className="h-[100vh] supports-[height:100dvh]:h-[calc(100dvh)] supports-[height:100svh]:h-[calc(100svh)] supports-[height:100cqh]:h-[calc(100cqh)]" size={36} />
    }

    return <WrappedComponent {...props} />
  }
}

export default withProtected
