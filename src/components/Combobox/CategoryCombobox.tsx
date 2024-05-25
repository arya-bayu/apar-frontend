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
    CommandSeparator
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
import { ICategory } from "@/types/category"
import axios from "@/lib/axios"
import { AxiosError } from "axios"
import { toast } from "@/components/ui/use-toast"
import { useBreakpoint } from "@/hooks/useBreakpoint"
import { CaretSortIcon } from "@radix-ui/react-icons"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react";

interface CategoryComboboxProps {
    value: number | null;
    onSelect: (category: ICategory["id"]) => void;
    hasReset?: boolean;
}

export function CategoryCombobox({ value, onSelect, hasReset = false }: CategoryComboboxProps) {
    const [open, setOpen] = useState(false)
    const { isAboveMd } = useBreakpoint('md')
    const [isFetching, setIsFetching] = useState<boolean>(false);
    const [categories, setCategories] = useState<ICategory[]>([]);

    useEffect(() => {
        async function fetchCategories() {
            setIsFetching(true)
            try {
                const response = await axios.get('api/v1/categories?columns=id,name');
                setCategories(response.data.data)
            } catch (error) {
                if (error instanceof AxiosError)
                    toast({
                        variant: 'destructive',
                        title: 'Terjadi kesalahan',
                        description: error.response?.data.errors,
                    })
            } finally {
                setIsFetching(false)
            }
        }

        fetchCategories()
    }, [])

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
                                ? categories.find(
                                    (category) => category.id === value
                                )?.name
                                : "Kategori produk"}
                        </p>
                        <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] max-h-[var(--radix-popover-content-available-height)] p-0">
                    <CategoryList isFetching={isFetching} categories={categories} setOpen={setOpen} onSelect={onSelect} hasReset={hasReset} />
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
                            ? categories.find(
                                (category) => category.id === value
                            )?.name
                            : "Kategori produk"}
                    </p>

                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <div className="mt-4 border-t">
                    <CategoryList isFetching={isFetching} categories={categories} setOpen={setOpen} onSelect={onSelect} hasReset={hasReset} />
                </div>
            </DrawerContent>
        </Drawer>
    )
}

function CategoryList({
    categories,
    setOpen,
    onSelect,
    isFetching,
    hasReset
}: {
    categories: ICategory[]
    setOpen: (open: boolean) => void
    onSelect: (category: ICategory["id"]) => void
    isFetching: boolean
    hasReset?: boolean
}) {
    return (
        <Command>
            <CommandInput
                placeholder="Cari kategori..."
                className="h-9"
            />
            {hasReset && !isFetching && (
                <CommandGroup>
                    <CommandItem
                        className="py-2 px-2 rounded-md"
                        key={0}
                        value={"Reset"}
                        onSelect={() => {
                            onSelect(0)
                            setOpen(false)
                        }}
                    >
                        <p className="text-sm font-bold">
                            Reset
                        </p>
                    </CommandItem>
                </CommandGroup>
            )}
            <CommandSeparator />
            <CommandList>
                {isFetching
                    ? (
                        <CommandGroup className="py-6 text-center text-sm">
                            <Loader2 className="animate-spin mx-auto" />
                        </CommandGroup>
                    )
                    : categories.length < 1 ? (
                        <div
                            className="py-6 text-center text-sm">
                            Kategori tidak ditemukan.
                        </div>
                    ) : (
                        <>
                            <CommandEmpty>Kategori tidak ditemukan.</CommandEmpty>
                            <CommandGroup>
                                {categories.map((category) => (
                                    <CommandItem
                                        key={category.id}
                                        value={category.name}
                                        onSelect={() => {
                                            onSelect(category.id)
                                            setOpen(false)
                                        }}
                                    >
                                        {category.name}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </>
                    )}
            </CommandList>
        </Command>
    )
}
