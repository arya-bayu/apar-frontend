import { useAuth } from '@/hooks/useAuth'

import _ from 'lodash'
import AppLayout from '@/components/Layouts/AppLayout'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import withProtected from '@/hoc/withProtected'
import { DataTable } from '@/components/ui/data-table'
import { customerColumns } from './columns/CustomerColumns'
import CustomerDialog from './partials/CustomerDialog'
import { useCustomer } from '@/hooks/useCustomer'
import { ICustomer } from '@/types/customer'
import axios from '@/lib/axios'
import { AxiosError } from 'axios'
import { ToastAction } from "@/components/ui/toast"
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { PlusIcon, RotateCcw, Undo2 } from 'lucide-react'
import ContentLayout from '@/components/Layouts/ContentLayout'
import { useBreakpoint } from "@/hooks/useBreakpoint"

const Customers = () => {
  const {
    customers,
    mutate,
    isTrash,
    setIsTrash,
    isValidating,
    pagination,
    setPagination,
    setFilter,
  } = useCustomer()
  const { toast } = useToast()
  const title = isTrash ? 'Pelanggan / Sampah' : 'Pelanggan'
  const router = useRouter()
  const { authUser, can } = useAuth({ middleware: 'auth' })
  const [disabledContextMenu, setDisabledContextMenu] = useState(false)
  const { isBelowXs } = useBreakpoint('xs')

  useEffect(() => {
    const isTrashRoute = router.asPath.includes('/trash')
    setIsTrash(isTrashRoute)

    if (isTrashRoute && !can('force delete customers')) {
      router.push('../customers')
      setIsTrash(false)
    }
  }, [router.asPath])

  function isCustomerArray(arr: any[]): arr is ICustomer[] {
    return arr.every(item => typeof item === 'object' && item !== null)
  }

  const handleGetAllId = async () => {
    try {
      const response = await axios.get(
        `api/v1/customers${isTrash ? '/trash' : ''}/?columns[]=id`,
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

  const handleRestore = async (customers: ICustomer[] | string[]) => {
    try {
      const id = isCustomerArray(customers)
        ? customers.map(customer => customer.id)
        : customers

      const response = await axios.put('api/v1/customers/trash', {
        id: id,
      })

      mutate()

      if (response) {
        const successes = response.data.data.successes
        const failures = response.data.data.failures

        if (id.length > 1) {
          if (failures.length === 0) {
            toast({
              variant: 'success',
              title: 'Data pelanggan berhasil dipulihkan',
              description: `${successes.length} data telah dipulihkan ke daftar pelanggan`,
            })
          } else {
            toast({
              variant: 'warning',
              title: 'Sebagian gagal dipulihkan',
              description: `${failures.length + '/' + id.length
                } data gagal dipulihkan ke daftar pelanggan`,
              action: (
                <ToastAction
                  altText="Coba lagi"
                  onClick={() =>
                    handleRestore(failures.map((failure: any) => failure.id))
                  }
                  asChild
                >
                  <Button variant="ghost" size="icon">
                    <RotateCcw />
                  </Button>
                </ToastAction>
              ),
            })
          }
        } else {
          toast({
            variant: 'success',
            title: 'Data pelanggan berhasil dipulihkan.',
            description: `${isCustomerArray(customers) && successes[0]['name']
              } telah dipulihkan ke daftar pelanggan`,
          })
        }
      }
    } catch (error) {
      const failures =
        error instanceof AxiosError && error.response?.data.errors

      if (failures) {
        toast({
          variant: 'destructive',
          title: 'Gagal',
          description:
            failures.length + ' data gagal dipulihkan ke daftar pelanggan' ??
            'Terjadi kesalahan',
          action: (
            <ToastAction
              altText="Coba lagi"
              onClick={() =>
                handleRestore(failures.map((failure: any) => failure.id))
              }
              asChild
            >
              <Button variant="ghost" size="icon">
                <RotateCcw />
              </Button>
            </ToastAction>
          ),
        })
      } else {
        toast({
          variant: 'destructive',
          title: 'Gagal',
          description:
            error instanceof AxiosError
              ? error.response?.data.status
              : 'Terjadi kesalahan',
        })
      }
    }
  }

  const handleDelete = async (data: ICustomer[] | string[]) => {
    try {
      const id = isCustomerArray(data)
        ? data.map(customer => customer.id)
        : data

      await axios.delete(`api/v1/customers${isTrash ? '/trash' : ''}`, {
        params: { id: id },
      })

      mutate()

      if (id.length > 1) {
        toast({
          variant: 'success',
          title: 'Data pelanggan berhasil dihapus',
          description: `${id.length} data telah ${isTrash
            ? 'dihapus secara permanen'
            : can('force delete customers')
              ? 'dipindahkan ke folder sampah'
              : 'dihapus'
            }`,
          action:
            !isTrash && can('restore customers') ? (
              <ToastAction
                altText="Batal"
                onClick={() => handleRestore(data)}
                asChild
              >
                <Button variant="ghost" size="icon">
                  <Undo2 />
                </Button>
              </ToastAction>
            ) : undefined,
        })
      } else {
        toast({
          variant: 'destructive',
          title: 'Data pelanggan berhasil dihapus.',
          description: `${isCustomerArray(data) ? data[0]['company_name'] : 'Data'
            } telah ${isTrash
              ? 'dihapus secara permanen'
              : can('force delete customers')
                ? 'dipindahkan ke folder sampah'
                : 'dihapus'
            }`,
          action:
            !isTrash && can('restore customers') ? (
              <ToastAction
                altText="Batal"
                onClick={() => handleRestore(data)}
                asChild
              >
                <Button variant="ghost" >
                  Undo
                </Button>
              </ToastAction>
            ) : undefined,
        })
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Gagal',
        description:
          error instanceof AxiosError
            ? error.response?.data.status
            : 'Terjadi kesalahan',
      })
    }
  }

  const handleEmptyTrash = async () => {
    if (!isTrash) return
    try {
      await axios.delete(`api/v1/customers/trash/empty`)
      mutate()

      toast({
        variant: 'success',
        title: 'Folder sampah berhasil dikosongkan',
        description:
          'Seluruh data pelanggan pada folder Sampah telah dihapus secara permanen',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Gagal',
        description:
          error instanceof AxiosError
            ? error.response?.data.status
            : 'Terjadi kesalahan',
      })
    }
  }

  const handleExportData = async (
    fileType: 'XLSX' | 'CSV' | 'PDF',
    id?: ICustomer['id'][],
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
      const response = await axios.get(`api/v1/customers/export`, {
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

      if (fileType === 'PDF') {
        const blob = new Blob([response.data], {
          type: 'application/pdf',
        })
        const url = URL.createObjectURL(blob)
        const printWindow = window.open(url)
        printWindow?.print()
      } else {
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
      }
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

  if (!can('access customers')) {
    router.push('/dashboard')
    return <></>
  } else if (isTrash === undefined) {
    return <></>
  }

  return (
    <AppLayout
      title={title}
      headerAction={
        isTrash ? (
          customers?.data.rows.length > 0 && (
            <Button
              onClick={() => handleEmptyTrash()}
              size="sm"
              variant="destructive"
              className="uppercase"
            >
              Kosongkan
            </Button>
          )
        ) : (
          <div className="flex flex-row space-x-2">
            {can('create customers') && (
              <CustomerDialog mutate={mutate}>
                <Button size="sm" className={`uppercase ${isBelowXs ? 'px-2' : ''}`}>
                  {isBelowXs ? <PlusIcon size={18} /> : 'Tambah pelanggan'}
                </Button>
              </CustomerDialog>
            )}

            {can('force delete customers') && (
              <Button
                variant="destructive"
                size="sm"
                className="uppercase"
                asChild
              >
                <Link href="customers/trash">Sampah</Link>
              </Button>
            )}
          </div>
        )
      }
    >
      <ContentLayout className="my-12 px-6 pb-6 sm:mx-6 lg:mx-8">
        <DataTable
          permissions={{
            delete: can('delete customers'),
            forceDelete: can('force delete customers'),
            restore: can('restore customers'),
          }}
          isTrash={isTrash}
          setIsTrash={setIsTrash}
          isValidating={isValidating}
          columns={customerColumns}
          data={customers?.data}
          pagination={pagination}
          setPagination={setPagination}
          setFilter={setFilter}
          disabledContextMenu={disabledContextMenu}
          meta={{
            can,
            authUser,
            isTrash,
            setDisabledContextMenu,
            handleDelete,
            handleRestore,
            handleGetAllId,
            handleExportData,
            mutate,
          }}
        />
      </ContentLayout>
    </AppLayout>
  )
}

export default withProtected(Customers)
