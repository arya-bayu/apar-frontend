import { useBreakpoint } from "@/hooks/useBreakpoint";
import fetcher from "@/lib/fetcher";
import { formatNameForSlug, shuffleArray } from "@/lib/utils";
import { ICategory } from "@/types/category";
import { ArrowRight, HeadsetIcon, TruckIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import useSWR from "swr";

const Marketplace = () => {
    const [randomCategories, setRandomCategories] = useState<ICategory[]>()

    const {
        data: categories
    } = useSWR(
        'api/v1/categories/?columns=id,name,image',
        fetcher, {
        keepPreviousData: true,
    })

    const filteredCategories = categories?.data?.filter((category: ICategory) => category.image !== null);

    useEffect(() => {
        if (!categories) return;

        shuffleArray(filteredCategories)
        setRandomCategories(filteredCategories.slice(0, 4));

    }, [categories])

    const { isAboveSm } = useBreakpoint('sm')
    const { isBelowLg, isAboveLg } = useBreakpoint('lg')

    if (!filteredCategories) return <></>
    return (
        <section className={`${filteredCategories.length > 0 ? "flex" : "hidden"} justify-center pb-0`}>
            <div className="max-w-7xl py-6 my-4">
                <div className="flex flex-col justify-center items-center text-center mb-8 mx-8 ">
                    <h2 className="mb-3 font-bold text-monza-500 text-4xl">Marketplace Proteksi Kebakaran</h2>
                    <p className="text-lg max-w-3xl">Penuhi kebutuhan proteksi kebakaran Anda dengan mudah melalui marketplace Indoka Surya Jaya. Gratis pengiriman untuk daerah Badung, Denpasar, dan Gianyar.</p>
                </div>
                <div
                    style={{
                        gridTemplateColumns: `repeat(${isAboveSm && isBelowLg ? filteredCategories.length < 4 ? 1 : 2 : isAboveLg ? filteredCategories.length < 4 ? filteredCategories.length : 4 : 1}, minmax(0, 1fr))`,
                    }}
                    className={`grid gap-6 justify-items-center content-between mx-8`}>
                    {randomCategories && randomCategories.map((category, index) => (
                        <div key={index} className="group max-w-sm bg-white border border-zinc-200 rounded-lg shadow dark:bg-zinc-800 dark:border-zinc-700">

                            <Link target="_blank" href={`/store/${category.id}/${formatNameForSlug(category.name)}`}>
                                <Image
                                    priority
                                    src={process.env.NEXT_PUBLIC_BACKEND_URL + `/storage/` + category.image?.path}
                                    alt={`Foto ` + category.name}
                                    width={1000} height={1000} className="rounded-t-lg aspect-[1/1] object-cover border border-zinc-200 border-t-0 border-l-0 border-r-0"
                                />
                                <div className="flex flex-row justify-between p-5 items-center group-hover:bg-zinc-50">
                                    <div>
                                        <h5 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white line-clamp-1">{category.name}</h5>
                                    </div>
                                    <div className="bg-white border rounded-md p-1">
                                        <ArrowRight size={24} className="text-monza-500 -rotate-45 group-hover:rotate-0 transition-all" />
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))

                    }
                </div>
                <div className="flex flex-col items-center space-y-4 sm:flex-row sm:justify-between sm:space-x-8 sm:space-y-0 mt-8 mx-8">
                    <div className="group flex flex-row items-center text-start space-x-4 max-w-sm md:max-w-md lg:w-1/2">
                        <div className="bg-monza-100 p-2 rounded-lg group-hover:bg-monza-200/75 group-hover:shadow-lg">
                            <TruckIcon className="text-monza-500 group-hover:text-monza-500/80" size={48} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Gratis Ongkir</h3>
                            <p>Untuk wilayah Badung, Denpasar, dan Gianyar</p>
                        </div>
                    </div>
                    <div className="group flex flex-row items-center text-start space-x-4 max-w-sm md:max-w-md lg:w-1/2">
                        <div className="bg-monza-100 p-2 rounded-lg group-hover:bg-monza-200/75 group-hover:shadow-lg">
                            <HeadsetIcon className="text-monza-500 group-hover:text-monza-500/80" size={48} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Konsultasi 24/7</h3>
                            <p>Ahli selalu tersedia untuk menjawab kebutuhanmu.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
};

export default Marketplace;
