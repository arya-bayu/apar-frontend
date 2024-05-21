"use client"

import React, { useState, useEffect } from 'react';

import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Drawer,
    DrawerContent,
    DrawerTrigger,
} from "@/components/ui/drawer"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { IProduct } from "@/types/product"
import axios from "@/lib/axios"
import { AxiosError } from "axios"
import { toast } from "@/components/ui/use-toast"
import { useBreakpoint } from "@/hooks/useBreakpoint"
import { CaretSortIcon } from "@radix-ui/react-icons"
import { cn } from "@/lib/utils"
import { ISupplier } from "@/types/supplier";
import { ICategory } from "@/types/category";

interface ProductComboboxProps {
    value: number | null;
    supplierId?: ISupplier["id"];
    categoryId?: ICategory["id"] | null;
    onSelect: (product: IProduct["id"], supplierId?: IProduct["supplier_id"]) => void;
}

export function ProductCombobox({ supplierId, categoryId, value, onSelect }: ProductComboboxProps) {
    const [open, setOpen] = useState(false)
    const { isAboveMd } = useBreakpoint('md')
    const [products, setProducts] = useState<IProduct[]>([]);

    useEffect(() => {
        async function fetchProducts() {
            const columns = ['id', 'name', 'serial_number'];
            if (supplierId) columns.push('supplier_id');
            if (categoryId) columns.push('category_id');
            const columnsParam = columns.join(',');

            try {
                const response = await axios.get(`api/v1/products?status=1&columns=${columnsParam}${supplierId ? `&supplier_id=${supplierId}` : ``}${categoryId ? `\&category_id=${categoryId}` : ``}
                `);

                setProducts(response.data.data)
            } catch (error) {
                if (error instanceof AxiosError)
                    toast({
                        variant: 'destructive',
                        title: 'Terjadi kesalahan',
                        description: error.response?.data.errors,
                    })
            }
        }

        fetchProducts()
    }, [supplierId, categoryId])

    if (isAboveMd) {
        return (
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                            "w-full justify-between",
                            !value && "text-muted-foreground"
                        )}
                    >
                        <p className="truncate ...">
                            {value
                                ? products.find(
                                    (product) => product.id === value
                                )?.name
                                : "Pilih produk"}
                        </p>
                        <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] max-h-[var(--radix-popover-content-available-height)] p-0">
                    <ProductList products={products} setOpen={setOpen} onSelect={onSelect} />
                </PopoverContent>
            </Popover>
        )
    }

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <Button variant="outline" className="w-full justify-start">

                    <p className="truncate">
                        {value
                            ? products.find(
                                (product) => product.id === value
                            )?.name
                            : "Pilih produk"}
                    </p>

                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <div className="mt-4 border-t">
                    <ProductList products={products} setOpen={setOpen} onSelect={onSelect} />
                </div>
            </DrawerContent>
        </Drawer>
    )
}

function ProductList({
    products,
    setOpen,
    onSelect,
}: {
    products: IProduct[]
    setOpen: (open: boolean) => void
    onSelect: (productId: IProduct["id"], supplierId?: IProduct["supplier_id"]) => void
}) {
    return (
        <Command>
            <CommandInput
                placeholder="Cari produk..."
                className="h-9"
            />
            <CommandList>
                {products.length < 1 ? (
                    <div
                        className="py-6 text-center text-sm">
                        Produk tidak ditemukan.
                    </div>
                ) : (
                    <>
                        <CommandEmpty>Produk tidak ditemukan.</CommandEmpty>
                        <CommandGroup>
                            {products.map((product) => (
                                <CommandItem
                                    key={product.id}
                                    value={`[${product.serial_number}] ${product.name}`}
                                    onSelect={() => {
                                        onSelect(product.id, product.supplier_id)
                                        setOpen(false)
                                    }}
                                >
                                    {`[${product.serial_number}] ${product.name}`}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </>
                )}


            </CommandList>
        </Command>
    )
}
