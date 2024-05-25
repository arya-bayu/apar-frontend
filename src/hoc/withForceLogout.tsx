import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import LoadingSpinner from '@/components/LoadingSpinner'

const withForceLogout = (WrappedComponent: React.ComponentType<any>) => {
    return (props: any) => {
        const { authUser, logoutWithoutRedirect, authError, authLoading } = useAuth({
            middleware: 'guest',
        })

        useEffect(() => {
            if (authUser) {
                logoutWithoutRedirect()
            }
        }, [authUser])

        if ((authUser || authLoading) && authError?.response.status !== 401) {
            return <LoadingSpinner className="h-[100vh] supports-[height:100dvh]:h-[calc(100dvh)] supports-[height:100svh]:h-[calc(100svh)] supports-[height:100cqh]:h-[calc(100cqh)]" size={36} />
        }

        return <WrappedComponent {...props} />
    }
}

export default withForceLogout
