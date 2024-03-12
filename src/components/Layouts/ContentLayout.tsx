import withProtected from '@/hoc/withProtected'
import { PropsWithChildren } from 'react'

interface IContentLayout {
  className?: string
}
const ContentLayout = ({
  children,
  className,
}: PropsWithChildren<IContentLayout>) => {
  return (
    <div className="mx-auto max-w-7xl">
      <div
        className={`overflow-hidden border-none bg-white dark:border-[0.1px] dark:border-zinc-700 dark:bg-zinc-950 sm:rounded-lg sm:border-solid sm:shadow-sm ${className}`}
      >
        {children}
      </div>
    </div>
  )
}

export default withProtected(ContentLayout)
