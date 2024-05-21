import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const Hero = () => (
    <section className="flex justify-center pb-0 bg-monza-50 bg-gradient-to-b from-transparent via-transparent to-stone-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-12 pb-0 lg:flex pt-16">
            <div className="mx-auto">
                <div className="flex justify-center lg:justify-start mb-4">
                    <div className="inline-block bg-gradient-to-r from-monza-600/75 to-monza-600 rounded-lg px-3 py-1">
                        <p className="font-bold text-sm lg:text-md text-transparent bg-clip-text bg-gradient-to-r from-monza-50 to-white">
                            #1 Fire Protection di Bali
                        </p>
                    </div>
                </div>
                <h1 className="text-center lg:text-left max-w-2xl lg:max-w-5xl mb-4 text-5xl lg:text-6xl font-extrabold tracking-tight leading-none  dark:text-white">
                    Fire Protection<br />Specialist.
                </h1>
                <p className="text-center lg:text-left max-w-2xl lg:max-w-5xl mb-6 font-light text-zinc-700 lg:mb-8 md:text-lg lg:text-2xl">
                    Vendor penyedia layanan satu pintu untuk perencanaan, instalasi, dan perawatan sistem proteksi kebakaran perusahaan.
                </p>
                <div className="space-x-4 flex justify-center lg:justify-start ">
                    <Link target="_blank" href="/contact-us">
                        <Button variant="monza_destructive" className="group pl-3 pr-2 justify-between gap-4" size={"lg"}>
                            <p>Hubungi Kami</p>
                            <div className="bg-zinc-50 rounded-md p-1">
                                <ArrowRight size={16} className="text-monza-500 -rotate-45 group-hover:rotate-0 transition-all" />
                            </div>
                        </Button>
                    </Link>
                    <Link href="/store">
                        <Button variant="outline" className="group pl-3 pr-2 justify-between gap-4 bg-zinc-50" size={"lg"}>
                            <p>Lihat produk</p>
                            <div className="bg-white border rounded-md p-1">
                                <ArrowRight size={16} className="text-monza-500 -rotate-45 group-hover:rotate-0 transition-all" />
                            </div>
                        </Button>
                    </Link>
                </div>
            </div>
            <div className="mx-auto mt-16 lg:mt-0 overflow-hidden flex justify-center lg:justify-normal max-w-2xl lg:ml-10 lg:mr-0 lg:max-w-none lg:flex-none xl:ml-24">
                <img src="/hero.png" alt="mockup" className="h-[25rem]" />
            </div>
        </div>
    </section>
);

export default Hero;
