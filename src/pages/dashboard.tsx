import AppLayout from '@/components/Layouts/AppLayout'
import ContentLayout from '@/components/Layouts/ContentLayout'
import withProtected from '@/hoc/withProtected'

const Dashboard = () => {
  const title = 'Dashboard'
  return (
    <AppLayout title={title}>
      <ContentLayout className="my-12 sm:mx-6 lg:mx-8">
        <div className="w-auto p-6 text-gray-900 dark:text-gray-100">
          You're logged in!
        </div>
      </ContentLayout>
    </AppLayout>
  )
}

export default withProtected(Dashboard)
