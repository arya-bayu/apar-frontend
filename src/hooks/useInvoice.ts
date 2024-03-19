import useSWR from 'swr'
import { useMemo, useState } from 'react'
import { PaginationState } from '@tanstack/react-table'
import fetcher from '@/lib/fetcher'

export const useInvoice = (callback?: Function) => {
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
    data: invoices,
    error,
    isValidating,
    mutate,
  } = useSWR(
    `api/v1/invoices?pageIndex=${pageIndex + 1}&pageSize=${pageSize}${
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
    invoices,
    error,
    isValidating,
    mutate,
  }
}
