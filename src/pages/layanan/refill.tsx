import Head from 'next/head'
import FloatingChatButton from "@/components/FloatingChatButton"
import CTA from "@/components/LandingPage/CTA"
import { Footer } from "@/components/LandingPage/Footer"
import { Header } from "@/components/LandingPage/Header"
import React from "react"
import SimpleHero from "@/components/LandingPage/SimpleHero"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button";

import Image from "next/image";
import TrustedBy from "@/components/LandingPage/TrustedBy"
import Link from "next/link"

const brands = [
    { name: "Jaya Fried Chicken (JFC)", logo: "/partner/jaya-fried-chicken.png" },
    { name: "Ace Hardware", logo: "/partner/ace-hardware.png" },
    { name: "Garuda Wisnu Kencana by Alam Sutera", logo: "/partner/garuda-wisnu-kencana.svg" },
    { name: "Dealer Resmi Mitsubishi Motors Indonesia PT. Bumen Redja Abadi", logo: "/partner/mitsubishi-motors.png" },
    { name: "PT. Ajinomoto", logo: "/partner/ajinomoto.png" },
    { name: "Conato Bakery", logo: "/partner/conato.png" },
    { name: "PT. Duta Intika (Kawasaki)", logo: "/partner/duta-intika-kawasaki.png" },
    { name: "Hanamasa", logo: "/partner/hanamasa.jpg" },
    { name: "PT. Waja Motor Yamaha", logo: "/partner/waja-motor-yamaha.png" },
    { name: "PT. Wahana Indo Trada (Indomobil Nissan Datsun)", logo: "/partner/wahana-indo-trada-indomobil-nissan-datsun.png" },
];


export default function Refill() {
    const title = process.env.NEXT_PUBLIC_APP_NAME + ` - Jasa Refill Alat Pemadam Api Terlengkap di Bali`

    return (
        <div>
            <Head>
                <title>{title}</title>
            </Head>

            <Header />
            <main>
                <SimpleHero
                    label="Layanan"
                    title="Isi Ulang APAR."
                    subtitle="Layanan pengisian ulang tabung alat pemadam api segala media."
                />

                <TrustedBy />

                <section className="flex justify-center pb-0">
                    <div className="max-w-7xl py-6">
                        <div className="flex flex-col-reverse lg:flex-row items-center gap-8 mx-8 my-4">
                            <div className="lg:w-2/3 flex flex-col justify-between gap-8 overflow-hidden">
                                <div className="space-y-3">
                                    <h2 className="font-bold text-monza-500 text-4xl">On-site Refill Service untuk Berbagai Jenis Media Tabung Pemadam Kebakaran</h2>
                                    <p className="text-lg">Mulai dari <strong>Foam</strong> hingga <strong>CO₂</strong>, Indoka Surya Jaya menyediakan berbagai jenis media pengisian yang cocok untuk tabung pemadam kebakaran di tempat Anda.</p>
                                    <div className="space-x-4 flex justify-start ">
                                        <Link target="_blank" href={"https://wa.me/+6285100665789?text=Halo, saya ingin melakukan reservasi pengisian ulang APAR " + process.env.NEXT_PUBLIC_APP_NAME}>
                                            <Button variant="monza_destructive" className="group pl-3 pr-2 justify-between gap-4" size={"lg"}>
                                                <p>Reservasi Pengisian</p>
                                                <div className="bg-zinc-50 rounded-md p-1">
                                                    <ArrowRight size={16} className="text-monza-500 -rotate-45 group-hover:rotate-0 transition-all" />
                                                </div>
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    <div className="flex flex-col justify-start p-6 border rounded-lg bg-zinc-50 hover:bg-zinc-50/80 hover:drop-shadow-md">
                                        <h3 className="font-bold">Kualitas Media Pemadam Terbaik</h3>
                                        <p className="text-zinc-700">Kami menjamin kualitas media pemadam yang anti gumpal, efektif padamkan api dalam waktu singkat.</p>
                                    </div>
                                    <div className="flex flex-col justify-start p-6 border rounded-lg bg-zinc-50 hover:bg-zinc-50/80 hover:drop-shadow-md">
                                        <h3 className="font-bold">Mendukung Segala Jenis Merk Tabung</h3>
                                        <p className="text-zinc-700">Kami mendukung segala jenis merk tabung pemadam kebakaran, berapapun ukuran tabungnya.</p>
                                    </div>
                                    <div className="flex flex-col justify-start p-6 border rounded-lg bg-zinc-50 hover:bg-zinc-50/80 hover:drop-shadow-md">
                                        <h3 className="font-bold">Praktis dan Hemat</h3>
                                        <p className="text-zinc-700">Kami menyediakan layanan on-site refilling untuk layanan pengisian tabung pemadam di tempat Anda.</p>
                                    </div>
                                    <div className="flex flex-col justify-start p-6 border rounded-lg bg-zinc-50 hover:bg-zinc-50/80 hover:drop-shadow-md">
                                        <h3 className="font-bold">Gratis Training APAR</h3>
                                        <p className="text-zinc-700">Sambil menunggu pengisian, kami dapat memberikan pelatihan APAR gratis untuk organisasi Anda.</p>
                                    </div>
                                </div>
                            </div>
                            <Image src="/refill/refill.jpg" height={1080} width={1920} alt="Teknisi Indoka Surya Jaya" priority className="lg:w-1/3 aspect-[3/4] border border-zinc-200 object-contain rounded-2xl" />
                        </div>
                    </div>
                </section>
                <CTA />
            </main >
            <Footer />
            <FloatingChatButton message={`Halo, saya tertarik dengan layanan ${process.env.NEXT_PUBLIC_APP_NAME}`} />
        </div >
    )
}
