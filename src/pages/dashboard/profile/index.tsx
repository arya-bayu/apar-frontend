import AppLayout from '@/components/Layouts/AppLayout'
import { useState, useEffect } from 'react'
import withProtected from '@/hoc/withProtected'
import ProfileTabLayout from './partials/ProfileTabLayout'
import UpdateProfileInformationForm from './partials/UpdateProfileInformationForm'
import DeleteUserForm from './partials/DeleteUserForm'
import Dropzone, { CustomFile } from "@/components/ImageUploadHelpers/Dropzone"
import { useAuth } from "@/hooks/useAuth"
import { IImage } from "@/types/image"
import { toast } from "@/components/ui/use-toast"
import axios, { csrf } from "@/lib/axios"
import { AxiosError } from "axios"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const Profile = () => {
  const [openUserDeletionModal, setOpenUserDeletionModal] = useState(false)
  const { authUser, mutate } = useAuth({ middleware: 'auth' });
  const [photo, setPhoto] = useState<IImage | undefined>(undefined);

  useEffect(() => {
    if (authUser?.photo) {
      setPhoto(authUser.photo)
    } else {
      setPhoto(undefined)
    }
  }, [authUser?.photo])

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.has('deleteAccount')) {
      setOpenUserDeletionModal(true)
    }
  })

  const handleImagesChange = async (files: CustomFile[]) => {
    if (files.length > 0) {

      try {
        await csrf()

        const formData = new FormData()
        formData.append('photo', files[0])

        await axios.post('api/v1/profile/photo', formData)

        mutate()
        toast({
          variant: 'success',
          title: 'Sukses',
          description: 'Foto profil telah berhasil diperbarui.',
        })
      } catch (error) {
        if (error instanceof AxiosError) {
          const errStatus = error.response?.status
          const errors = error.response?.data.errors

          if (errStatus === 422 && errors.photo[0]) {
            toast({
              variant: 'destructive',
              title: 'Gagal mengunggah foto',
              description: errors.photo[0],
            })
          } else {
            toast({
              variant: 'destructive',
              title: 'Terjadi kesalahan',
            })
          }
        }
      }
    } else {
      try {
        await axios.delete('api/v1/profile/photo')
        mutate()
        toast({
          variant: 'default',
          title: 'Foto profil berhasil dihapus',
          description: `Foto profil telah dihapus secara permanen`,
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
    mutate()
  };

  return (
    <AppLayout
      customHeaderTitle={<Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-bold">Profil</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>}
      title={"Profil"}>
      <ProfileTabLayout>
        <div className="flex flex-col space-y-12 overflow-visible px-2 py-8 pb-12 shadow-none dark:border-none dark:bg-transparent sm:flex-row sm:space-x-8 sm:space-y-0 sm:px-8">
          <div className="sm:w-[40%] md:w-[30%]">
            {/* <UpdateProfilePhotoForm /> */}
            <Dropzone
              singleImage={photo}
              onImagesChange={handleImagesChange}
            />
          </div>
          <div className="flex flex-col space-y-8 sm:w-[60%] md:w-[70%]">
            <div className="rounded-lg border-[1.5px] border-none border-zinc-50 p-4 dark:border-zinc-700 sm:border-solid sm:p-6 sm:shadow-sm sm:dark:border-[0.1px]">
              <div className="max-w-xl">
                <UpdateProfileInformationForm />
              </div>
            </div>

            <div className="border-[1.5px] border-none border-zinc-50 p-4 dark:border-zinc-700 sm:rounded-lg sm:border-solid sm:p-6 sm:shadow-sm sm:dark:border-[0.1px]">
              <div className="max-w-xl">
                <DeleteUserForm forceUserDeletion={openUserDeletionModal} />
              </div>
            </div>
          </div>
        </div>
      </ProfileTabLayout>
    </AppLayout>
  )
}

export default withProtected(Profile)
