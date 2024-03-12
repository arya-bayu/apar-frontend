import { useAuth } from '@/hooks/useAuth'
import { IUser } from '@/types/user'
import { useUsers } from '@/hooks/useUsers'

import AppLayout from '@/components/Layouts/AppLayout'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { useRouter } from 'next/router'
import InviteDialogForm from './partials/InviteDialogForm'
import withProtected from '@/hoc/withProtected'
import { Role } from '@/enums/Role'
import { DataTable } from '@/components/ui/data-table'
import { userColumns } from './partials/UserColumns'
import { AxiosError } from 'axios'
import axios from '@/lib/axios'
import ContentLayout from '@/components/Layouts/ContentLayout'

const Users = () => {
  const title = 'Pengguna'
  const router = useRouter()
  const { authUser, can } = useAuth({ middleware: 'auth' })
  const { mutate, users, isValidating, pagination, setPagination, setFilter } =
    useUsers()
  const { toast } = useToast()

  function isUserArray(arr: any[]): arr is IUser[] {
    return arr.every(item => typeof item === 'object' && item !== null)
  }

  const handleGetAllId = async () => {
    try {
      const response = await axios.get(`api/v1/users/?columns[]=id`)

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

  const handleDelete = async (data: IUser[] | string[]) => {
    let id = isUserArray(data) ? data.map(user => user.id) : data
    if (id.includes(String(authUser?.id)) || id.includes(authUser?.id)) {
      router.push('/profile?deleteAccount')
      if (id.length > 1) {
        id = id.filter(id => id !== String(authUser?.id))
      } else {
        return
      }
    }

    try {
      await axios.delete('api/v1/users', {
        params: { id: id },
      })

      mutate()

      if (id.length > 1) {
        toast({
          variant: 'success',
          title: 'Akun pengguna berhasil dihapus',
          description: `${id.length} akun telah dihapus secara permanen`,
        })
      } else {
        toast({
          variant: 'success',
          title: 'Akun pengguna berhasil dihapus.',
          description: `${
            isUserArray(data) ? data[0]['name'] : 'Data'
          } telah dihapus secara permanen`,
        })
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

  const handleUpdateRole = async (data: IUser[] | string[], role: Role) => {
    try {
      let id = isUserArray(data) ? data.map(user => user.id) : data

      if (id.includes(String(authUser?.id))) {
        toast({
          title: 'Gagal',
          description: 'Anda tidak bisa mengubah role akun sendiri',
        })
      }

      const response = await axios.put(`api/v1/users/${id}/role`, {
        role: role,
      })

      mutate()

      toast({
        variant: 'success',
        title: `Role ${response.data.data.name} Diperbarui`,
        description: `Role pengguna berhasil diperbarui menjadi ${response.data.data.role}.`,
      })
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

  if (!can('access users')) {
    router.push('/dashboard')
    return <></>
  }

  return can('access users') ? (
    <AppLayout
      title={title}
      headerAction={
        can('create invitations') && (
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">INVITE USER</Button>
            </DialogTrigger>
            <InviteDialogForm />
          </Dialog>
        )
      }
    >
      <ContentLayout className="my-12 px-6 pb-6 sm:mx-6 lg:mx-8">
        {can('access users') && (
          <DataTable
            permissions={{
              delete: can('delete users'),
            }}
            isValidating={isValidating}
            columns={userColumns}
            data={users?.data}
            pagination={pagination}
            setPagination={setPagination}
            setFilter={setFilter}
            meta={{
              can,
              mutate,
              authUser,
              handleGetAllId,
              handleDelete,
              handleUpdateRole,
            }}
          />
        )}
      </ContentLayout>
    </AppLayout>
  ) : (
    <></>
  )
}

export default withProtected(Users)
