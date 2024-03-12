import { PropsWithChildren } from 'react'
import Head from 'next/head'

interface IGuestLayout {
  title: string
}

const GuestLayout = ({ title, children }: PropsWithChildren<IGuestLayout>) => {
  const appName = process.env.NEXT_PUBLIC_APP_NAME
  return (
    <>
      <Head>
        <title>
          {appName} - {title}
        </title>
      </Head>

      <div className="antialiased">{children}</div>
    </>
  )
}

export default GuestLayout
