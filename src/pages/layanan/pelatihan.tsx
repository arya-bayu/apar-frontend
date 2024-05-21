import Head from 'next/head'
import FloatingChatButton from "@/components/FloatingChatButton"
import CTA from "@/components/LandingPage/CTA"
import { Footer } from "@/components/LandingPage/Footer"
import { Header } from "@/components/LandingPage/Header"
import React from "react"
import SimpleHero from "@/components/LandingPage/SimpleHero"
import { AlertTriangleIcon, BookOpenCheckIcon, FireExtinguisherIcon } from "lucide-react"
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

import {
    Carousel,
    CarouselContent,
    CarouselItem
} from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"

import Image from "next/image";
import Marquee from "react-fast-marquee"
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


export default function Pelatihan() {
    const title = process.env.NEXT_PUBLIC_APP_NAME + ` - Layanan Pelatihan Pemadam Kebakaran No. 1 di Bali`

    const photos = [
        { alt: "Foto Pelatihan Indoka Surya Jaya 1", path: "/training/training-1.png" },
        { alt: "Foto Pelatihan Indoka Surya Jaya 2", path: "/training/training-2.png" },
        { alt: "Foto Pelatihan Indoka Surya Jaya 3", path: "/training/training-3.png" },
        { alt: "Foto Pelatihan Indoka Surya Jaya 4", path: "/training/training-4.png" },
        { alt: "Foto Pelatihan Indoka Surya Jaya 5", path: "/training/training-5.png" },
        { alt: "Foto Pelatihan Indoka Surya Jaya 6", path: "/training/training-6.png" },
        { alt: "Foto Pelatihan Indoka Surya Jaya 7", path: "/training/training-7.png" },
    ];

    const plugin = React.useRef(
        Autoplay({ delay: 2000, stopOnInteraction: false, stopOnMouseEnter: true })
    )

    return (
        <div>
            <Head>
                <title>{title}</title>
            </Head>

            <Header />
            <main>
                <SimpleHero
                    label="Layanan"
                    title="Pelatihan."
                    subtitle="Pelatihan pemadaman kebakaran dari tim profesional Indoka Surya Jaya terhadap instansi dan perusahaan mitra."
                />

                <section className="flex justify-center pb-0">
                    <div className="max-w-7xl py-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-8 mx-8 my-4">
                            <div className="col-span 1 space-y-3">
                                <Carousel
                                    opts={{
                                        align: "start",
                                        loop: true
                                    }}
                                    plugins={[plugin.current]}
                                    className="flex-grow w-full rounded-2xl overflow-clip"
                                >
                                    <CarouselContent>
                                        {photos.map((photo, index) => (
                                            <CarouselItem key={index}>
                                                <Image src={photo.path} height={1000} width={1000} alt={photo.alt} priority className="w-full aspect-square border border-zinc-200 object-cover rounded-2xl" />
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                </Carousel>
                                <Marquee
                                    speed={30}
                                    gradient={true}
                                    gradientColor="#fff"
                                    gradientWidth={100}
                                    autoFill
                                    className="border border-zinc-200 bg-zinc-50 rounded-xl overflow-hidden py-4"

                                >
                                    {brands.concat(brands).map((brand, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center mx-5 gap-5"
                                        >
                                            <Image
                                                src={brand.logo}
                                                alt={brand.name}
                                                height={31}
                                                width={42}
                                                priority
                                                className="filter grayscale opacity-50 brightness-75 hover:filter-none hover:opacity-100 hover:brightness-100"
                                            />
                                        </div>
                                    ))}
                                </Marquee>
                            </div>
                            <div className="col-span-1 flex flex-col justify-between gap-8 overflow-hidden">
                                <div className="space-y-3">
                                    <h2 className="font-bold text-monza-500 text-4xl">Edukasi Organisasi Perusahaan Anda bersama Indoka Surya Jaya</h2>
                                    <p className="text-lg">Mulai dari mitigasi hingga penanganan darurat, pelatih profesional kami menyediakan program pelatihan komprehensif yang menjamin kesiapsiagaan pekerja dalam mencegah risiko kebakaran.</p>
                                    <div className="space-x-4 flex justify-start ">
                                        <Link target="_blank" href={"https://wa.me/+6285100665789?text=Halo, saya tertarik untuk melakukan reservasi pelatihan penanganan kebakaran " + process.env.NEXT_PUBLIC_APP_NAME}>
                                            <Button variant="monza_destructive" className="group pl-3 pr-2 justify-between gap-4" size={"lg"}>
                                                <p>Reservasi Pelatihan</p>
                                                <div className="bg-zinc-50 rounded-md p-1">
                                                    <ArrowRight size={16} className="text-monza-500 -rotate-45 group-hover:rotate-0 transition-all" />
                                                </div>
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <Link target="_blank" href={"https://wa.me/+6285100665789?text=Halo, saya tertarik untuk melakukan reservasi pelatihan Basic Fire Protection Training " + process.env.NEXT_PUBLIC_APP_NAME} className="space-y-1">
                                            <div className="group gap-4 flex flex-col md:flex-row items-start justify-start md:items-center p-6 border rounded-lg bg-zinc-50 hover:bg-zinc-50/80 hover:drop-shadow-md">
                                                <div className="border border-zinc-200 bg-zinc-100 group-hover:bg-zinc-50/80 group-hover:drop-shadow-md rounded-lg p-3">
                                                    <BookOpenCheckIcon size={30} className="text-monza-500" />
                                                </div>
                                                <div className="flex flex-col justify-center">
                                                    <h3 className="font-bold">Basic Fire Protection Training</h3>
                                                    <p className="text-zinc-700">Pelatihan dasar pemadaman kebakaran oleh pelatih profesional Indoka.</p>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                    <div>
                                        <Link target="_blank" href={"https://wa.me/+6285100665789?text=Halo, saya tertarik untuk melakukan reservasi pelatihan Comprehensive Training Pemadam Kebakaran " + process.env.NEXT_PUBLIC_APP_NAME} className="space-y-1">
                                            <div className="group gap-4 flex flex-col md:flex-row items-start justify-start md:items-center p-6 border rounded-lg bg-zinc-50 hover:bg-zinc-50/80 hover:drop-shadow-md">
                                                <div className="border border-zinc-200 bg-zinc-100 group-hover:bg-zinc-50/80 group-hover:drop-shadow-md rounded-lg p-3">
                                                    <FireExtinguisherIcon size={30} className="text-monza-500" />
                                                </div>
                                                <div className="flex flex-col justify-center">
                                                    <h3 className="font-bold">Comprehensive Training Pemadam Kebakaran</h3>
                                                    <p className="text-zinc-700">Pelatihan komprehensif penggunaan penggunaan instalasi sistem proteksi kebakaran Indoka Surya Jaya.</p>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                    <div>
                                        <Link target="_blank" href={"https://wa.me/+6285100665789?text=Halo, saya tertarik untuk melakukan reservasi pelatihan Intensive Fire Evacuation Drill " + process.env.NEXT_PUBLIC_APP_NAME} className="space-y-1">
                                            <div className="group gap-4 flex flex-col md:flex-row items-start justify-start md:items-center p-6 border rounded-lg bg-zinc-50 hover:bg-zinc-50/80 hover:drop-shadow-md">
                                                <div className="border border-zinc-200 bg-zinc-100 group-hover:bg-zinc-50/80 group-hover:drop-shadow-md rounded-lg p-3">
                                                    <AlertTriangleIcon size={30} className="text-monza-500" />
                                                </div>
                                                <div className="flex flex-col justify-center">
                                                    <h3 className="font-bold">Intensive Fire Evacuation Drill</h3>
                                                    <p className="text-zinc-700">Pelatihan intensif untuk mempersiapkan tim dalam menghadapi insiden kebakaran melalui simulasi kebakaran.</p>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section >
                <CTA />
            </main >
            <Footer />
            <FloatingChatButton message={`Halo, saya tertarik dengan layanan ${process.env.NEXT_PUBLIC_APP_NAME}`} />
        </div >
    )
}
