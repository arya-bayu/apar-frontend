import useSWR from 'swr'
import { useMemo, useState } from 'react'
import { PaginationState } from '@tanstack/react-table'
import fetcher from '@/lib/fetcher'

export const useProduct = (callback?: Function) => {
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
    data: products,
    error,
    isValidating,
    mutate,
  } = useSWR(
    `api/v1/products${isTrash ? '/trash' : ''}?pageIndex=${
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
    products,
    error,
    isValidating,
    mutate,
  }
}
