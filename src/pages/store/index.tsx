import Head from 'next/head'
import FloatingChatButton from "@/components/FloatingChatButton"
import CTA from "@/components/LandingPage/CTA"
import { Footer } from "@/components/LandingPage/Footer"
import { Header } from "@/components/LandingPage/Header"
import React, { useEffect, useState } from "react"
import { FilterIcon } from "lucide-react"
import Image from "next/image";
import fetcher from "@/lib/fetcher";
import useSWR from "swr";
import { Input } from "@/components/ui/input"
import { Button, buttonVariants } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
    DropdownMenuSeparator,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { IProduct } from "@/types/product"
import currencyFormatter from "@/lib/currency"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { PaginationState } from "@tanstack/react-table"
import * as Lucide from 'lucide-react';
import { EditText } from "react-edit-text"
import { cn, formatNameForSlug } from "@/lib/utils"
import { useRouter } from "next/router"
import { IFeature } from "@/types/category"
import LoadingSpinner from "@/components/LoadingSpinner"
import useDebounce from "@/hooks/useDebounce"
import Link from "next/link"

export default function CategoryPage() {
    const router = useRouter();
    const [inputValue, setInputValue] = useState('')
    const [debouncedFilter, setDebouncedFilter] = useDebounce('', 1000)
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [filter, setFilter] = useState<string>('');
    const [sortBy, setSortBy] = useState<'latest' | 'highest_price' | 'lowest_price'>('latest');
    const [redirected, setRedirected] = useState(false);
    const [customPageIndex, setCustomPageIndex] = useState<string | null>(null);
    const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
        pageIndex: 1,
        pageSize: 12,
    });

    const productsUrl = `api/v1/products?columns=id,name,price,category_id&status=1&pageIndex=${pageIndex}&pageSize=${pageSize}${filter ? `&filter=${filter}` : ''}${sortBy ? `&sortBy=${sortBy}` : ''}`;
    const { data: products, isValidating: isProductsValidating } = useSWR(productsUrl, fetcher, { keepPreviousData: true });

    const pageCount = Array.from({ length: products?.data?.pageCount }, (_, i) => i + 1);

    const paginationRange = (() => {
        const start = Math.max(1, pageIndex - 1);
        const end = Math.min(pageCount.length, pageIndex + 1);
        const range = [];

        for (let i = start; i <= end; i++) {
            range.push(i);
        }

        return range;
    })

    useEffect(() => {
        setIsLoading(isProductsValidating)
    }, [isProductsValidating])

    useEffect(() => {
        setDebouncedFilter(inputValue)
    }, [inputValue])

    useEffect(() => {
        setFilter(debouncedFilter)
    }, [debouncedFilter])

    const title = `Marketplace Alat Pemadam Kebakaran No. 1 di Bali - ` + process.env.NEXT_PUBLIC_APP_NAME

    return (
        <div>
            <Head>
                <title>{title}</title>
            </Head>

            <Header />
            <main>
                <section className="flex border-b justify-center bg-monza-50 bg-gradient-to-b from-transparent via-transparent to-stone-50">
                    <div className="max-w-7xl w-full flex flex-col items-center lg:items-start px-6 lg:px-12 py-12">
                        <div>
                            <div className="flex justify-center lg:justify-start mb-4">
                                <div className="inline-block bg-gradient-to-r from-monza-600/75 to-monza-600 rounded-lg px-3 py-1">
                                    <p className="font-bold text-sm lg:text-md text-transparent bg-clip-text bg-gradient-to-r from-monza-50 to-white">
                                        #1 Fire Protection di Bali
                                    </p>
                                </div>
                            </div>
                            <h1 className="text-center mx-auto lg:mx-0 lg:text-left max-w-2xl lg:max-w-5xl mb-4 text-5xl lg:text-6xl font-extrabold tracking-tight leading-none dark:text-white">
                                Marketplace.
                            </h1>
                            <p className="text-center mx-auto lg:mx-0 lg:text-left max-w-2xl lg:max-w-5xl font-light text-zinc-700 md:text-lg lg:text-2xl">
                                Katalog alat proteksi kebakaran Indoka Surya Jaya
                            </p>
                        </div>
                    </div>
                </section>

                <section className="flex justify-center pb-0">
                    <div className="max-w-7xl lg:py-6 w-full">
                        <div className="flex flex-col gap-8 mx-4 lg:mx-8 my-4">
                            <div className="flex flex-row space-x-3">
                                <Input
                                    placeholder="Cari..."
                                    value={inputValue}
                                    onChange={e => {
                                        e.preventDefault
                                        setPagination({ pageIndex: 1, pageSize })
                                        setIsLoading(true)
                                        setInputValue(e.target.value)
                                    }}
                                />
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                        >
                                            <FilterIcon size={16} />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuLabel>Urutkan berdasarkan</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuCheckboxItem
                                            checked={sortBy === "latest"}
                                            onCheckedChange={() => setSortBy("latest")}
                                        >
                                            Terbaru
                                        </DropdownMenuCheckboxItem>
                                        <DropdownMenuCheckboxItem
                                            checked={sortBy === "highest_price"}
                                            onCheckedChange={() => setSortBy("highest_price")}
                                        >
                                            Harga Tertinggi
                                        </DropdownMenuCheckboxItem>
                                        <DropdownMenuCheckboxItem
                                            checked={sortBy === "lowest_price"}
                                            onCheckedChange={() => setSortBy("lowest_price")}
                                        >
                                            Harga Terendah
                                        </DropdownMenuCheckboxItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            {inputValue && !isLoading ? (
                                <p>Ditemukan {products?.data?.filteredRowCount} hasil yang cocok</p>
                            ) : (
                                inputValue &&
                                isLoading && (
                                    <div role="status">
                                        <svg
                                            aria-hidden="true"
                                            className="mr-2 h-6 w-6 animate-spin fill-red-600 text-gray-200 dark:text-gray-600"
                                            viewBox="0 0 100 101"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                                fill="currentColor"
                                            />
                                            <path
                                                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                                fill="currentFill"
                                            />
                                        </svg>
                                        <span className="sr-only">Loading...</span>
                                    </div>
                                )
                            )}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                                {products?.data?.rows?.map((product: IProduct) => (
                                    <Link href={`/product/` + product.id + `/` + formatNameForSlug(product.name)} className="group max-w-sm bg-white border border-zinc-200 rounded-lg shadow dark:bg-zinc-800 dark:border-zinc-700">
                                        <Image
                                            src={process.env.NEXT_PUBLIC_BACKEND_URL + '/storage/' + product.images[0].path}
                                            alt={"Foto produk " + product.name}
                                            width={1000} height={1000} className="rounded-t-lg aspect-[1/1] object-cover border border-zinc-200 border-t-0 border-l-0 border-r-0"
                                        />
                                        <div className="flex flex-col justify-center p-4 items-start group-hover:bg-zinc-50">
                                            <p className="text-md font-bold tracking-tight text-zinc-900 dark:text-white line-clamp-1">{product.name}</p>
                                            <p className="text-md font-normal tracking-tight text-zinc-900 dark:text-white">{currencyFormatter(product.price)}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            href="#"
                                            onClick={() => setPagination({ pageIndex: pageIndex - 1, pageSize })}
                                            className={pageIndex <= 1 ? `pointer-events-none text-zinc-400` : ``} />
                                    </PaginationItem>
                                    {paginationRange().map(page => (
                                        <PaginationItem>
                                            <PaginationLink
                                                isActive={pageIndex === page}
                                                href="#"
                                                onClick={() => setPagination({ pageIndex: page, pageSize })}>
                                                {page}
                                            </PaginationLink>
                                        </PaginationItem>
                                    ))}
                                    {pageCount.length >= 1 && pageIndex !== pageCount.length && (
                                        <PaginationItem>
                                            <EditText
                                                type="number"
                                                placeholder="..."
                                                value={customPageIndex ?? ''}
                                                inputClassName="flex h-9 w-15 rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-300 disabled:cursor-not-allowed disabled:opacity-50"
                                                onChange={(e) => setCustomPageIndex(e.target.value)}
                                                onSave={(e) => {
                                                    setPagination({ pageIndex: Number(e.value), pageSize })
                                                    setCustomPageIndex(null)
                                                }}
                                                className={cn(buttonVariants({
                                                    variant: "ghost",
                                                    size: "icon"
                                                }))}
                                                inline />
                                            {/* <PaginationEllipsis /> */}
                                        </PaginationItem>
                                    )}
                                    <PaginationItem>
                                        <PaginationNext
                                            href="#"
                                            onClick={() => setPagination({ pageIndex: pageIndex + 1, pageSize })}
                                            className={pageIndex < 1 || pageIndex === pageCount.length ? `pointer-events-none text-zinc-400` : ``} />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    </div>
                </section >
                <CTA />
            </main >
            <Footer />
            <FloatingChatButton message={`Halo, saya tertarik dengan layanan ${process.env.NEXT_PUBLIC_APP_NAME}`} />
        </div >
    )
}
