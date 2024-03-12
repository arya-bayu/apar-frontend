import useSWR from 'swr'
import { useMemo, useState } from 'react'
import { PaginationState } from '@tanstack/react-table'
import fetcher from '@/lib/fetcher'

export const useSupplier = (callback?: Function) => {
  const [isTrash, setIsTrash] = useState<boolean | undefined>(undefined)
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

  const {
    data: suppliers,
    error,
    isValidating,
    mutate,
  } = useSWR(
    `api/v1/suppliers${isTrash ? '/trash' : ''}?pageIndex=${
      pageIndex + 1
    }&pageSize=${pageSize}${filter && `&filter=${filter}`}`,
    fetcher,
    {
      keepPreviousData: true,
    },
  )

  return {
    isTrash,
    setIsTrash,
    pagination,
    setPagination,
    setFilter,
    suppliers,
    error,
    isValidating,
    mutate,
  }
}
