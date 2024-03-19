import { PropsWithChildren, ReactElement, ReactNode } from 'react'
import Navigation from '@/components/Layouts/Navigation'
import Sidebar, { SidebarItem } from '@/components/Layouts/Sidebar'
import { useAuth } from '@/hooks/useAuth'
import { Toaster } from '@/components/ui/toaster'
import {
  LayoutDashboard,
  Building2,
  Boxes,
  Settings,
  LifeBuoy,
  Package,
  Ruler,
  Users2Icon,
  ArrowUpSquareIcon,
  ArrowDownSquareIcon,
  UserSquare2,
} from 'lucide-react'
import { useBreakpoint } from '@/hooks/useBreakpoint'
import useSidebarStore from '@/store/useSidebarStore'
import { shallow } from 'zustand/shallow'
import Head from 'next/head'

interface IAppLayout {
  title: string
  customHeaderTitle?: ReactElement
  headerAction?: ReactElement | boolean
}

const AppLayout = ({
  title,
  customHeaderTitle,
  headerAction,
  children,
}: PropsWithChildren<IAppLayout>) => {
  const appName = process.env.NEXT_PUBLIC_APP_NAME
  const { authUser, can } = useAuth({ middleware: 'auth' })
  const { isBelowSm } = useBreakpoint('sm')
  const [hidden, expanded, setHidden] = useSidebarStore(
    state => [
      state.hidden,
      state.expanded,
      state.setHidden,
      state.toggleSidebar,
    ],
    shallow,
  )

  return (
    <>
      {authUser && (
        <div className="relative flex h-full">
          <Head>
            <title>
              {title} | {appName}
            </title>
          </Head>

          {/* Page Sidebar z-[5] */}
          <Sidebar>
            <SidebarItem
              href="/dashboard"
              icon={<LayoutDashboard size={20} />}
              text="Dashboard"
            />
            {can('access customers') && (
              <SidebarItem
                href="/customers"
                icon={<Users2Icon size={20} />}
                text="Pelanggan"
              />
            )}
            {can('access suppliers') && (
              <SidebarItem
                href="/suppliers"
                icon={<Building2 size={20} />}
                text="Supplier"
              />
            )}
            {can('access categories') && (
              <SidebarItem
                href="/categories"
                icon={<Boxes size={20} />}
                text="Kategori"
              />
            )}
            {can('access units') && (
              <SidebarItem
                href="/units"
                icon={<Ruler size={20} />}
                text="Unit"
              />
            )}
            {can('access products') && (
              <SidebarItem
                href="/products"
                icon={<Package size={20} />}
                text="Produk"
              />
            )}
            {can('access purchases') && (
              <SidebarItem
                href="/purchases"
                icon={<ArrowDownSquareIcon size={20} />}
                text="Inbound"
              />
            )}
            {can('access invoices') && (
              <SidebarItem
                href="/invoices"
                icon={<ArrowUpSquareIcon size={20} />}
                text="Outbound"
              />
            )}
            {/* <SidebarItem href="/blogs" icon={<Newspaper size={20} />} text="Blog" alert /> */}
            <hr className="m-3 divide-y rounded-full border-zinc-600/10 dark:border-zinc-50/10" />
            {can('access users') && (
              <SidebarItem
                href="/users"
                icon={<UserSquare2 size={20} />}
                text="Pengguna"
              />
            )}
            <SidebarItem
              href="/settings"
              icon={<Settings size={20} />}
              text="Pengaturan"
            />
            <SidebarItem
              href="/help"
              icon={<LifeBuoy size={20} />}
              text="Bantuan"
            />
          </Sidebar>

          {/* Page Overlay z-[3] z-[4] */}
          <div
            className={`${hidden ? 'pointer-events-none opacity-0' : 'opacity-80'
              } absolute z-[4] flex h-full w-full bg-zinc-950 transition-opacity duration-300 ease-in-out sm:hidden`}
            onClick={() => setHidden(true)}
            onTouchStart={e => e.stopPropagation()}
          />

          {/* Page Content */}
          <main
            className={`sm:overflow-x-hidden" relative ml-0 flex h-screen flex-1 flex-col overflow-x-auto overflow-y-hidden bg-white dark:bg-zinc-950 sm:bg-zinc-100 sm:dark:bg-zinc-900
                        ${!hidden && !expanded && isBelowSm && 'ml-[72px]'}`}
          >
            {/* Navigation z-[2] */}
            <Navigation user={authUser} />
            {/* Page Heading z-[1] */}
            <header className="z-[1] bg-white shadow dark:bg-zinc-950">
              <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
                <div className="flex h-8 items-center justify-between">
                  <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    {customHeaderTitle ?? title}
                  </h2>
                  {headerAction && <>{headerAction}</>}
                </div>
              </div>
            </header>

            <div className="overflow-y-scroll">{children}</div>
          </main>
          <Toaster />
        </div>
      )}
    </>
  )
}

export default AppLayout
