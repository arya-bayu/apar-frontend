import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:ring-zinc-300 transition ease-in-out duration-150',
  {
    variants: {
      variant: {
        light: 'shadow bg-zinc-50 text-zinc-900 hover:bg-zinc-50/90',
        default:
          'bg-zinc-900 text-zinc-50 shadow hover:bg-zinc-900/90 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50/90',
        destructive:
          'bg-red-600 text-zinc-50 shadow-sm hover:bg-red-600/80',
        monza_destructive:
          'bg-monza-500 text-zinc-50 shadow-sm hover:bg-monza-500/80 border border-monza-500',
        success:
          'bg-green-600 text-zinc-50 shadow-sm hover:bg-green-600/80',
        outline:
          'border border-zinc-200 bg-transparent shadow-sm hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-50',
        secondary:
          'bg-zinc-200 text-zinc-900 shadow-sm hover:bg-zinc-100/80 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-800/80',
        ghost:
          'hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-50',
        whatsapp: "rounded-3xl bg-whatsapp drop-shadow-lg hover:drop-shadow-[0_0_4.8rem_rgba(37,211,102,.5)] hover:scale-[1.1] transition-all duration-100 ease-in-out text-white",
        warning:
          'bg-yellow-300 text-zinc-800 shadow-sm hover:bg-yellow-300/80',
        link: 'text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-50',
        circle:
          'inline-flex items-center justify-center w-9 h-9 border dark:border-transparent rounded-full text-md leading-4 font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50 hover:bg-zinc-50 dark:bg-zinc-700 hover:dark:bg-zinc-700/90 focus:outline-none transition ease-in-out duration-150',
      },
      size: {
        default: 'px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
        xlarge: "text-lg py-4 px-8",
        smallIcon: 'h-6 w-6',
        expandableIcon: 'h-9 min-w-[2.25rem]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
