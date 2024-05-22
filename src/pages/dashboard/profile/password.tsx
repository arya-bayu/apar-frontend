import AppLayout from '@/components/Layouts/AppLayout'
import { useState, useEffect } from 'react'
import withProtected from '@/hoc/withProtected'
import ProfileTabLayout from './partials/ProfileTabLayout'
import UpdatePasswordForm from './partials/UpdatePasswordForm'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"


const UpdatePassword = () => {
  const [openUserDeletionModal, setOpenUserDeletionModal] = useState(false)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.has('deleteAccount')) {
      setOpenUserDeletionModal(true)
    }
  })

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
      title="Profil">
      <ProfileTabLayout>
        <div className="w-full p-8 pb-12">
          <UpdatePasswordForm />
        </div>
      </ProfileTabLayout>
    </AppLayout>
  )
}

export default withProtected(UpdatePassword)
