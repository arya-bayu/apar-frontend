import 'tailwindcss/tailwind.css'

import React from 'react'
import type { AppProps } from 'next/app'
import { ThemeProvider } from '@/components/ThemeProvider'

function App({ Component, pageProps }: AppProps) {
  // suppress useLayoutEffect warnings when running outside a browser
  if (!process.browser) React.useLayoutEffect = React.useEffect

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Component {...pageProps} />
    </ThemeProvider>
  )
}
export default App
