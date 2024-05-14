import { ArrowRight, BlocksIcon, FireExtinguisherIcon, UserSquare2 } from "lucide-react";
import Image from "next/image";

const Marketplace = () => (
    <section className="flex justify-center pb-0">
        <div className="max-w-7xl py-12 my-4">
            <div className="flex flex-col justify-center items-center text-center mb-8 mx-8 ">
                <h2 className="mb-3 font-bold text-monza-500 text-4xl">Marketplace Proteksi Kebakaran</h2>
                <p className="text-lg max-w-3xl">Penuhi kebutuhan proteksi kebakaran Anda dengan mudah melalui marketplace Indoka Surya Jaya. Gratis pengiriman untuk daerah Badung, Denpasar, dan Gianyar.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center content-between mx-8">
                <div className="group max-w-sm bg-white border border-zinc-200 rounded-lg shadow dark:bg-zinc-800 dark:border-zinc-700 cursor-pointer">
                    <Image
                        src={"/products/fire-extinguisher.png"}
                        alt="APAR"
                        width={1000} height={1000} className="rounded-t-lg aspect-[1/1] object-cover border border-zinc-200 border-t-0 border-l-0 border-r-0"
                    />
                    <div className="flex flex-row justify-between p-5 items-center group-hover:bg-zinc-50">
                        <div>
                            <h5 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">APAR</h5>
                        </div>
                        <div className="bg-white border rounded-md p-1">
                            <ArrowRight size={24} className="text-monza-500 -rotate-45 group-hover:rotate-0 transition-all" />
                        </div>
                    </div>
                </div>
                <div className="group max-w-sm bg-white border border-zinc-200 rounded-lg shadow dark:bg-zinc-800 dark:border-zinc-700 cursor-pointer">
                    <Image
                        src={"/products/fire-alarm.png"}
                        alt="APAR"
                        width={1000} height={1000} className="rounded-t-lg aspect-[1/1] object-cover border border-zinc-200 border-t-0 border-l-0 border-r-0"
                    />
                    <div className="flex flex-row justify-between p-5 items-center group-hover:bg-zinc-50">
                        <div>
                            <h5 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Fire Alarm</h5>
                        </div>
                        <div className="bg-white border rounded-md p-1">
                            <ArrowRight size={24} className="text-monza-500 -rotate-45 group-hover:rotate-0 transition-all" />
                        </div>
                    </div>
                </div>
                <div className="group max-w-sm bg-white border border-zinc-200 rounded-lg shadow dark:bg-zinc-800 dark:border-zinc-700 cursor-pointer">
                    <Image
                        src={"/products/fire-ball.png"}
                        alt="APAR"
                        width={1000} height={1000} className="rounded-t-lg aspect-[1/1] object-cover border border-zinc-200 border-t-0 border-l-0 border-r-0"
                    />
                    <div className="flex flex-row justify-between p-5 items-center group-hover:bg-zinc-50">
                        <div>
                            <h5 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Fire Ball</h5>
                        </div>
                        <div className="bg-white border rounded-md p-1">
                            <ArrowRight size={24} className="text-monza-500 -rotate-45 group-hover:rotate-0 transition-all" />
                        </div>
                    </div>
                </div>
                <div className="group max-w-sm bg-white border border-zinc-200 rounded-lg shadow dark:bg-zinc-800 dark:border-zinc-700 cursor-pointer">
                    <Image
                        src={"/products/box-apar.jpeg"}
                        alt="APAR"
                        width={1000} height={1000} className="rounded-t-lg aspect-[1/1] object-cover border border-zinc-200 border-t-0 border-l-0 border-r-0"
                    />
                    <div className="flex flex-row justify-between p-5 items-center group-hover:bg-zinc-50">
                        <div>
                            <h5 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Box APAR</h5>
                        </div>
                        <div className="bg-white border rounded-md p-1">
                            <ArrowRight size={24} className="text-monza-500 -rotate-45 group-hover:rotate-0 transition-all" />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </section>
);

export default Marketplace;
