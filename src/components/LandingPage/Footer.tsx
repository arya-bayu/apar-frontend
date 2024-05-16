import Image from "next/image";
import Link from "next/link"
import { RiInstagramLine, RiWhatsappLine } from "react-icons/ri";

const footerLinks = [
    {
        title: "Produk",
        links: [
            { title: "APAR", href: "/categories/apar" },
            { title: "Fire Alarm", href: "/categories/fire-alarm" },
            { title: "Fire Ball", href: "/categories/fire-ball" },
            { title: "Box APAR", href: "/categories/box-apar" },
        ]
    },
    {
        title: "Layanan",
        links: [
            { title: "Maintenance", href: "/services/maintenance" },
            { title: "Pelatihan", href: "/services/training" },
            { title: "Refill", href: "/services/refill" },
        ]
    },
    {
        title: "Perusahaan",
        links: [
            { title: "Hubungi Kami", href: "/contact-us" },
        ]
    },
]

export const Footer = () => {
    return (
        <footer className={`flex justify-center bg-white text-zinc-900 text-md`}>
            <div className="max-w-7xl w-full py-12 mx-12">
                <div className="flex flex-col lg:flex-row justify-between gap-12">
                    <div className="flex flex-col justify-between">
                        <div className="flex flex-col justify-start">
                            <div className="flex flex-row items-center space-x-4">
                                <Image
                                    src="/logo.png"
                                    width={'36'}
                                    height={'36'}
                                    alt="Logo"
                                />
                                <p className="font-medium">© 2024</p>
                            </div>
                            <p className="mt-4 font-bold text-monza-500">{process.env.NEXT_PUBLIC_APP_NAME}</p>
                            <p className="max-w-sm">Jl. Letda Reta No.19, Dangin Puri Klod, Kec. Denpasar Tim., Kota Denpasar, Bali 80232</p>
                        </div>
                        <div className="flex flex-row text-lg gap-4 -ml-[0.1rem] mt-4 text-zinc-500 [&_a:hover]:text-zinc-400 [&_a:hover]:transition-colors">
                            <Link href="https://instagram.com/indokasuryajaya" target="_blank" aria-label="Instagram">
                                <RiInstagramLine size={30} />
                            </Link>
                            <Link href="https://wa.me/+62812345678" target="_blank" aria-label="Instagram">
                                <RiWhatsappLine size={30} />
                            </Link>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-12 lg:gap-24">
                        {footerLinks.map((column, index) => (
                            <div key={index} className="flex flex-col text-md">
                                <p className="font-bold mb-6">{column.title}</p>
                                <ul>
                                    {column.links.map((link, index) => (
                                        <li key={index} className="[&_a]:last:mb-0">
                                            <Link className="text-zinc-600 mb-3 block hover:text-zinc-500 transition-colors" href={link.href} target={"_blank"}>{link.title}</Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    )
}