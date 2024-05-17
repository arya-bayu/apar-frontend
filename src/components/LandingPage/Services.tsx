import { BlocksIcon, FireExtinguisherIcon, UserSquare2 } from "lucide-react";

const Services = () => (
    <section className="flex justify-center pb-0">
        <div className="max-w-7xl py-6">
            <div className="flex flex-col lg:flex-row gap-12 mx-8 my-4">
                <div className="border shadow-lg border-zinc-200 px-4 py-6 rounded-lg lg:border-0 lg:shadow-none lg:px-0 lg:py-0 lg:rounded-none group flex flex-col items-center text-center space-y-4 max-w-sm md:max-w-md lg:w-1/3">
                    <div className="bg-monza-100 p-4 rounded-lg group-hover:bg-monza-200/75 group-hover:shadow-lg">
                        <UserSquare2 className="text-monza-500 group-hover:text-monza-500/80" size={48} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Konsultan</h3>
                        <p>Indoka Surya Jaya selalu tersedia untuk membantu perusahaan memenuhi kebutuhan proteksi kebakarannya.</p>
                    </div>
                </div>
                <div className="border shadow-lg border-zinc-200 px-4 py-6 rounded-lg lg:border-0 lg:shadow-none lg:px-0 lg:py-0 lg:rounded-none group flex flex-col items-center text-center space-y-4 max-w-sm md:max-w-md lg:w-1/3">
                    <div className="bg-monza-100 p-2 rounded-lg group-hover:bg-monza-200/75 group-hover:shadow-lg">
                        <FireExtinguisherIcon className="text-monza-500 group-hover:text-monza-500/80" size={48} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Training</h3>
                        <p>Pelatihan profesional untuk meningkatkan pemahaman dan keterampilan dalam menghadapi kebakaran.</p>
                    </div>
                </div>
                <div className="border shadow-lg border-zinc-200 px-4 py-6 rounded-lg lg:border-0 lg:shadow-none lg:px-0 lg:py-0 lg:rounded-none group flex flex-col items-center text-center space-y-4 max-w-sm md:max-w-md lg:w-1/3">
                    <div className="bg-monza-100 p-2 rounded-lg group-hover:bg-monza-200/75 group-hover:shadow-lg">
                        <BlocksIcon className="text-monza-500 group-hover:text-monza-500/80" size={48} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Vendor</h3>
                        <p>Indoka Surya Jaya merupakan perusahaan penyedia kebutuhan sistem kebakaran terintegrasi yang dapat diandalkan.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>
);

export default Services;
