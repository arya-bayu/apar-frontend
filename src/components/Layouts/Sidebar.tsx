import { useRouter } from 'next/router'
import { PropsWithChildren, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronLast } from 'lucide-react'
import Link, { LinkProps } from 'next/link'
import { shallow } from 'zustand/shallow'
import useSidebarStore from '@/store/useSidebarStore'
import { useBreakpoint } from '@/hooks/useBreakpoint'
import Image from "next/image"
import dashboard from "@/pages/dashboard"

export interface ISidebarItem extends LinkProps {
  icon: React.ReactNode
  text: string
  alert?: boolean
  active?: boolean
}

const Sidebar = ({ children }: PropsWithChildren) => {
  const appName = process.env.NEXT_PUBLIC_APP_NAME
  const [expanded, hidden, setExpanded, setHidden] =
    useSidebarStore(
      state => [
        state.expanded,
        state.hidden,
        state.setExpanded,
        state.setHidden,
      ],
      shallow,
    )

  const { isBelowSm } = useBreakpoint('sm')

  useEffect(() => {
    setHidden(isBelowSm)
    if (!isBelowSm) setExpanded(false)
  }, [isBelowSm])

  return (
    <aside
      className={`${hidden ? '-translate-x-full' : '-translate-x-0'
        } z-[5] h-screen border-r bg-zinc-50 shadow-sm transition-transform duration-300 ease-in-out dark:border-zinc-700 dark:bg-zinc-950 absolute`}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <nav className="flex h-full flex-col">
        <div className="relative flex items-center justify-between px-4 py-6">
          <Link href="/dashboard">
            <Image
              src="/logo.png"
              className={`overflow-hidden transition-all ease-in-out`}
              width={'36'}
              height={'36'}
              alt="Logo"
            />
          </Link>
          {isBelowSm && (
            <Button
              onClick={() => setHidden(true)}
              variant={'secondary'}
              size="icon"
              className="h-6 w-6 transition-opacity transform border-none bg-red-500 text-zinc-50 shadow-md shadow-red-500/90 hover:bg-red-500/90 hover:text-zinc-50/90 hover:drop-shadow-lg dark:bg-red-500 dark:hover:bg-red-500/90"
            >
              {expanded ? <ChevronLeft size={14} /> : <ChevronLast size={14} />}
            </Button>
          )}
        </div>

        <ul
          className={`flex-1 px-3 h-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] overflow-y-scroll overflow-x-hidden`}>
          <div>
            {children}
          </div>
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
  const router = useRouter();
  const [expanded] = useSidebarStore(state => [state.expanded])
  const [active, setActive] = useState<boolean>(false);

  useEffect(() => {
    let isActive = router.pathname.startsWith(props.href as string);
    const pathSegments = router.pathname.split('/');
    const pathDepth = pathSegments.length - 1;

    if (pathDepth > 1 && router.pathname.includes('dashboard') && props.href === '/dashboard') {
      isActive = false;
    }

    setActive(isActive);
  }, [props.href, router.pathname]);

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
        }`}
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
    </Link>
  )
}
