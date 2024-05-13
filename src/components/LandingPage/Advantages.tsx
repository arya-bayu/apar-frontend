import { ArrowRight, HeadphonesIcon, FlagIcon, PercentSquareIcon, SparkleIcon, HeadsetIcon } from "lucide-react";
import { Button } from "../ui/button";

const Advantages = () => (
    <section className="flex justify-center pb-0">
        <div className="max-w-7xl py-12">
            <div className="flex flex-col lg:flex-row lg:justify-between items-center gap-8 mx-8 my-4">
                <div className="flex-grow w-full lg:w-2/3 aspect-[3/4] bg-monza-200 rounded-2xl">

                </div>
                <div className="flex flex-col justify-between gap-8">
                    <div className="space-y-3">
                        <h2 className="font-bold text-monza-500 text-4xl">Mengapa Anda harus mempercayai Indoka Surya Jaya?</h2>
                        <p className="text-lg">Pelajari alasan utama mengapa Indoka Surya Jaya merupakan pilihan terbaik untuk kebutuhan proteksi kebakaran bisnis Anda.</p>
                        <div className="space-x-4 flex justify-start ">
                            <Button variant="monza_destructive" className="group pl-3 pr-2 justify-between gap-4" size={"lg"}>
                                <p>Hubungi Kami</p>
                                <div className="bg-zinc-50 rounded-md p-1">
                                    <ArrowRight size={16} className="text-monza-500 -rotate-45 group-hover:rotate-0 transition-all" />
                                </div>
                            </Button>
                            <Button variant="outline" className="group pl-3 pr-2 justify-between gap-4 bg-zinc-50" size={"lg"}>
                                <p>Lihat produk</p>
                                <div className="bg-white border rounded-md p-1">
                                    <ArrowRight size={16} className="text-monza-500 -rotate-45 group-hover:rotate-0 transition-all" />
                                </div>
                            </Button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="flex flex-col justify-start p-6 border rounded-lg bg-zinc-50 hover:bg-zinc-50/80 hover:drop-shadow-md">
                            <SparkleIcon size={36} className="mb-2 text-monza-500" />
                            <h3 className="font-bold">Quality Assurance</h3>
                            <p className="text-zinc-700">Setiap produk melalui quality assurance yang ketat dengan standar keamanan terbaik.</p>
                        </div>
                        <div className="flex flex-col justify-start p-6 border rounded-lg bg-zinc-50 hover:bg-zinc-50/80 hover:drop-shadow-md">
                            <PercentSquareIcon size={36} className="mb-2 text-monza-500" />
                            <h3 className="font-bold">Harga Kompetitif</h3>
                            <p className="text-zinc-700">Kemitraan dengan produsen memungkinkan harga terbaik untuk barang berkualitas.</p>
                        </div>
                        <div className="flex flex-col justify-start p-6 border rounded-lg bg-zinc-50 hover:bg-zinc-50/80 hover:drop-shadow-md">
                            <FlagIcon size={36} className="mb-2 text-monza-500" />
                            <h3 className="font-bold">Pengantaran tepat waktu</h3>
                            <p className="text-zinc-700">Siklus produksi yang cepat memungkinkan produk tersedia tepat waktu.</p>
                        </div>
                        <div className="flex flex-col justify-start p-6 border rounded-lg bg-zinc-50 hover:bg-zinc-50/80 hover:drop-shadow-md">
                            <HeadsetIcon size={36} className="mb-2 text-monza-500" />
                            <h3 className="font-bold">After Sales Terbaik</h3>
                            <p className="text-zinc-700">Sejak instalasi hingga perawatan, tim after sales selalu tersedia untuk Anda.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
);

export default Advantages;
