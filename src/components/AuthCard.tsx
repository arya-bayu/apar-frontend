import { PropsWithChildren } from 'react'
import Link from 'next/link'
import ApplicationLogo from './ApplicationLogo'

const AuthCard = ({ children }: PropsWithChildren) => (
  <div className="flex min-h-screen flex-col items-center bg-zinc-100 pt-6 dark:bg-zinc-900 sm:justify-center sm:pt-0">
    <div>
      <Link href="/">
        <ApplicationLogo className="h-20 w-20 fill-current text-red-500" />
      </Link>
    </div>

    <div className="mt-6 w-full overflow-hidden bg-zinc-50 px-6 py-4 shadow-md dark:bg-zinc-950 sm:max-w-md sm:rounded-lg">
      {children}
    </div>
  </div>
)

export default AuthCard
