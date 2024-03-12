import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/hooks/useAuth'
import { IUser } from '@/types/user'
import { ModeToggle } from '../ModeToggle'
import { Bell, ChevronDown, ChevronLast, Search } from 'lucide-react'
import Shortcut from '../Shortcut'
import { Button } from '@/components/ui/button'
import useSidebarStore from '@/store/useSidebarStore'
import { shallow } from 'zustand/shallow'
import Link from 'next/link'
import { useBreakpoint } from '@/hooks/useBreakpoint'
import Image from 'next/image'

interface INavigation {
  user: IUser
}

interface IProfilePhoto {
  className?: string
  photo?: IUser['photo']
  name?: IUser['name']
}

const ProfilePhoto = ({ className, photo, name }: IProfilePhoto) => {
  return (
    <div
      className={`inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-500 uppercase text-zinc-200 ${className}`}
    >
      <div className={`${photo && 'hidden'}`}>
        {name && name.charAt(0)}
        <span className="sr-only">User Profile</span>
      </div>
      <Image
        src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${photo}`}
        alt={`Foto profil ${name}`}
        width={0}
        height={0}
        sizes="100vw"
        style={{ objectFit: 'cover' }}
        className={`${!photo && 'hidden'} aspect-square w-full rounded-full`}
      />
    </div>
  )
}

const Navigation = ({ user }: INavigation) => {
  const { logout } = useAuth({ middleware: 'auth' })
  const { isBelowLg } = useBreakpoint('lg')

  const [hidden, setHidden, setExpanded] = useSidebarStore(
    store => [store.hidden, store.setHidden, store.setExpanded],
    shallow,
  )

  return (
    <nav className="relative z-[2] border-b bg-white dark:border-zinc-800 dark:bg-zinc-950">
      {/* Primary Navigation Menu */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between md:justify-between">
          <div className="flex items-center sm:hidden">
            <Button variant="ghost" size="icon">
              {hidden && (
                <ChevronLast
                  className="h-[1.2rem] w-[1.2rem]"
                  onClick={() => {
                    setHidden(false)
                    setExpanded(true)
                  }}
                />
              )}
              {/** To do: notification alert */}
              <span className="sr-only">Toggle sidebar</span>
            </Button>
          </div>

          <div className="mx-2 my-auto flex flex-grow sm:mx-0 sm:mr-6 md:mr-2 md:w-52 md:flex-none">
            <Button
              variant="outline"
              className="hidden h-9 flex-grow justify-start py-2 pl-4 pr-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50 xs:flex"
            >
              <div className="inline-flex items-center space-x-2">
                <Search size={16} />
                <span className="text-zinc-500">Telusuri</span>
              </div>
              <Shortcut keys={['command']}>K</Shortcut>
            </Button>
          </div>

          {/* Settings Dropdown */}
          <div className="flex items-center md:space-x-2">
            <Button variant="ghost" size="icon" className="relative xs:hidden">
              <Search className="h-[1.2rem] w-[1.2rem]" />
              <span className="sr-only">Penelusuran</span>
            </Button>
            <ModeToggle />
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-[1.2rem] w-[1.2rem]" />
              {/** To do: notification alert */}
              <div className="absolute right-2 top-1.5 h-2 w-2 rounded bg-red-400" />
              <span className="sr-only">Notifikasi</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                {isBelowLg ? (
                  <Button
                    className="ml-[0.525rem] h-8 w-8 border-none focus-visible:ring-0"
                    variant="circle"
                    size="icon"
                  >
                    <ProfilePhoto photo={user.photo} name={user.name} />
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    className="ml-[1.525rem] flex h-[75%] flex-row p-2"
                  >
                    <ProfilePhoto photo={user.photo} name={user.name} />
                    <div className="text-md ml-2 flex flex-col items-start">
                      {user.name}
                      <span className="text-xs font-light text-zinc-800 dark:text-zinc-200">
                        {user.role}
                      </span>
                    </div>
                    <ChevronDown size={20} className="ml-4 text-zinc-400" />
                  </Button>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64">
                <DropdownMenuLabel className="flex py-3 lg:hidden">
                  <div className="flex flex-row space-x-2">
                    <ProfilePhoto photo={user.photo} name={user.name} />
                    <div className="text-md flex flex-col">
                      {user.name}
                      <span className="text-xs font-normal">{user.role}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="flex lg:hidden" />
                <DropdownMenuItem asChild>
                  <Link href={'/profile'}>
                    Profil
                    <DropdownMenuShortcut>
                      <Shortcut keys={['command', 'option']}>P</Shortcut>
                    </DropdownMenuShortcut>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation
