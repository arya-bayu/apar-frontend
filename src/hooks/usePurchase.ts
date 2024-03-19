import useSWR from 'swr'
import { useMemo, useState } from 'react'
import { PaginationState } from '@tanstack/react-table'
import fetcher from '@/lib/fetcher'

export const usePurchase = (callback?: Function) => {
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
    data: purchases,
    error,
    isValidating,
    mutate,
  } = useSWR(
    `api/v1/purchases?pageIndex=${pageIndex + 1}&pageSize=${pageSize}${
      filter && `&filter=${filter}`
    }`,
    fetcher,
    {
      keepPreviousData: true,
    },
  )

  return {
    pagination,
    setPagination,
    setFilter,
    purchases,
    error,
    isValidating,
    mutate,
  }
}
