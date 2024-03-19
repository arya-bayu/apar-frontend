import AppLayout from '@/components/Layouts/AppLayout'
import { useState, useEffect } from 'react'
import withProtected from '@/hoc/withProtected'
import ProfileTabLayout from './partials/ProfileTabLayout'
import { Button } from '@/components/ui/button'
import ContentLayout from '@/components/Layouts/ContentLayout'
import UpdateProfileInformationForm from './partials/UpdateProfileInformationForm'
import DeleteUserForm from './partials/DeleteUserForm'
import UpdateProfilePhotoForm from './partials/UpdateProfilePhotoForm'

const Profile = () => {
  const [openUserDeletionModal, setOpenUserDeletionModal] = useState(false)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.has('deleteAccount')) {
      setOpenUserDeletionModal(true)
    }
  })

  return (
    <AppLayout title="Profil">
      <ProfileTabLayout>
        <ContentLayout className="flex flex-col space-y-12 overflow-visible px-2 py-8 pb-12 shadow-none dark:border-none dark:bg-transparent sm:flex-row sm:space-x-8 sm:space-y-0 sm:px-8">
          <div className="sm:w-[40%] md:w-[30%]">
            <UpdateProfilePhotoForm />
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
        </ContentLayout>
      </ProfileTabLayout>
    </AppLayout>
  )
}

export default withProtected(Profile)
