import Head from 'next/head'
import FloatingChatButton from "@/components/FloatingChatButton"
import CTA from "@/components/LandingPage/CTA"
import { Footer } from "@/components/LandingPage/Footer"
import { Header } from "@/components/LandingPage/Header"
import React, { useEffect, useMemo, useState } from "react"
import fetcher from "@/lib/fetcher";
import useSWR from "swr";
import { Button } from "@/components/ui/button"
import { formatNameForSlug } from "@/lib/utils"
import { useRouter } from "next/router"
import LoadingSpinner from "@/components/LoadingSpinner"
import { ArrowRight } from "lucide-react"
import currencyFormatter from "@/lib/currency"
import 'react-responsive-carousel/lib/styles/carousel.css';
import RichTextViewer from "@/components/TextViewer"
import EmblaCarousel from '@/components/EmblaCarousel'
import { EmblaOptionsType } from 'embla-carousel'
import Link from "next/link"

const OPTIONS: EmblaOptionsType = {}
const SLIDE_COUNT = 10
const SLIDES = Array.from(Array(SLIDE_COUNT).keys())

export default function CategoryPage() {
    const router = useRouter();
    const { id, slug } = router.query;
    const [redirected, setRedirected] = useState(false);

    const productUrl = `api/v1/products/${id}`;
    const { data: product, error: productError, isValidating: isProductValidating } = useSWR(productUrl, fetcher, { keepPreviousData: true });

    if (productError) {
        router.push('/404');
    }

    useEffect(() => {
        if (!product || redirected) return;

        const correctSlug = formatNameForSlug(product?.data?.name);

        if (slug !== correctSlug) {
            setRedirected(true);
            router.replace(`/product/${id}/${correctSlug}`);
        }
    }, [slug, product, redirected, router, id]);

    if (!product || isProductValidating) {
        return <LoadingSpinner className="h-screen" size={36} />;
    }

    const title = `Jual ` + product?.data?.name + ` | ` + process.env.NEXT_PUBLIC_APP_NAME + ` - Marketplace Alat Pemadam Kebakaran No. 1 di Bali`

    return (
        <div>
            <Head>
                <title>{title}</title>
            </Head>

            <Header />
            <main>
                <section className="flex justify-center pb-0">
                    <div className="max-w-7xl py-6">
                        <div className="flex flex-col lg:flex-row items-start gap-8 mx-8 lg:mx-12 my-6">
                            <div className="lg:w-1/3 space-y-6">
                                <EmblaCarousel images={product?.data?.images} options={OPTIONS} />
                                <div>
                                    <Link
                                        target="_blank"
                                        href={"https://wa.me/+6285100665789?text=Halo " + process.env.NEXT_PUBLIC_APP_NAME + ", saya ingin memesan barang sebagai berikut: %0aNama produk: " + product?.data?.name + " %0aNomor seri: " + product?.data?.serial_number + " %0aHarga produk: " + currencyFormatter(product?.data?.price) + " %0aTerima kasih."}>
                                        <Button variant="default" className="w-full bg-whatsapp text-white group pl-3 pr-2 justify-between gap-4 rounded-md mt-0" size={"lg"}>
                                            <p>Pesan Sekarang</p>
                                            <div className="bg-zinc-50 rounded-md p-1">
                                                <ArrowRight size={16} className="text-whatsapp -rotate-45 group-hover:rotate-0 transition-all" />
                                            </div>
                                        </Button>
                                    </Link>
                                </div>
                            </div>

                            <div className="lg:w-2/3 space-y-6">
                                <div>
                                    <h1 className="font-bold text-2xl">{product?.data?.name}</h1>
                                    <p className="font-medium text-lg">{currencyFormatter(product?.data?.price)}</p>
                                </div>

                                <RichTextViewer value={product?.data?.description} />

                            </div>
                        </div>
                    </div>
                </section>
                <CTA />
            </main >
            <Footer />
            <FloatingChatButton message={`Halo, saya tertarik dengan layanan ${process.env.NEXT_PUBLIC_APP_NAME}`} />
        </div >
    )
}
