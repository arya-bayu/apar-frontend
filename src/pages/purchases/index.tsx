import { useAuth } from '@/hooks/useAuth'

import _ from 'lodash'
import AppLayout from '@/components/Layouts/AppLayout'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import withProtected from '@/hoc/withProtected'
import { DataTable } from '@/components/ui/data-table'
import { purchaseColumns } from './columns/PurchaseColumns'
import { usePurchase } from '@/hooks/usePurchase'
import { IPurchase } from '@/types/purchase'
import axios from '@/lib/axios'
import { AxiosError } from 'axios'
import { useRouter } from 'next/router'
import { useState } from 'react'
import Link from 'next/link'
import { PlusIcon } from 'lucide-react'
import ContentLayout from '@/components/Layouts/ContentLayout'
import { useBreakpoint } from "@/hooks/useBreakpoint"

const Purchases = () => {
  const {
    purchases,
    mutate,
    isValidating,
    pagination,
    setPagination,
    setFilter,
  } = usePurchase()
  const { toast } = useToast()
  const title = 'Pembelian'
  const router = useRouter()
  const { authUser, can } = useAuth({ middleware: 'auth' })
  const [disabledContextMenu, setDisabledContextMenu] = useState(false)
  const { isBelowXs } = useBreakpoint('xs')

  const handleGetAllId = async () => {
    try {
      const response = await axios.get(
        `api/v1/purchases/?columns[]=id`,
      )

      return response.data.data.rows
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Gagal',
        description:
          error instanceof AxiosError
            ? error.response?.data.errors
            : 'Terjadi kesalahan',
      })
    }
  }

  const handleExportData = async (
    fileType: 'XLSX' | 'CSV',
    id?: IPurchase['id'][],
    startDate?: string,
    endDate?: string,
  ) => {
    const params = {
      id: id,
      startDate: startDate,
      endDate: endDate,
      fileType: fileType,
    }

    try {
      const response = await axios.get(`api/v1/purchases/export`, {
        responseType: 'blob',
        params: _.pickBy(params, value => !!value),
      })

      const moment = require('moment')

      const appName = process.env.NEXT_PUBLIC_APP_NAME

      const date = moment().format('YYYY-MM-DD')
      const time = moment().format('HHmmss')

      let fileName = title

      if (id && id.length > 0) {
        fileName += ' (Custom Export)'
      }

      if (startDate && endDate) {
        fileName += ` (Custom Range Export) ${startDate}-${endDate}`
      }

      fileName += ` ${date} T${time} ${appName}.${fileType?.toLowerCase()}`


      const url = URL.createObjectURL(
        new Blob([response.data], {
          type:
            fileType === 'XLSX'
              ? 'application/vnd.ms-excel'
              : fileType === 'CSV'
                ? 'text/csv'
                : 'application/octet-stream',
        }),
      )
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()

    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Gagal',
        description:
          error instanceof AxiosError
            ? error.response?.data.errors
            : 'Terjadi kesalahan',
      })
    }
  }

  if (!can('access purchases')) {
    router.push('/dashboard')
    return <></>
  }

  return (
    <AppLayout
      title={title}
      headerAction={
        <div className="flex flex-row space-x-2">
          {can('create purchases') && (
            <Link href="purchases/new">
              <Button size="sm" className={`uppercase ${isBelowXs ? 'px-2' : ''}`}>
                {isBelowXs ? <PlusIcon size={18} /> : 'Tambah pembelian'}
              </Button>
            </Link>
          )}

          {can('force delete purchases') && (
            <Button
              variant="destructive"
              size="sm"
              className="uppercase"
              asChild
            >
              <Link href="purchases/trash">Sampah</Link>
            </Button>
          )}
        </div>
      }
    >
      <ContentLayout className="my-12 px-6 pb-6 sm:mx-6 lg:mx-8">
        <DataTable
          isValidating={isValidating}
          columns={purchaseColumns}
          data={purchases?.data}
          pagination={pagination}
          setPagination={setPagination}
          setFilter={setFilter}
          disabledContextMenu={disabledContextMenu}
          meta={{
            can,
            authUser,
            setDisabledContextMenu,
            handleGetAllId,
            handleExportData,
            mutate,
          }}
        />
      </ContentLayout>
    </AppLayout>
  )
}

export default withProtected(Purchases)
