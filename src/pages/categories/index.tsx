import { useAuth } from '@/hooks/useAuth'

import _ from 'lodash'
import AppLayout from '@/components/Layouts/AppLayout'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import withProtected from '@/hoc/withProtected'
import { DataTable } from '@/components/ui/data-table'
import { categoryColumns } from './columns/CategoryColumns'
import CategoryDialog from './partials/CategoryDialog'
import { useCategory } from '@/hooks/useCategory'
import { ICategory } from '@/types/category'
import axios from '@/lib/axios'
import { AxiosError } from 'axios'
import { ToastAction } from '@/components/ui/toast'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { PlusIcon, RotateCcw, Trash, Undo2 } from 'lucide-react'
import ContentLayout from '@/components/Layouts/ContentLayout'
import { useBreakpoint } from "@/hooks/useBreakpoint"

const Categories = () => {
  const {
    categories,
    mutate,
    isTrash,
    setIsTrash,
    isValidating,
    pagination,
    setPagination,
    setFilter,
  } = useCategory()
  const { toast } = useToast()
  const title = isTrash ? 'Kategori / Sampah' : 'Kategori'
  const router = useRouter()
  const { authUser, can } = useAuth({ middleware: 'auth' })
  const [disabledContextMenu, setDisabledContextMenu] = useState(false)
  const { isBelowXs } = useBreakpoint('xs')

  useEffect(() => {
    const isTrashRoute = router.asPath.includes('/trash')
    setIsTrash(isTrashRoute)

    if (isTrashRoute && !can('force delete categories')) {
      router.push('../categories')
      setIsTrash(false)
    }
  }, [router.asPath])

  function isCategoriesArray(arr: any[]): arr is ICategory[] {
    return arr.every(item => typeof item === 'object' && item !== null)
  }

  const handleGetAllId = async () => {
    try {
      const response = await axios.get(
        `api/v1/categories${isTrash ? '/trash' : ''}/?columns[]=id`,
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

  const handleRestore = async (categories: ICategory[] | string[]) => {
    try {
      const id = isCategoriesArray(categories)
        ? categories.map(category => category.id)
        : categories

      const response = await axios.put('api/v1/categories/trash', {
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
              title: 'Data kategori berhasil dipulihkan',
              description: `${successes.length} data telah dipulihkan ke daftar kategori`,
            })
          } else {
            toast({
              variant: 'warning',
              title: 'Sebagian gagal dipulihkan',
              description: `${failures.length + '/' + id.length
                } data gagal dipulihkan ke daftar kategori`,
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
            title: 'Data kategori berhasil dipulihkan.',
            description: `${isCategoriesArray(categories) && successes[0]['name']
              } telah dipulihkan ke daftar kategori`,
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
            failures.length + ' data gagal dipulihkan ke daftar kategori' ??
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

  const handleDelete = async (data: ICategory[] | string[]) => {
    try {
      const id = isCategoriesArray(data)
        ? data.map(category => category.id)
        : data

      await axios.delete(`api/v1/categories${isTrash ? '/trash' : ''}`, {
        params: { id: id },
      })

      mutate()

      if (id.length > 1) {
        toast({
          variant: 'success',
          title: 'Data kategori berhasil dihapus',
          description: `${id.length} data telah ${isTrash
            ? 'dihapus secara permanen'
            : can('force delete categories')
              ? 'dipindahkan ke folder sampah'
              : 'dihapus'
            }`,
          action:
            !isTrash && can('restore categories') ? (
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
          title: 'Data kategori berhasil dihapus.',
          description: `${isCategoriesArray(data) ? data[0]['name'] : 'Data'
            } telah ${isTrash
              ? 'dihapus secara permanen'
              : can('force delete categories')
                ? 'dipindahkan ke folder sampah'
                : 'dihapus'
            }`,
          action:
            !isTrash && can('restore categories') ? (
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
      await axios.delete(`api/v1/categories/trash/empty`)
      mutate()

      toast({
        variant: 'success',
        title: 'Folder sampah berhasil dikosongkan',
        description:
          'Seluruh data kategori pada folder Sampah telah dihapus secara permanen',
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

  if (!can('access categories')) {
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
          categories?.data.rows.length > 0 && (
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
            {can('create categories') && (
              <CategoryDialog mutate={mutate}>
                <Button size="sm" className={`uppercase ${isBelowXs ? 'px-2' : ''}`}>
                  {isBelowXs ? <PlusIcon size={18} /> : 'Tambah kategori'}
                </Button>
              </CategoryDialog>
            )}

            {can('force delete categories') && (
              <Button
                variant="destructive"
                size="sm"
                className="uppercase"
                asChild
              >
                <Link href="categories/trash">Sampah</Link>
              </Button>
            )}
          </div>
        )
      }
    >
      <ContentLayout className="my-12 px-6 pb-6 sm:mx-6 lg:mx-8">
        <DataTable
          permissions={{
            delete: can('delete categories'),
            forceDelete: can('force delete categories'),
            restore: can('restore categories'),
          }}
          isTrash={isTrash}
          setIsTrash={setIsTrash}
          isValidating={isValidating}
          columns={categoryColumns}
          data={categories?.data}
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
            mutate,
          }}
        />
      </ContentLayout>
    </AppLayout>
  )
}

export default withProtected(Categories)
