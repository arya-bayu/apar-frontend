import Head from 'next/head'
import FloatingChatButton from "@/components/FloatingChatButton"
import CTA from "@/components/LandingPage/CTA"
import { Footer } from "@/components/LandingPage/Footer"
import { Header } from "@/components/LandingPage/Header"
import React from "react"
import { CalendarClock, Map, Phone } from "lucide-react"
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

import Autoplay from "embla-carousel-autoplay"
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


export default function ContactUs() {
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
                <section className="flex border-b justify-center bg-monza-50 bg-gradient-to-b from-transparent via-transparent to-stone-50">
                    <div className="max-w-7xl w-full px-6 lg:px-12 py-16">
                        <h1 className="text-center mx-auto lg:mx-0 lg:text-left max-w-2xl lg:max-w-5xl mb-4 text-5xl lg:text-6xl font-extrabold tracking-tight leading-none dark:text-white">
                            Denpasar Office
                        </h1>
                        <p className="text-center mx-auto lg:mx-0 lg:text-left max-w-2xl lg:max-w-5xl font-light text-zinc-700 md:text-lg lg:text-2xl">
                            {process.env.NEXT_PUBLIC_APP_NAME} berlokasi di Kota Denpasar, Bali. Namun, cakupan area penjualan Indoka Surya Jaya berada di seluruh Bali.
                        </p>
                    </div>
                </section>
                <section className="flex justify-center mx-auto max-w-7xl lg:my-8 lg:px-12">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1972.1614421934678!2d115.2201355253446!3d-8.660810479234744!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd240909596421f%3A0xaeeef8ac84006747!2sINDOKA%20SURYA%20JAYA!5e0!3m2!1sen!2sid!4v1716040582388!5m2!1sen!2sid"
                        height="600"
                        className="b-0 w-full"
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade">

                    </iframe>
                </section>

                <section className="flex flex-col lg:flex-row items-start max-w-7xl mx-auto my-8 pb-0 px-6 lg:px-12 gap-6">
                    <div className="lg:w-1/4 gap-4 flex flex-col md:flex-row items-start justify-start md:items-center">
                        <div className="flex flex-col justify-center">
                            <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                    <Phone size={20} />
                                    <h3 className="font-bold">Telepon</h3>
                                </div>
                                <p className="text-sm font-normal">(0361) 4456865</p>
                                <p className="text-sm font-normal">+62 851 0066 5789</p>
                            </div>
                        </div>
                    </div>
                    <div className="lg:w-1/4 gap-4 flex flex-col md:flex-row items-start justify-start md:items-center">
                        <div className="flex flex-col justify-center">
                            <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                    <CalendarClock size={20} />
                                    <h3 className="font-bold">Jam Kerja</h3>
                                </div>
                                <p className="text-sm font-normal">Senin - Sabtu: 09.00 - 17.00</p>
                                <p className="text-sm font-normal">Minggu: Tutup</p>
                            </div>
                        </div>
                    </div>
                    <div className="lg:w-1/4 gap-4 flex flex-col md:flex-row items-start justify-start md:items-center">
                        <div className="flex flex-col justify-center">
                            <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                    <Map size={20} />
                                    <h3 className="font-bold">Alamat</h3>
                                </div>
                                <p className="text-sm font-normal">Jl. Letda Made Putra No.4, Dangin Puri Klod, Denpasar, Bali</p>
                            </div>
                        </div>
                    </div>
                    <div className="lg:w-1/4 flex justify-center mx-auto md:justify-end md:mx-0 md:ml-auto ">
                        <Link target="_blank" href="https://www.google.com/maps/place/INDOKA+SURYA+JAYA/@-8.6608105,115.2201355,18z/data=!4m10!1m2!2m1!1sINDOKA+SURYA+JAYA!3m6!1s0x2dd240909596421f:0xaeeef8ac84006747!8m2!3d-8.6608683!4d115.2201247!15sChFJTkRPS0EgU1VSWUEgSkFZQeABAA!16s%2Fg%2F11vwyqzq90?entry=ttu">
                            <Button variant="monza_destructive" className="group pl-3 pr-2 justify-between gap-4" size={"lg"}>
                                <p>Lihat di Google Maps</p>
                                <div className="bg-zinc-50 rounded-md p-1">
                                    <ArrowRight size={16} className="text-monza-500 -rotate-45 group-hover:rotate-0 transition-all" />
                                </div>
                            </Button>
                        </Link>
                    </div>
                </section >
                <CTA />
            </main >
            <Footer />
            <FloatingChatButton message={`Halo, saya tertarik dengan layanan ${process.env.NEXT_PUBLIC_APP_NAME}`} />
        </div >
    )
}
