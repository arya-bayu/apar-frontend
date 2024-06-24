import 'tailwindcss/tailwind.css'

import React from 'react'
import type { AppProps } from 'next/app'
import { ThemeProvider } from '@/components/ThemeProvider'
import '../../styles/globals.css'
import { usePathname } from "next/navigation"

import Router from 'next/router'
import Link from 'next/link'
import Head from 'next/head'
import NProgress from 'nprogress'

NProgress.configure({ showSpinner: false });
Router.events.on('routeChangeStart', (url) => {
  NProgress.start()
})
Router.events.on('routeChangeComplete', () => NProgress.done())
Router.events.on('routeChangeError', () => NProgress.done())

function App({ Component, pageProps }: AppProps) {
  if (!process.browser) React.useLayoutEffect = React.useEffect
  const pathname = usePathname();
  const isDashboardPage = pathname ? pathname.startsWith('/dashboard') : false;

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1,user-scalable=0" />
      </Head>
      <ThemeProvider forcedTheme={isDashboardPage ? undefined : 'light'} attribute="class" defaultTheme="system" enableSystem>
        <Component {...pageProps} />
      </ThemeProvider>
    </>

  )
}
export default App
