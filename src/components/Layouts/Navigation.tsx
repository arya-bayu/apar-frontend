import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/hooks/useAuth'
import { IUser } from '@/types/user'
import { ModeToggle } from '../ModeToggle'
import { ChevronDown, ChevronLast } from 'lucide-react'
import { Button } from '@/components/ui/button'
import useSidebarStore from '@/store/useSidebarStore'
import { shallow } from 'zustand/shallow'
import Link from 'next/link'
import { useBreakpoint } from '@/hooks/useBreakpoint'
import Image from 'next/image'
import { IImage } from "@/types/image"

interface INavigation {
  user: IUser
}

interface IProfilePhoto {
  className?: string
  photo?: IImage
  name?: IUser['name']
}

const ProfilePhoto = ({ className, photo, name }: IProfilePhoto) => {

  return (
    <div className={`${className}`} >
      {!photo?.path ? (
        <div className="h-8 w-8 inline-flex items-center justify-center bg-red-500 rounded-full uppercase text-zinc-200">
          {name && name.charAt(0)}
          <span className="sr-only">User Profile</span>
        </div>
      ) : (
        <Image
          src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${photo.path}`}
          alt={`Foto profil ${name}`}
          width={0}
          height={0}
          sizes="100vw"
          className={`object-cover aspect-square rounded-full h-8 w-8 z-10`}
          style={{
            transition: "opacity 0.2s cubic-bezier(0.3, 0.2, 0.2, 0.8)"
          }}
        />
      )}
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
    <nav className="relative z-[2] border-b bg-white dark:border-zinc-700 dark:bg-zinc-950">
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

          <div className="mx-2 my-auto flex flex-grow sm:mx-0 sm:mr-6 md:mr-2 md:w-52 md:flex-none"></div>

          {/* Settings Dropdown */}
          <div className="flex items-center md:space-x-2">
            <ModeToggle />
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
                  <Link href={'/dashboard/profile'}>
                    Profil
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
