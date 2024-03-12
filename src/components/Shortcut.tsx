import { PropsWithChildren } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

type KbdKey =
  | 'command'
  | 'shift'
  | 'ctrl'
  | 'option'
  | 'enter'
  | 'delete'
  | 'escape'
  | 'tab'
  | 'capslock'
  | 'up'
  | 'right'
  | 'down'
  | 'left'
  | 'pageup'
  | 'pagedown'
  | 'home'
  | 'end'
  | 'help'
  | 'space'

const macKeySymbols: Record<KbdKey, string> = {
  command: '⌘',
  shift: '⇧',
  ctrl: '⌃',
  option: '⌥',
  enter: '⏎',
  delete: '⌫',
  escape: '⎋',
  tab: '⇥',
  capslock: '⇪',
  up: '↑',
  right: '→',
  down: '↓',
  left: '←',
  pageup: '⇞',
  pagedown: '⇟',
  home: '↖',
  end: '↘',
  help: '?',
  space: '␣',
}

const winKeySymbols: Record<KbdKey, string> = {
  command: '⌘',
  shift: 'Shift',
  ctrl: 'Ctrl',
  option: 'Alt',
  enter: 'Enter',
  delete: 'Delete',
  escape: 'Esc',
  tab: 'Tab',
  capslock: 'Caps Lock',
  up: '↑',
  right: '→',
  down: '↓',
  left: '←',
  pageup: 'Page Up',
  pagedown: 'Page Down',
  home: 'Home',
  end: 'End',
  help: 'Help',
  space: 'Space',
}

const shortcutVariants = cva(
  'ml-auto justify-center px-1.5 py-0.5 inline-flex items-center font-sans font-normal text-center text-xs rounded',
  {
    variants: {
      variant: {
        default:
          'shadow-small border dark:border-none bg-zinc-50 dark:bg-zinc-700',
        destructive:
          'shadow-small border border-zinc-50/20 text-white bg-red-500 focus:bg-red-600 dark:focus:bg-red-600 focus:text-white',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

interface KbdProps extends VariantProps<typeof shortcutVariants> {
  keys: KbdKey[]
  className?: string
}

const Shortcut = ({
  variant,
  keys,
  children,
  className,
}: PropsWithChildren<KbdProps>) => {
  const platform = window.navigator.userAgent

  if (
    platform.includes('Macintosh') ||
    platform.includes('Windows') ||
    platform.includes('Linux')
  ) {
    return (
      <kbd className={cn(shortcutVariants({ variant, className }))}>
        {keys.map((key, index) => {
          let displayKey = key
          if (!platform.includes('Macintosh') && key === 'command') {
            displayKey = 'ctrl'
          }

          const keySymbol = platform.includes('Macintosh')
            ? macKeySymbols[displayKey]
            : winKeySymbols[displayKey]

          return (
            <abbr key={index} className="no-underline" title={displayKey}>
              {keySymbol}
            </abbr>
          )
        })}
        <span className={`${children && 'ml-0.5'}`}>{children}</span>
      </kbd>
    )
  }

  return null
}

export default Shortcut
