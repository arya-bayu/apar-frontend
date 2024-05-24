import { useAuth } from '@/hooks/useAuth'

import _, { set } from 'lodash'
import AppLayout from '@/components/Layouts/AppLayout'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import withProtected from '@/hoc/withProtected'
import { DataTable } from '@/components/ui/data-table'
import { unitColumns } from '../../../components/Columns/UnitColumns'
import UnitDialog from './partials/UnitDialog'
import { useUnit } from '@/hooks/useUnit'
import { IUnit } from '@/types/unit'
import axios from '@/lib/axios'
import { AxiosError } from 'axios'
import { ToastAction } from "@/components/ui/toast"
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Loader2, PlusIcon, RotateCcw, Undo2 } from 'lucide-react'
import ContentLayout from '@/components/Layouts/ContentLayout'
import { useBreakpoint } from "@/hooks/useBreakpoint"
import CustomAlertDialog from "@/components/CustomAlertDialog"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const Units = () => {
  const {
    units,
    mutate,
    isTrash,
    setIsTrash,
    isValidating,
    pagination,
    setPagination,
    setFilter,
    isLoading
  } = useUnit()
  const { toast } = useToast()
  const title = isTrash ? 'Unit / Sampah' : 'Unit'
  const router = useRouter()
  const { authUser, can } = useAuth({ middleware: 'auth' })
  const [disabledContextMenu, setDisabledContextMenu] = useState(false)
  const { isBelowSm } = useBreakpoint('sm')

  const [alert, setAlert] = useState(false)
  const [alertTitle, setAlertTitle] = useState<string>("")
  const [alertDescription, setAlertDescription] = useState<string>("")
  const [alertContinueAction, setAlertContinueAction] = useState(() => {
    return () => { };
  });

  useEffect(() => {
    const isTrashRoute = router.asPath.includes('/trash')
    setIsTrash(isTrashRoute)

    if (isTrashRoute && !can('force delete units')) {
      router.push('../units')
      setIsTrash(false)
    }
  }, [router.asPath])

  function isUnitArray(arr: any[]): arr is IUnit[] {
    return arr.every(item => typeof item === 'object' && item !== null)
  }

  const handleGetAllId = async () => {
    try {
      const response = await axios.get(
        `api/v1/units${isTrash ? '/trash' : ''}/?columns=id`,
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

  const handleRestore = async (units: IUnit[] | string[]) => {
    try {
      const id = isUnitArray(units)
        ? units.map(unit => unit.id)
        : units

      const response = await axios.put('api/v1/units/trash', {
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
              title: 'Data unit berhasil dipulihkan',
              description: `${successes.length} data telah dipulihkan ke daftar unit`,
            })
          } else {
            toast({
              variant: 'warning',
              title: 'Sebagian gagal dipulihkan',
              description: `${failures.length + '/' + id.length
                } data gagal dipulihkan ke daftar unit`,
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
            title: 'Data unit berhasil dipulihkan.',
            description: `${isUnitArray(units) && successes[0]['name']
              } telah dipulihkan ke daftar unit`,
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
            failures.length + ' data gagal dipulihkan ke daftar unit' ??
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

  const handleDelete = async (data: IUnit[] | string[]) => {
    const id = isUnitArray(data)
      ? data.map(unit => unit.id)
      : data


    setAlertTitle("Hapus Unit?")
    setAlertDescription(`
      ${(isUnitArray(data) ? data[0]["name"] : data.length + ' data ')}
      akan ${isTrash
        ? 'dihapus secara permanen'
        : can('force delete units')
          ? 'dipindahkan ke folder sampah'
          : 'dihapus dari tabel unit'
      }`
    )
    setAlertContinueAction(() => {
      return async () => {
        try {
          await axios.delete(`api/v1/units${isTrash ? '/trash' : ''}`, {
            params: { id: id },
          })

          mutate()

          if (id.length > 1) {
            toast({
              variant: 'default',
              title: 'Data unit berhasil dihapus',
              description: `${id.length} data telah ${isTrash
                ? 'dihapus secara permanen'
                : can('force delete units')
                  ? 'dipindahkan ke folder sampah'
                  : 'dihapus'
                }`,
              action:
                !isTrash && can('restore units') ? (
                  <ToastAction
                    altText="Restore"
                    onClick={async () => {
                      const restoreToast = toast({
                        title: 'Memulihkan...',
                        action: <ToastAction
                          disabled={true}
                          altText="Memulihkan..."
                          onClick={async (e) => {
                            e.preventDefault()
                          }}
                          asChild
                        >
                          <Button variant="ghost" size="icon">
                            <Loader2 className="animate-spin" />
                          </Button>
                        </ToastAction>
                      })
                      try {
                        await handleRestore(data)
                      } finally {
                        restoreToast.dismiss()
                      }

                    }}
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
              title: 'Data unit berhasil dihapus.',
              description: `${isUnitArray(data) ? data[0]['name'] : 'Data'
                } telah ${isTrash
                  ? 'dihapus secara permanen'
                  : can('force delete units')
                    ? 'dipindahkan ke folder sampah'
                    : 'dihapus'
                }`,
              action:
                !isTrash && can('restore units') ? (
                  <ToastAction
                    altText="Restore"
                    onClick={async () => {
                      const restoreToast = toast({
                        title: 'Memulihkan...',
                        action: <ToastAction
                          disabled={true}
                          altText="Memulihkan..."
                          onClick={async (e) => {
                            e.preventDefault()
                          }}
                          asChild
                        >
                          <Button variant="ghost" size="icon">
                            <Loader2 className="animate-spin" />
                          </Button>
                        </ToastAction>
                      })
                      try {
                        await handleRestore(data)
                      } finally {
                        restoreToast.dismiss()
                      }

                    }}
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
              description: "Unit masih terasosiasi dengan beberapa data produk.",
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
          await axios.delete(`api/v1/units/trash/empty`)
          mutate()

          toast({
            variant: 'success',
            title: 'Folder sampah berhasil dikosongkan',
            description:
              'Seluruh data unit pada folder Sampah telah dihapus secara permanen',
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
    id?: IUnit['id'][],
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
      const response = await axios.get(`api/v1/units/export`, {
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

  if (!can('access units')) {
    router.push('/dashboard')
    return <></>
  } else if (isTrash === undefined) {
    return <></>
  }

  return (
    <AppLayout
      customHeaderTitle={<Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          {isTrash ? (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard/units">Unit</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-bold">Sampah</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          ) : (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-bold">Unit</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>}
      title={title}
      headerAction={
        isTrash && !isValidating && !isLoading ? (
          units?.data.rows.length > 0 && (
            <Button
              onClick={() => handleEmptyTrash()}
              size="sm"
              variant="destructive"
              className="uppercase"
            >
              Kosongkan
            </Button>
          )
        ) : !isTrash && (
          <div className="flex flex-row space-x-2 ml-4">
            {can('create units') && (
              <UnitDialog mutate={mutate}>
                <Button size="sm" className={`uppercase ${isBelowSm ? 'px-2' : ''}`}>
                  {isBelowSm ? <PlusIcon size={18} /> : 'Tambah Unit'}
                </Button>
              </UnitDialog>
            )}

            {can('force delete units') && (
              <Button
                variant="destructive"
                size="sm"
                className="uppercase"
                asChild
              >
                <Link href="units/trash">Sampah</Link>
              </Button>
            )}
          </div>
        )
      }
    >
      <ContentLayout className="my-12 px-6 pb-6 sm:mx-6 lg:mx-8">
        <DataTable
          permissions={{
            delete: can('delete units'),
            forceDelete: can('force delete units'),
            restore: can('restore units'),
          }}
          isTrash={isTrash}
          setIsTrash={setIsTrash}
          isValidating={isValidating}
          columns={unitColumns}
          data={units?.data}
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

export default withProtected(Units)
