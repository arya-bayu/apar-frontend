import Tabbar, { TabbarItem } from '@/components/ui/Tabbar'
import TabbarLayout from '@/components/Layouts/ContentLayout'
import withProtected from '@/hoc/withProtected'
import { useAuth } from '@/hooks/useAuth'
import { PropsWithChildren } from 'react'
import ContentLayout from '@/components/Layouts/ContentLayout'

interface IProfileTab {
  className?: string
}
const ProfileTabLayout = ({
  children,
  className,
}: PropsWithChildren<IProfileTab>) => {
  const { authUser } = useAuth({ middleware: 'auth' })

  if (!authUser) return <></>

  return (
    <ContentLayout
      className={`flex flex-col sm:mx-6 sm:my-12 lg:mx-8 ${className}`}
    >
      <Tabbar>
        <TabbarItem href="/dashboard/profile" text="Informasi Akun" />
        <TabbarItem href="/dashboard/profile/password" text="Ubah Kata Sandi" />
      </Tabbar>
      {children}
    </ContentLayout>
  )
}

export default withProtected(ProfileTabLayout)
