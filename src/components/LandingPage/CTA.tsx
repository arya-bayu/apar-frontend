import { ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import Image from "next/image";
import Marquee from "react-fast-marquee";
import Link from "next/link";

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


const CTA = () => (
    <section className="flex flex-col overflow-hidden justify-center items-center mx-auto mt-8 bg-monza-50 bg-gradient-to-b from-transparent via-transparent to-stone-50 border border-zinc-200 border-l-0 border-r-0">
        <div className="flex flex-col items-center mx-12 py-12 ">
            <Image
                src="/logo.png"
                width={'64'}
                height={'64'}
                alt="Logo"
                className="mb-4"
            />
            <h2 className="text-4xl md:text-5xl mb-3 md:mb-4 font-bold text-monza-500 text-center">Ready to Protect?</h2>
            <p className="text-sm md:text-lg max-w-2xl text-center">Jadilah bagian dari ratusan pelanggan Indoka Surya Jaya untuk memastikan usaha Anda terproteksi dari risiko kebakaran.</p>
            <div className="mt-8 space-x-4 flex justify-center">
                <Link target="_blank" href="/contact-us">
                    <Button variant="monza_destructive" className="group pl-3 lg:pl-4 pr-2 lg:pr-3 lg:py-6 justify-between gap-4" size={"lg"}>
                        <p className="lg:text-lg">Hubungi Kami</p>
                        <div className="bg-zinc-50 rounded-md p-1">
                            <ArrowRight size={16} className="text-monza-500 -rotate-45 group-hover:rotate-0 transition-all" />
                        </div>
                    </Button>
                </Link>
                <Link href="/store">
                    <Button variant="outline" className="group pl-3 lg:pl-4 pr-2 lg:pr-3 lg:py-6 justify-between gap-4 bg-zinc-50" size={"lg"}>
                        <p className="lg:text-lg">Lihat produk</p>
                        <div className="bg-white border rounded-md p-1">
                            <ArrowRight size={16} className="text-monza-500 -rotate-45 group-hover:rotate-0 transition-all" />
                        </div>
                    </Button>
                </Link>
            </div>
        </div>
        <div className="hidden lg:block mt-10 mb-12 space-y-12 max-w-7xl w-full px-12  bg-transparent">
            <div className="flex justify-between">
                {brands.slice(0, 5).map((brand, index) => (
                    <div key={index} className="flex justify-center">
                        <Image
                            src={brand.logo}
                            width={100}
                            height={100}
                            alt={brand.name}
                            quality={100}
                            className="object-contain h-20 filter grayscale opacity-50 brightness-75 hover:filter-none hover:opacity-100 hover:brightness-100 transition-all duration-50"
                        />
                    </div>
                ))}
            </div>
            <div className="flex justify-evenly">
                {brands.slice(5).map((brand, index) => (
                    <div key={index} className="flex justify-center">
                        <Image
                            src={brand.logo}
                            width={100}
                            height={100}
                            alt={brand.name}
                            className="object-contain h-20 filter grayscale opacity-50 brightness-75 hover:filter-none hover:opacity-100 hover:brightness-100 transition-all duration-50"
                        />
                    </div>
                ))}
            </div>
        </div>
        <div className="block lg:hidden max-w-7xl py-6 bg-transparent">
            <Marquee
                speed={15}
                gradient={true}
                gradientColor="#fff"
                gradientWidth={300}
                autoFill

            >
                {brands.concat(brands).map((brand, index) => (
                    <div
                        key={index}
                        className="flex items-center mx-8 gap-6 md:gap-10"
                    >
                        <Image
                            src={brand.logo}
                            alt={brand.name}
                            height={30}
                            width={60}
                            priority
                        />
                    </div>
                ))}
            </Marquee>
        </div>
    </section >
);

export default CTA;
