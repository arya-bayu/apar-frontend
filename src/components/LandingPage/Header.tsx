import { useEffect, useState } from 'react';
import Image from 'next/image';
import { LandingPageNavigation } from './Navigation';
import { CaretDownIcon } from "@radix-ui/react-icons";
import { FireExtinguisher, HardHat, Wrench } from "lucide-react";
import Link from "next/link";

export const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLayananOpen, setIsLayananOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const toggleLayanan = () => {
        setIsLayananOpen(!isLayananOpen);
    };

    useEffect(() => {
        if (!isMenuOpen) setIsLayananOpen(false)
    }, [isMenuOpen])

    return (
        <header className="sticky top-0 z-50 bg-white border-b h-14 flex">
            <div className="w-[80rem] relative mx-auto flex flex-row justify-center items-center">
                <div className="absolute left-4 lg:left-12">
                    <Link href={"/"} className="space-y-1">
                        <Image
                            src="/logo.png"
                            width={'32'}
                            height={'32'}
                            alt="Logo"
                        />
                    </Link>
                </div>
                <div className="flex-grow justify-center hidden sm:flex">
                    <LandingPageNavigation />
                </div>

                <button onClick={toggleMenu}
                    className="flex flex-col justify-center items-center sm:hidden absolute right-4 lg:right-12">
                    <span className={`bg-zinc-900 block transition-all duration-300 ease-out 
                    h-0.5 w-6 rounded-sm ${isMenuOpen ?
                            'rotate-45 translate-y-1' : '-translate-y-0.5'
                        }`} >
                    </span>
                    <span className={`bg-zinc-900 block transition-all duration-300 ease-out 
                    h-0.5 w-6 rounded-sm my-0.5 ${isMenuOpen ?
                            'opacity-0' : 'opacity-100'
                        }`} >
                    </span>
                    <span className={`bg-zinc-900 block transition-all duration-300 ease-out 
                    h-0.5 w-6 rounded-sm ${isMenuOpen ?
                            '-rotate-45 -translate-y-1' : 'translate-y-0.5'
                        }`} >
                    </span>

                </button>

                <div className={`absolute top-14 left-0 right-0 bg-white shadow-md sm:hidden divide-y-[1.5px] divide-zinc-200 px-4 py-5 space-y-5 transition-all duration-100 ease-in-out ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="text-md font-medium text-zinc-600/80">
                        <div className={`flex items-center space-x-[2px] ${isLayananOpen ? 'text-zinc-950' : ''} transition-all duration-50`} onClick={toggleLayanan}>
                            <p>Layanan</p>
                            <CaretDownIcon className={`text-zinc-900 transition-all ${isLayananOpen && '-rotate-180'}`} />
                        </div>
                        <ul
                            className={`text-md font-medium text-zinc-600 space-y-5 duration-150 ease-in-out overflow-hidden ${isLayananOpen ? 'max-h-screen opacity-100 pt-5' : 'max-h-0 opacity-0'}`}>
                            <li>
                                <Link href={"/layanan/pelatihan"} className="space-y-1" onClick={toggleMenu}>
                                    <div className="flex items-center space-x-2">
                                        <HardHat size={20} />
                                        <p>Pelatihan</p>
                                    </div>
                                    <p className="text-sm font-normal">Pelatihan pemadaman kebakaran terhadap instansi dan perusahaan</p>
                                </Link>
                            </li>
                            <li>
                                <Link href={"/layanan/maintenance"} className="space-y-1" onClick={toggleMenu}>
                                    <div className="flex items-center space-x-2">
                                        <Wrench size={20} />
                                        <p>Maintenance</p>
                                    </div>
                                    <p className="text-sm font-normal">Perawatan berkala untuk produk fire protection mitra Indoka Surya Jaya</p>
                                </Link>
                            </li>
                            <li>
                                <Link href={"/layanan/refill"} className="space-y-1" onClick={toggleMenu}>
                                    <div className="flex items-center space-x-2">
                                        <FireExtinguisher size={20} />
                                        <p>Refill</p>
                                    </div>
                                    <p className="text-sm font-normal">Pengisian ulang tabung pemadam api dengan berbagai jenis media</p>
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div className="pt-5 text-md font-medium text-zinc-500 space-y-5">
                        <Link href={"/store"} className="flex items-center space-x-[2px]" onClick={toggleMenu}>
                            <p>Store</p>
                        </Link>
                    </div>
                    <div className="pt-5 text-md font-medium text-zinc-500 space-y-5">
                        <Link href={"/contact-us"} className="flex items-center space-x-[2px]" onClick={toggleMenu}>
                            <p>Hubungi kami</p>
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
};
