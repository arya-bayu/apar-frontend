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
  Package,
  Ruler,
  Users2Icon,
  UserSquare2,
  ShoppingBag,
  FileBox,
} from 'lucide-react'
import useSidebarStore from '@/store/useSidebarStore'
import { shallow } from 'zustand/shallow'
import Head from 'next/head'

interface IAppLayout {
  actionBtn?: React.ReactNode;
  title: string
  customHeaderTitle?: ReactElement
  headerAction?: ReactElement | boolean
}

const AppLayout = ({
  actionBtn,
  title,
  customHeaderTitle,
  headerAction,
  children,
}: PropsWithChildren<IAppLayout>) => {
  const appName = process.env.NEXT_PUBLIC_APP_NAME
  const { authUser, can } = useAuth({ middleware: 'auth' })
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
                href="/dashboard/customers"
                icon={<Users2Icon size={20} />}
                text="Pelanggan"
              />
            )}
            {can('access suppliers') && (
              <SidebarItem
                href="/dashboard/suppliers"
                icon={<Building2 size={20} />}
                text="Supplier"
              />
            )}
            {can('access categories') && (
              <SidebarItem
                href="/dashboard/categories"
                icon={<Boxes size={20} />}
                text="Kategori"
              />
            )}
            {can('access units') && (
              <SidebarItem
                href="/dashboard/units"
                icon={<Ruler size={20} />}
                text="Unit"
              />
            )}
            {can('access products') && (
              <SidebarItem
                href="/dashboard/products"
                icon={<Package size={20} />}
                text="Produk"
              />
            )}
            {can('access purchases') && (
              <SidebarItem
                href="/dashboard/purchases"
                icon={<ShoppingBag size={20} />}
                text="Pembelian"
              />
            )}
            {can('access invoices') && (
              <SidebarItem
                href="/dashboard/invoices"
                icon={<FileBox size={20} />}
                text="Invoice"
              />
            )}
            <hr className="m-3 divide-y rounded-full border-zinc-600/10 dark:border-zinc-50/10" />
            {can('access users') && (
              <SidebarItem
                href="/dashboard/users"
                icon={<UserSquare2 size={20} />}
                text="Pengguna"
              />
            )}
            <SidebarItem
              href="/dashboard/settings"
              icon={<Settings size={20} />}
              text="Pengaturan"
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
            className={`sm:overflow-x-hidden ml-0 sm:ml-[68px] relative flex h-screen flex-1 flex-col overflow-x-auto overflow-y-hidden bg-white dark:bg-zinc-950 sm:bg-zinc-100 sm:dark:bg-zinc-900`}
          >
            {/* Navigation z-[2] */}
            <Navigation user={authUser} />
            {/* Page Heading z-[1] */}
            <header className="z-[1] bg-white shadow dark:bg-zinc-950">
              <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
                <div className="flex h-8 items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {actionBtn && <span>{actionBtn}</span>}
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                      {customHeaderTitle ?? title}
                    </h2>
                  </div>

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
