import { IUser } from '@/types/user'
import { useRouter } from 'next/router'
import { PropsWithChildren, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronLast } from 'lucide-react'
import Link, { LinkProps } from 'next/link'
import { shallow } from 'zustand/shallow'
import useSidebarStore from '@/store/useSidebarStore'
import { useBreakpoint } from '@/hooks/useBreakpoint'

export interface ISidebarItem extends LinkProps {
  icon: React.ReactNode
  text: string
  alert?: boolean
  active?: boolean
}

const Sidebar = ({ children }: PropsWithChildren) => {
  const appName = process.env.NEXT_PUBLIC_APP_NAME
  const [expanded, hidden, setExpanded, setHidden, toggleSidebar] =
    useSidebarStore(
      state => [
        state.expanded,
        state.hidden,
        state.setExpanded,
        state.setHidden,
        state.toggleSidebar,
      ],
      shallow,
    )

  const { isBelowSm } = useBreakpoint('sm')

  useEffect(() => {
    setHidden(isBelowSm)
  }, [isBelowSm])

  return (
    <aside
      className={`${hidden ? '-translate-x-full' : '-translate-x-0'
        } absolute z-[5] h-screen border-r bg-zinc-50 shadow-sm transition-transform duration-300 ease-in-out dark:border-zinc-700 dark:bg-zinc-950 sm:static`}
    >
      <nav className="flex h-full flex-col">
        <div className="relative flex items-center justify-between px-6 py-6">
          <Link href="/">
            <img
              src="/logo.png"
              className={`overflow-hidden transition-all ease-in-out ${expanded ? 'w-12' : 'w-0'
                }`}
              alt="Logo"
            ></img>
          </Link>
          <Button
            onClick={isBelowSm ? () => setHidden(true) : toggleSidebar}
            variant={isBelowSm ? 'secondary' : 'circle'}
            size="icon"
            className={`h-6 w-6 transform border-none bg-red-500 text-zinc-50 shadow-md shadow-red-500/90 hover:bg-red-500/90 hover:text-zinc-50/90 hover:drop-shadow-lg dark:bg-red-500 dark:hover:bg-red-500/90
                                ${expanded &&
              'sm:absolute sm:-right-0 sm:translate-x-1/2'
              }`}
          >
            {expanded ? <ChevronLeft size={14} /> : <ChevronLast size={14} />}
          </Button>
        </div>

        <ul className={`flex-1 px-3 h-full overflow-y-scroll overflow-x-hidden`}>
          {children}
        </ul>


        <span
          className={`px-3 py-4 transition-all ${expanded ? 'w-60' : 'w-0'
            }`}
        >
          <p
            className={`ml-3 text-sm font-medium text-gray-600 text-zinc-600/60 dark:text-zinc-50/60 ${expanded ? 'opacity-100 transition-opacity delay-100' : 'opacity-0'
              }`}
          >
            {expanded && `${appName}. © ${new Date().getFullYear()}. All rights reserved.`}
          </p>
        </span>
      </nav>
    </aside>
  )
}

export default Sidebar

export function SidebarItem({
  icon,
  text,
  alert,
  ...props
}: PropsWithChildren<ISidebarItem>) {
  const { isBelowSm } = useBreakpoint('sm')
  const [expanded] = useSidebarStore(state => [state.expanded])
  const router = useRouter()
  let active = router.pathname.startsWith(String(props.href))

  return (
    <Link
      {...props}
      className={`
                group relative my-1 flex cursor-pointer items-center justify-center
                rounded-md px-3 py-2
                font-medium text-gray-600
                transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-800 
                ${active
          ? 'bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50'
          : 'text-zinc-900/70 dark:text-zinc-50/60'
        }
            `}
    >
      {icon}

      <span
        className={`overflow-hidden transition-all ease-in-out ${expanded ? 'ml-3 w-52' : 'w-0'
          }`}
      >
        {text}
      </span>

      {alert && (
        <div
          className={`absolute right-2.5 h-2 w-2 rounded bg-red-400 ${expanded ? '' : 'top-2'
            }`}
        />
      )}

      {active && (
        <div className="absolute -right-3 h-full w-1 rounded-l-md bg-red-400" />
      )}

      {/* {Tooltip} */}
      {!expanded && !isBelowSm && (
        <div
          className={`
                    invisible absolute left-full z-[10] ml-6 -translate-x-3 rounded-md
                    bg-red-100 px-2 py-1
                    text-sm text-red-800
                    opacity-20 transition-all group-hover:visible group-hover:translate-x-0
                    group-hover:opacity-100 dark:bg-zinc-800 dark:text-zinc-50
                `}
        >
          {text}
        </div>
      )}
    </Link>
  )
}
