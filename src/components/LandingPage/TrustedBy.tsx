import Image from "next/image";
import Marquee from "react-fast-marquee";

const brands = [
    { name: "Jaya Fried Chicken (JFC)", logo: "/partner/jaya-fried-chicken.png" },
    { name: "Ace Hardware", logo: "/partner/ace-hardware.png" },
    { name: "Garuda Wisnu Kencana by Alam Sutera", logo: "/partner/garuda-wisnu-kencana.svg" },
    { name: "Dealer Resmi Mitsubishi Motors Indonesia PT. Bumen Redja Abadi", logo: "/partner/mitsubishi-motors.png" },
    { name: "PT. Ajinomoto", logo: "/partner/ajinomoto.png" },
    { name: "Boshe", logo: "/partner/boshe.jpg" },
    { name: "CAS Cargo & Logistic", logo: "/partner/cas.png" },
    { name: "Conato Bakery", logo: "/partner/conato.png" },
    { name: "PT. Duta Intika (Kawasaki)", logo: "/partner/duta-intika-kawasaki.png" },
    { name: "Everyday Smart Hotel", logo: "/partner/everyday-smart-hotel.png" },
    { name: "Hanamasa", logo: "/partner/hanamasa.jpg" },
    { name: "PT. Wahana Indo Trada (Indomobil Nissan Datsun)", logo: "/partner/wahana-indo-trada-indomobil-nissan-datsun.png" },
    { name: "PT. Waja Motor Yamaha", logo: "/partner/waja-motor-yamaha.png" },
    { name: "PT. Warung Mina", logo: "/partner/warung-mina.jpg" }
];



const TrustedBy = () => (
    <section className="flex justify-center pb-0 bg-white overflow-hidden border border-zinc-200 border-l-0 border-r-0">
        <div className="max-w-7xl py-6">
            <div className="flex flex-col justify-center items-center space-y-6">
                <p className="font-normal text-lg w-screen px-6 text-center leading-snug">Dipercaya oleh <span className="font-bold">174+ perusahaan terkemuka di Bali</span>.</p>
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
        </div>
    </section>
);

export default TrustedBy;
