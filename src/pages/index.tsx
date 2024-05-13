import Head from 'next/head'
import { LandingPageNavigation } from "../components/LandingPage/Navigation"
import Image from "next/image"
import { Menu } from "lucide-react"
import Hero from "../components/LandingPage/Hero"
import TrustedBy from "@/components/LandingPage/TrustedBy"
import Services from "@/components/LandingPage/Services"

export default function Home() {
  const title = process.env.NEXT_PUBLIC_APP_NAME + ` - Alat Pemadam Api, Fire Hydrant, dan Fire Alarm di Bali`

  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>

      <div className="relative max-w-7xl mx-auto flex justify-center items-center border-b h-14">
        <div className="flex-grow justify-center hidden sm:flex">
          <LandingPageNavigation />
        </div>
        <div className="absolute left-4 lg:left-12">
          <Image
            src="/logo.png"
            width={'32'}
            height={'32'}
            alt="Logo"
          />
        </div>
        <Menu className="flex sm:hidden absolute right-4 lg:right-12" />
      </div>
      <Hero />
      <TrustedBy />
      <Services />

    </div>
  )
}
