import { BlocksIcon, FireExtinguisherIcon, UserSquare2 } from "lucide-react";

const Services = () => (
    <section className="flex justify-center">
        <div className="max-w-7xl pt-12 pb-6">
            <div className="flex flex-col lg:flex-row gap-12 mx-8 my-4">
                <div className="border shadow-sm border-zinc-200 px-12 md:px-4 py-6 rounded-lg md:border-0 md:shadow-none lg:px-0 lg:py-0 lg:rounded-none group flex flex-col items-center text-center space-y-4 max-w-7xl lg:w-1/3">
                    <div className="bg-monza-100 p-2 rounded-lg group-hover:bg-monza-200/75 group-hover:shadow-lg">
                        <UserSquare2 className="text-monza-500 group-hover:text-monza-500/80" size={48} />
                    </div>
                    <div className="md:max-w-md">
                        <h3 className="font-bold text-lg">Konsultan</h3>
                        <p>Indoka Surya Jaya selalu tersedia untuk membantu perusahaan memenuhi kebutuhan proteksi kebakarannya.</p>
                    </div>
                </div>
                <div className="border shadow-sm border-zinc-200 px-12 md:px-4 py-6 rounded-lg md:border-0 md:shadow-none lg:px-0 lg:py-0 lg:rounded-none group flex flex-col items-center text-center space-y-4 max-w-7xl lg:w-1/3">
                    <div className="bg-monza-100 p-2 rounded-lg group-hover:bg-monza-200/75 group-hover:shadow-lg">
                        <FireExtinguisherIcon className="text-monza-500 group-hover:text-monza-500/80" size={48} />
                    </div>
                    <div className="md:max-w-md">
                        <h3 className="font-bold text-lg">Training</h3>
                        <p>Pelatihan profesional untuk meningkatkan pemahaman dan keterampilan dalam menghadapi kebakaran.</p>
                    </div>
                </div>
                <div className="border shadow-sm border-zinc-200 px-12 md:px-4 py-6 rounded-lg md:border-0 md:shadow-none lg:px-0 lg:py-0 lg:rounded-none group flex flex-col items-center text-center space-y-4 max-w-7xl lg:w-1/3">
                    <div className="bg-monza-100 p-2 rounded-lg group-hover:bg-monza-200/75 group-hover:shadow-lg">
                        <BlocksIcon className="text-monza-500 group-hover:text-monza-500/80" size={48} />
                    </div>
                    <div className="md:max-w-md">
                        <h3 className="font-bold text-lg">Vendor</h3>
                        <p>Indoka Surya Jaya merupakan perusahaan penyedia kebutuhan sistem kebakaran terintegrasi yang dapat diandalkan.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>
);

export default Services;
