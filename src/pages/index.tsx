import Head from 'next/head'
import Hero from "../components/LandingPage/Hero"
import TrustedBy from "@/components/LandingPage/TrustedBy"
import Services from "@/components/LandingPage/Services"
import Advantages from "@/components/LandingPage/Advantages"
import Marketplace from "@/components/LandingPage/Marketplace"
import FloatingChatButton from "@/components/FloatingChatButton"
import CTA from "@/components/LandingPage/CTA"
import { Footer } from "@/components/LandingPage/Footer"
import { Header } from "@/components/LandingPage/Header"

export default function Home() {
  const title = process.env.NEXT_PUBLIC_APP_NAME + ` - Alat Pemadam Api, Fire Hydrant, dan Fire Alarm di Bali`

  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>

      <Header />
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
