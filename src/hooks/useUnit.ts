import useSWR from 'swr'
import { useMemo, useState } from 'react'
import { PaginationState } from '@tanstack/react-table'
import fetcher from '@/lib/fetcher'

export const useUnit = (callback?: Function) => {
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
    data: units,
    error,
    isValidating,
    mutate,
  } = useSWR(
    `api/v1/units${isTrash ? '/trash' : ''}?pageIndex=${
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
    units,
    error,
    isValidating,
    mutate,
  }
}
