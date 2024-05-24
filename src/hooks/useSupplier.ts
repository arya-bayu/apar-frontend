import useSWR from 'swr'
import { useMemo, useState } from 'react'
import { PaginationState } from '@tanstack/react-table'
import fetcher from '@/lib/fetcher'

export const useSupplier = (callback?: Function) => {
  const [isTrash, setIsTrash] = useState<boolean | undefined>(undefined)
  const [filter, setFilter] = useState<string>('')
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: -1,
    pageSize: 15,
  })

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize],
  )

  const apiUrl =
    'api/v1/suppliers' +
    (isTrash ? '/trash' : '') +
    '/?columns=id,name,phone,email,address' +
    `&pageIndex=${pageIndex + 1}&pageSize=${pageSize}` +
    (filter ? `&filter=${filter}` : '')

  const {
    data: suppliers,
    error,
    isValidating,
    isLoading,
    mutate,
  } = useSWR(apiUrl, fetcher, {
    keepPreviousData: true,
  })

  return {
    isTrash,
    setIsTrash,
    pagination,
    setPagination,
    setFilter,
    suppliers,
    error,
    isValidating,
    isLoading,
    mutate,
  }
}
