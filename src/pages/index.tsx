import Head from 'next/head'
import { LandingPageNavigation } from "../components/LandingPage/Navigation"
import Image from "next/image"
import { Menu } from "lucide-react"
import Hero from "../components/LandingPage/Hero"
import TrustedBy from "@/components/LandingPage/TrustedBy"
import Services from "@/components/LandingPage/Services"
import Advantages from "@/components/LandingPage/Advantages"
import Marketplace from "@/components/LandingPage/Marketplace"
import FloatingWhatsappButton from "@/components/FloatingChatButton"
import FloatingChatButton from "@/components/FloatingChatButton"
import CTA from "@/components/LandingPage/CTA"
import { Footer } from "@/components/LandingPage/Footer"

export default function Home() {
  const title = process.env.NEXT_PUBLIC_APP_NAME + ` - Alat Pemadam Api, Fire Hydrant, dan Fire Alarm di Bali`

  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>

      <header className="relative max-w-7xl mx-auto flex justify-center items-center border-b h-14">
        <div className="absolute left-4 lg:left-12">
          <Image
            src="/logo.png"
            width={'32'}
            height={'32'}
            alt="Logo"
          />
        </div>
        <div className="flex-grow justify-center hidden sm:flex">
          <LandingPageNavigation />
        </div>
        <Menu className="flex sm:hidden absolute right-4 lg:right-12" />
      </header>

      <main>
        <Hero />
        <TrustedBy />
        <Services />
        <Advantages />
        <Marketplace />
        <CTA />
      </main>
      <Footer />
      <FloatingChatButton message={`Halo, saya tertarik dengan layanan ${process.env.NEXT_PUBLIC_APP_NAME}`} />
    </div>
  )
}
