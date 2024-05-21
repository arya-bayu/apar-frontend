import Head from 'next/head'
import FloatingChatButton from "@/components/FloatingChatButton"
import CTA from "@/components/LandingPage/CTA"
import { Footer } from "@/components/LandingPage/Footer"
import { Header } from "@/components/LandingPage/Header"
import React from "react"
import SimpleHero from "@/components/LandingPage/SimpleHero"
import { FileCheck2Icon, ReplaceIcon, ArrowRight, WrenchIcon } from "lucide-react"
import { Button } from "@/components/ui/button";

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


export default function Maintenance() {
    const title = process.env.NEXT_PUBLIC_APP_NAME + ` - Maintenance Alat Pemadam Api Terbaik di Bali`

    return (
        <div>
            <Head>
                <title>{title}</title>
            </Head>

            <Header />
            <main>
                <SimpleHero
                    label="Layanan"
                    title="Maintenance."
                    subtitle="Layanan perawatan berkala untuk produk fire protection mitra Indoka Surya Jaya."
                />

                <section className="flex justify-center">
                    <div className="max-w-7xl pt-12 pb-6">
                        <div className="flex flex-col lg:flex-row gap-12 mx-8 my-4">
                            <div className="border shadow-sm border-zinc-200 px-12 md:px-4 py-6 rounded-lg md:border-0 md:shadow-none lg:px-0 lg:py-0 lg:rounded-none group flex flex-col items-center text-center space-y-4 max-w-7xl lg:w-1/3">
                                <div className="bg-monza-100 p-2 rounded-lg group-hover:bg-monza-200/75 group-hover:shadow-lg">
                                    <FileCheck2Icon className="text-monza-500 group-hover:text-monza-500/80" size={48} />
                                </div>
                                <div className="md:max-w-md">
                                    <h3 className="font-bold text-lg">Pengecekan Berkala</h3>
                                    <p>Pengecekan berkala dilakukan setiap 6 hingga 12 bulan sekali.</p>
                                </div>
                            </div>
                            <div className="border shadow-sm border-zinc-200 px-12 md:px-4 py-6 rounded-lg md:border-0 md:shadow-none lg:px-0 lg:py-0 lg:rounded-none group flex flex-col items-center text-center space-y-4 max-w-7xl lg:w-1/3">
                                <div className="bg-monza-100 p-2 rounded-lg group-hover:bg-monza-200/75 group-hover:shadow-lg">
                                    <WrenchIcon className="text-monza-500 group-hover:text-monza-500/80" size={48} />
                                </div>
                                <div className="md:max-w-md">
                                    <h3 className="font-bold text-lg">Servis Kerusakan</h3>
                                    <p>Perbaikan terhadap alat pemadam kebakaran yang mengalami rusak minor atau berat.</p>
                                </div>
                            </div>
                            <div className="border shadow-sm border-zinc-200 px-12 md:px-4 py-6 rounded-lg md:border-0 md:shadow-none lg:px-0 lg:py-0 lg:rounded-none group flex flex-col items-center text-center space-y-4 max-w-7xl lg:w-1/3">
                                <div className="bg-monza-100 p-2 rounded-lg group-hover:bg-monza-200/75 group-hover:shadow-lg">
                                    <ReplaceIcon className="text-monza-500 group-hover:text-monza-500/80" size={48} />
                                </div>
                                <div className="md:max-w-md">
                                    <h3 className="font-bold text-lg">Penggantian Alat</h3>
                                    <p>Peralatan memiliki masa kedaluwarsa sehingga perlu dilakukan penggantian.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="flex justify-center pb-0">
                    <div className="max-w-7xl py-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-8 mx-8 my-4">
                            <Image src="/maintenance/engineer.jpg" height={1080} width={1920} alt="Teknisi Indoka Surya Jaya" priority className="col-span-1 aspect-video border border-zinc-200 object-cover rounded-2xl" />
                            <div className="col-span-1 flex flex-col justify-between gap-8 overflow-hidden">
                                <div className="space-y-3">
                                    <h2 className="font-bold text-monza-500 text-4xl">Rawat Alat Pemadam Secara Rutin melalui Teknisi Profesional</h2>
                                    <p className="text-lg">Pastikan alat pemadam api Anda diinspeksi secara rutin setiap 6 atau 12 bulan sesuai Pasal 11 (1) Peraturan Menteri No: PER.04/MEN/1980. Kontak teknisi Indoka untuk layanan lebih lanjut.</p>
                                    <div className="space-x-4 flex justify-start ">
                                        <Link target="_blank" href={"https://wa.me/+6285100665789?text=Halo, saya ingin melakukan konsultasi mengenai layanan maintenance " + process.env.NEXT_PUBLIC_APP_NAME}>
                                            <Button variant="monza_destructive" className="group pl-3 pr-2 justify-between gap-4" size={"lg"}>
                                                <p>Konsultasi Gratis</p>
                                                <div className="bg-zinc-50 rounded-md p-1">
                                                    <ArrowRight size={16} className="text-monza-500 -rotate-45 group-hover:rotate-0 transition-all" />
                                                </div>
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <h3 className="font-medium">Our client</h3>
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
                                                    className="filter grayscale opacity-50 brightness-75 hover:filter-none hover:opacity-100 hover:brightness-100"
                                                />
                                            </div>
                                        ))}
                                    </Marquee>
                                </div>
                            </div>
                        </div>
                    </div>
                </section >

                <section className="flex justify-center pb-0">
                    <div className="max-w-7xl py-6">
                        <div className="flex flex-col lg:flex-row lg:justify-between items-center gap-8 mx-8 my-4">
                            <div className="flex flex-col justify-between gap-8">
                                <div className="space-y-3 text-start">
                                    <h2 className="font-bold text-monza-500 text-4xl">Engineer that Comply.</h2>
                                    <p className="text-lg">Teknisi mekanik dan engineer Indoka Surya Jaya bekerja dengan mengikuti standar internasional National Fire Codes, Mc. Guiness, serta Stein & Reynolds, memaksimalkan pengamanan properti dari risiko kebakaran.</p>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    <div className="flex flex-col justify-start p-6 border rounded-lg bg-zinc-50 hover:bg-zinc-50/80 hover:drop-shadow-md">
                                        <h3 className="font-bold">NFPA-10, Standard for Portable Fire Extinguisher</h3>
                                        <p className="text-zinc-700">Regulasi perawatan alat pemadam api portable dengan tujuan keselamatan oleh United States NFPA.</p>
                                    </div>
                                    <div className="flex flex-col justify-start p-6 border rounded-lg bg-zinc-50 hover:bg-zinc-50/80 hover:drop-shadow-md">
                                        <h3 className="font-bold">NFPA-14, Standard for The Installation of Standpipe and Hose Systems</h3>
                                        <p className="text-zinc-700">Regulasi pemasangan sistem pipa standar dan selang pemadam kebakaran oleh United States NFPA.</p>
                                    </div>
                                    <div className="flex flex-col justify-start p-6 border rounded-lg bg-zinc-50 hover:bg-zinc-50/80 hover:drop-shadow-md">
                                        <h3 className="font-bold">NFPA-13, Standard for The Installation of Sprinkler Systems</h3>
                                        <p className="text-zinc-700">Regulasi pemasangan sistem sprinkler untuk pencegahan kebakaran oleh United States NFPA.</p>
                                    </div>
                                    <div className="flex flex-col justify-start p-6 border rounded-lg bg-zinc-50 hover:bg-zinc-50/80 hover:drop-shadow-md">
                                        <h3 className="font-bold">NFPA-20, Standard for The Installation of Centrifugal Fire Pumps</h3>
                                        <p className="text-zinc-700">Regulasi pemasangan pompa pemadam kebakaran berputar oleh United States NFPA.</p>
                                    </div>
                                    <div className="flex flex-col justify-start p-6 border rounded-lg bg-zinc-50 hover:bg-zinc-50/80 hover:drop-shadow-md">
                                        <h3 className="font-bold">SNI 03-1735-2000 & SNI 03-1745-2000</h3>
                                        <p className="text-zinc-700">Regulasi tentang tata cara perencanaan akses dan pemasangan sistem pencegahan bahaya kebakaran pada bangunan gedung.</p>
                                    </div>
                                    <div className="flex flex-col justify-start p-6 border rounded-lg bg-zinc-50 hover:bg-zinc-50/80 hover:drop-shadow-md">
                                        <h3 className="font-bold">Mechanical and Electrical for Buildings</h3>
                                        <p className="text-zinc-700">Pedoman standar perencanaan sistem mekanikal dan elektrikal bangunan gedung oleh oleh Mc. Guiness Stein, & Reynolds.</p>
                                    </div>
                                </div>
                            </div>
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
