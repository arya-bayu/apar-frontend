import { IUser } from '@/types/user'
import Link, { LinkProps } from 'next/link'
import { useRouter } from 'next/router'
import { PropsWithChildren, useEffect } from 'react'

interface ITabbar {
  user: IUser
}

export interface ITabbarItem extends LinkProps {
  text: string
  alert?: boolean
  active?: boolean
}

const Tabbar = ({ user, children }: PropsWithChildren<ITabbar>) => {
  const appName = process.env.NEXT_PUBLIC_APP_NAME

  return (
    <div className="sm w-auto overflow-scroll border-b-[0.5px] border-zinc-200 text-gray-900 dark:border-b-zinc-700 dark:text-gray-100 sm:px-8">
      <ul className="flex flex-row space-x-6">{children}</ul>
    </div>
  )
}

export default Tabbar

export function TabbarItem({
  text,
  alert,
  ...props
}: PropsWithChildren<ITabbarItem>) {
  const router = useRouter()
  let active = router.pathname == props.href

  return (
    <Link
      {...props}
      className={`relative flex justify-center px-4 py-6
            ${
              active
                ? ' text-zinc-950 dark:text-zinc-50'
                : 'text-zinc-950/60 dark:text-zinc-50/60'
            }
            `}
    >
      <span>{text}</span>
      {active && (
        <div className="absolute bottom-0 h-1 w-full rounded-md bg-red-500" />
      )}
    </Link>
  )
}
