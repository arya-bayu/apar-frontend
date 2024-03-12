import useSWR from 'swr'
import fetcher from '@/lib/fetcher'

export const useUserRoles = (callback?: Function) => {
  const { data: roles } = useSWR('/api/v1/user-roles', fetcher, {
    keepPreviousData: true,
  })

  return {
    roles,
  }
}
