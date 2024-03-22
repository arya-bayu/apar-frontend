import useSWR from 'swr'
import { useMemo, useState } from 'react'
import { PaginationState } from '@tanstack/react-table'
import fetcher from '@/lib/fetcher'

export const useUsers = (callback?: Function) => {
  const [filter, setFilter] = useState<string>('')
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: -1,
    pageSize: 10,
  })

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize],
  )

  const apiUrl =
    'api/v1/users' +
    '/?columns=id,name,phone,email' +
    `&pageIndex=${pageIndex + 1}&pageSize=${pageSize}` +
    (filter ? `&filter=${filter}` : '')

  const {
    data: users,
    error,
    isValidating,
    mutate,
  } = useSWR(apiUrl, fetcher, {
    keepPreviousData: true,
  })

  return {
    filter,
    setFilter,
    pagination,
    setPagination,
    users,
    error,
    isValidating,
    mutate,
  }
}
