import { useAuth } from '@/hooks/useAuth'

import _ from 'lodash'
import AppLayout from '@/components/Layouts/AppLayout'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import withProtected from '@/hoc/withProtected'
import { DataTable } from '@/components/ui/data-table'
import { supplierColumns } from '../../../components/Columns/SupplierColumns'
import SupplierDialog from './partials/SupplierDialog'
import { useSupplier } from '@/hooks/useSupplier'
import { ISupplier } from '@/types/supplier'
import axios from '@/lib/axios'
import { AxiosError } from 'axios'
import { ToastAction } from "@/components/ui/toast"
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, PlusIcon, RotateCcw, Undo2 } from 'lucide-react'
import ContentLayout from '@/components/Layouts/ContentLayout'
import { useBreakpoint } from "@/hooks/useBreakpoint"
import CustomAlertDialog from "@/components/CustomAlertDialog"

const Suppliers = () => {
  const {
    suppliers,
    mutate,
    isTrash,
    setIsTrash,
    isValidating,
    pagination,
    setPagination,
    setFilter,
  } = useSupplier()
  const { toast } = useToast()
  const title = isTrash ? 'Supplier / Sampah' : 'Supplier'
  const router = useRouter()
  const { authUser, can } = useAuth({ middleware: 'auth' })
  const [disabledContextMenu, setDisabledContextMenu] = useState(false)
  const { isBelowXs } = useBreakpoint('xs')

  const [alert, setAlert] = useState(false)
  const [alertTitle, setAlertTitle] = useState<string>("")
  const [alertDescription, setAlertDescription] = useState<string>("")
  const [alertContinueAction, setAlertContinueAction] = useState(() => {
    return () => { };
  });

  useEffect(() => {
    const isTrashRoute = router.asPath.includes('/trash')
    setIsTrash(isTrashRoute)

    if (isTrashRoute && !can('force delete suppliers')) {
      router.push('../suppliers')
      setIsTrash(false)
    }
  }, [router.asPath])

  function isSupplierArray(arr: any[]): arr is ISupplier[] {
    return arr.every(item => typeof item === 'object' && item !== null)
  }

  const handleGetAllId = async () => {
    try {
      const response = await axios.get(
        `api/v1/suppliers${isTrash ? '/trash' : ''}/?columns=id`,
      )

      return response.data.data
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

  const handleRestore = async (suppliers: ISupplier[] | string[]) => {
    try {
      const id = isSupplierArray(suppliers)
        ? suppliers.map(supplier => supplier.id)
        : suppliers

      const response = await axios.put('api/v1/suppliers/trash', {
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
              title: 'Data supplier berhasil dipulihkan',
              description: `${successes.length} data telah dipulihkan ke daftar supplier`,
            })
          } else {
            toast({
              variant: 'warning',
              title: 'Sebagian gagal dipulihkan',
              description: `${failures.length + '/' + id.length
                } data gagal dipulihkan ke daftar supplier`,
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
            title: 'Data supplier berhasil dipulihkan.',
            description: `${isSupplierArray(suppliers) && successes[0]['name']
              } telah dipulihkan ke daftar supplier`,
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
            failures.length + ' data gagal dipulihkan ke daftar supplier' ??
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

  const handleDelete = async (data: ISupplier[] | string[]) => {
    const id = isSupplierArray(data)
      ? data.map(supplier => supplier.id)
      : data


    setAlertTitle("Hapus Supplier?")
    setAlertDescription(`
      ${(isSupplierArray(data) ? data[0]["name"] : data.length + ' data ')}
      akan ${isTrash
        ? 'dihapus secara permanen'
        : can('force delete suppliers')
          ? 'dipindahkan ke folder sampah'
          : 'dihapus dari tabel supplier'
      }`
    )
    setAlertContinueAction(() => {
      return async () => {
        try {
          await axios.delete(`api/v1/suppliers${isTrash ? '/trash' : ''}`, {
            params: { id: id },
          })

          mutate()

          if (id.length > 1) {
            toast({
              variant: 'default',
              title: 'Data supplier berhasil dihapus',
              description: `${id.length} data telah ${isTrash
                ? 'dihapus secara permanen'
                : can('force delete suppliers')
                  ? 'dipindahkan ke folder sampah'
                  : 'dihapus'
                }`,
              action:
                !isTrash && can('restore suppliers') ? (
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
              variant: 'default',
              title: 'Data supplier berhasil dihapus.',
              description: `${isSupplierArray(data) ? data[0]['name'] : 'Data'
                } telah ${isTrash
                  ? 'dihapus secara permanen'
                  : can('force delete suppliers')
                    ? 'dipindahkan ke folder sampah'
                    : 'dihapus'
                }`,
              action:
                !isTrash && can('restore suppliers') ? (
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
          }
        } catch (error) {
          if (error instanceof AxiosError && error.response?.data.code === 409) {
            toast({
              variant: 'destructive',
              title: 'Gagal',
              description: "Supplier masih terasosiasi dengan beberapa data produk dan pembelian.",
            })
          }
          else {
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
    })

    setAlert(true)
  }

  const handleEmptyTrash = async () => {
    if (!isTrash) return

    setAlertTitle("Kosongkan Sampah?")
    setAlertDescription(`Seluruh data akan dihapus secara permanen`)
    setAlertContinueAction(() => {
      return async () => {
        try {
          await axios.delete(`api/v1/suppliers/trash/empty`)
          mutate()

          toast({
            variant: 'success',
            title: 'Folder sampah berhasil dikosongkan',
            description:
              'Seluruh data suppliers pada folder Sampah telah dihapus secara permanen',
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
    })

    setAlert(true)
  }

  const handleExportData = async (
    fileType: 'XLSX' | 'CSV',
    id?: ISupplier['id'][],
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
      const response = await axios.get(`api/v1/suppliers/export`, {
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

  if (!can('access suppliers')) {
    router.push('/dashboard')
    return <></>
  } else if (isTrash === undefined) {
    return <></>
  }

  return (
    <AppLayout
      actionBtn={isTrash ?
        <Button
          variant="secondary"
          size="icon"
          className="uppercase"
          onClick={() => {
            router.push('/dashboard/suppliers/')
          }}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        : undefined}
      title={title}
      headerAction={
        isTrash ? (
          suppliers?.data.rows.length > 0 && (
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
          <div className="flex flex-row space-x-2 ml-4">
            {can('create suppliers') && (
              <SupplierDialog mutate={mutate}>
                <Button size="sm" className={`uppercase ${isBelowXs ? 'px-2' : ''}`}>
                  {isBelowXs ? <PlusIcon size={18} /> : 'Tambah Supplier'}
                </Button>
              </SupplierDialog>
            )}

            {can('force delete suppliers') && (
              <Button
                variant="destructive"
                size="sm"
                className="uppercase"
                asChild
              >
                <Link href="suppliers/trash">Sampah</Link>
              </Button>
            )}
          </div>
        )
      }
    >
      <ContentLayout className="my-12 px-6 pb-6 sm:mx-6 lg:mx-8">
        <DataTable
          permissions={{
            delete: can('delete suppliers'),
            forceDelete: can('force delete suppliers'),
            restore: can('restore suppliers'),
          }}
          isTrash={isTrash}
          setIsTrash={setIsTrash}
          isValidating={isValidating}
          columns={supplierColumns}
          data={suppliers?.data}
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
      <CustomAlertDialog
        open={alert}
        onOpenChange={setAlert}
        title={alertTitle}
        description={alertDescription}
        onContinue={alertContinueAction}
      />
    </AppLayout>
  )
}

export default withProtected(Suppliers)
