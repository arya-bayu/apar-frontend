import 'tailwindcss/tailwind.css'

import React from 'react'
import type { AppProps } from 'next/app'
import { ThemeProvider } from '@/components/ThemeProvider'
import '../../styles/globals.css'
import { usePathname } from "next/navigation"

function App({ Component, pageProps }: AppProps) {
  // suppress useLayoutEffect warnings when running outside a browser
  if (!process.browser) React.useLayoutEffect = React.useEffect
  const pathname = usePathname();
  const isDashboardPage = pathname ? pathname.startsWith('/dashboard') : false;

  return (
    <ThemeProvider forcedTheme={isDashboardPage ? undefined : 'light'} attribute="class" defaultTheme="system" enableSystem>
      <Component {...pageProps} />
    </ThemeProvider>
  )
}
export default App
