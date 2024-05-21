import { useAuth } from '@/hooks/useAuth'

import _ from 'lodash'
import AppLayout from '@/components/Layouts/AppLayout'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import withProtected from '@/hoc/withProtected'
import { DataTable } from '@/components/ui/data-table'
import { productColumns } from '../../../components/Columns/ProductColumns'
import ProductDialog from './partials/ProductDialog'
import { useProduct } from '@/hooks/useProduct'
import { IProduct } from '@/types/product'
import axios from '@/lib/axios'
import { AxiosError } from 'axios'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ToastAction } from "@/components/ui/toast"
import { PlusIcon, RotateCcw, Undo2 } from 'lucide-react'
import ContentLayout from '@/components/Layouts/ContentLayout'
import { useBreakpoint } from "@/hooks/useBreakpoint"
import CustomAlertDialog from "@/components/CustomAlertDialog"
import { SupplierCombobox } from "@/components/Combobox/SupplierCombobox"
import CustomExportDialog from "@/components/CustomExportDialog"
import { StatusCombobox } from "@/components/Combobox/StatusCombobox"
import { CategoryCombobox } from "@/components/Combobox/CategoryCombobox"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const Products = () => {
  const {
    products,
    mutate,
    isTrash,
    setIsTrash,
    isValidating,
    pagination,
    setPagination,
    setFilter,
  } = useProduct()
  const { toast } = useToast()
  const title = isTrash ? 'Produk / Sampah' : 'Produk'
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

  const [exportDialog, setExportDialog] = useState(false)
  const [exportDialogDescription, setExportDialogDescription] = useState<string>("")
  const [exportIds, setExportIds] = useState<IProduct['id'][] | undefined>(undefined);
  const [exportFileType, setExportFileType] = useState<"XLSX" | "CSV">("XLSX");

  const [selectedStatusId, setSelectedStatusId] = useState<number | null>(null);
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  useEffect(() => {
    const isTrashRoute = router.asPath.includes('/trash')
    setIsTrash(isTrashRoute)

    if (isTrashRoute && !can('force delete products')) {
      router.push('../products')
      setIsTrash(false)
    }

  }, [router.asPath])

  function isProductArray(arr: any[]): arr is IProduct[] {
    return arr.every(item => typeof item === 'object' && item !== null)
  }

  const handleGetAllId = async () => {
    try {
      const response = await axios.get(
        `api/v1/products${isTrash ? '/trash' : ''}/?columns=id`,
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

  const handleRestore = async (products: IProduct[] | string[]) => {
    try {
      const id = isProductArray(products)
        ? products.map(product => product.id)
        : products

      const response = await axios.put('api/v1/products/trash', {
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
              title: 'Data produk berhasil dipulihkan',
              description: `${successes.length} data telah dipulihkan ke daftar produk`,
            })
          } else {
            toast({
              variant: 'warning',
              title: 'Sebagian gagal dipulihkan',
              description: `${failures.length + '/' + id.length
                } data gagal dipulihkan ke daftar produk`,
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
            title: 'Data produk berhasil dipulihkan.',
            description: `${isProductArray(products) && successes[0]['name']
              } telah dipulihkan ke daftar produk`,
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
            failures.length + ' data gagal dipulihkan ke daftar produk' ??
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

  const handleDelete = async (data: IProduct[] | string[]) => {
    const id = isProductArray(data)
      ? data.map(produk => produk.id)
      : data


    setAlertTitle("Hapus Produk?")
    setAlertDescription(`
      ${(isProductArray(data) ? data[0]["name"] : data.length + ' data ')}
      akan ${isTrash
        ? 'dihapus secara permanen'
        : can('force delete products')
          ? 'dipindahkan ke folder sampah'
          : 'dihapus dari tabel produk'
      }`
    )
    setAlertContinueAction(() => {
      return async () => {
        try {
          await axios.delete(`api/v1/products${isTrash ? '/trash' : ''}`, {
            params: { id: id },
          })

          mutate()

          if (id.length > 1) {
            toast({
              variant: 'default',
              title: 'Data produk berhasil dihapus',
              description: `${id.length} data telah ${isTrash
                ? 'dihapus secara permanen'
                : can('force delete products')
                  ? 'dipindahkan ke folder sampah'
                  : 'dihapus'
                }`,
              action:
                !isTrash && can('restore products') ? (
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
              title: 'Data produk berhasil dihapus.',
              description: `${isProductArray(data) ? data[0]['name'] : 'Data'
                } telah ${isTrash
                  ? 'dihapus secara permanen'
                  : can('force delete products')
                    ? 'dipindahkan ke folder sampah'
                    : 'dihapus'
                }`,
              action:
                !isTrash && can('restore products') ? (
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
            setAlertTitle("Nonaktifkan Produk?")
            setAlertDescription(`Data produk masih terasosiasi dengan data pembelian atau invoice.`)
            setAlertContinueAction(() => {
              return () => {
                axios.put(`/api/v1/products/update-status`, {
                  'product_ids': id,
                  'active': false
                }).then(() => {
                  mutate()
                  toast({
                    variant: 'default',
                    title: 'Sukses',
                    description: `${isProductArray(data) ? data[0]['name'] : data.length + ' produk'} telah dinonaktifkan.`
                  })
                })
              }
            })

            setAlert(true)
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
          await axios.delete(`api/v1/products/trash/empty`)
          mutate()

          toast({
            variant: 'success',
            title: 'Folder sampah berhasil dikosongkan',
            description:
              'Seluruh data produk pada folder Sampah telah dihapus secara permanen',
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
    id?: IProduct['id'][]
  ) => {
    setExportFileType(fileType)
    setExportIds(id)
    setExportDialogDescription(`Filter ${id?.length ?? products?.data?.totalRowCount} data yang akan di export`)
    setExportDialog(true)
  }

  if (!can('access products')) {
    router.push('/dashboard')
    return <></>
  } else if (isTrash === undefined) {
    return <></>
  }

  return (
    <AppLayout
      title={title}
      customHeaderTitle={<Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          {isTrash ? (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard/products">Produk</BreadcrumbLink>
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
                <BreadcrumbPage className="font-bold">Produk</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>}
      headerAction={
        isTrash ? (
          products?.data.rows.length > 0 && (
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
            {can('create products') && (
              <ProductDialog mutate={mutate}>
                <Button size="sm" className={`uppercase ${isBelowXs ? 'px-2' : ''}`}>
                  {isBelowXs ? <PlusIcon size={18} /> : 'Tambah produk'}
                </Button>
              </ProductDialog>
            )}

            {can('force delete products') && (
              <Button
                variant="destructive"
                size="sm"
                className="uppercase"
                asChild
              >
                <Link href="products/trash">Sampah</Link>
              </Button>
            )}
          </div>
        )
      }
    >
      <ContentLayout className="my-12 px-6 pb-6 sm:mx-6 lg:mx-8">
        <DataTable
          permissions={{
            delete: can('delete products'),
            forceDelete: can('force delete products'),
            restore: can('restore products'),
          }}
          isTrash={isTrash}
          setIsTrash={setIsTrash}
          isValidating={isValidating}
          columns={productColumns}
          data={products?.data}
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
      <CustomExportDialog
        open={exportDialog}
        onOpenChange={setExportDialog}
        description={exportDialogDescription}
        onContinue={async () => {
          const params = {
            id: exportIds,
            categoryId: selectedCategoryId,
            supplierId: selectedSupplierId,
            fileType: exportFileType,
          }
          try {
            const response = await axios.get(`api/v1/products/export`, {
              responseType: 'blob',
              params: {
                ..._.pickBy(params, value => !!value),
                status: selectedStatusId && selectedStatusId - 1,
              }
            })

            const moment = require('moment')

            const appName = process.env.NEXT_PUBLIC_APP_NAME

            const date = moment().format('YYYY-MM-DD')
            const time = moment().format('HHmmss')

            let fileName = title

            if (exportIds && exportIds.length > 0) {
              fileName += ' (Custom Export)'
            }

            fileName += ` ${date} T${time} ${appName}.${exportFileType?.toLowerCase()}`

            const url = URL.createObjectURL(
              new Blob([response.data], {
                type:
                  exportFileType === 'XLSX'
                    ? 'application/vnd.ms-excel'
                    : exportFileType === 'CSV'
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
        }
        title="Export Data"
      >
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col justify-start gap-1">
            <label
              className="text-sm font-bold text-start"
            >
              Status
            </label>
            <StatusCombobox
              hasReset={selectedStatusId ? true : false}
              value={selectedStatusId}
              onSelect={(statusId) => {
                setSelectedStatusId(statusId);
              }}
              statusData={[
                { id: 1, name: "Nonaktif" },
                { id: 2, name: "Aktif" },
              ]}
            />
          </div>
          <div className="flex flex-col justify-start gap-1">
            <label
              className="text-sm font-bold text-start"
            >
              Kategori
            </label>
            <CategoryCombobox
              hasReset={selectedCategoryId ? true : false}
              value={selectedCategoryId}
              onSelect={(categoryId) => {
                setSelectedCategoryId(categoryId);
              }}
            />
          </div>
          <div className="flex flex-col justify-start gap-1">
            <label
              className="text-sm font-bold text-start"
            >
              Supplier
            </label>
            <SupplierCombobox
              hasReset={selectedSupplierId ? true : false}
              value={selectedSupplierId}
              onSelect={(supplierId) => {
                setSelectedSupplierId(supplierId);
              }}
            />
          </div>
        </div>
      </CustomExportDialog>
    </AppLayout>
  )
}

export default withProtected(Products)
