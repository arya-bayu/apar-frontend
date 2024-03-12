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
import { ICategory } from "@/types/category"
import axios from "@/lib/axios"
import { AxiosError } from "axios"
import { toast } from "@/components/ui/use-toast"
import { useBreakpoint } from "@/hooks/useBreakpoint"
import { CaretSortIcon } from "@radix-ui/react-icons"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area";

interface CategoryComboboxProps {
    value: number;
    onSelect: (category: ICategory["id"]) => void;
}

export function CategoryCombobox({ value, onSelect }: CategoryComboboxProps) {
    const [open, setOpen] = useState(false)
    const { isAboveMd } = useBreakpoint('md')
    const [categories, setCategories] = useState<ICategory[]>([]);

    useEffect(() => {
        async function fetchCategories() {
            try {
                const response = await axios.get('api/v1/categories?columns[]=id&columns[]=name');

                setCategories(response.data.data.rows)
            } catch (error) {
                if (error instanceof AxiosError)
                    toast({
                        variant: 'destructive',
                        title: 'Terjadi kesalahan',
                        description: error.response?.data.errors,
                    })
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
                        {value
                            ? categories.find(
                                (category) => category.id === value
                            )?.name
                            : "Pilih kategori produk"}
                        <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] max-h-[var(--radix-popover-content-available-height)] p-0">
                    <CategoryList categories={categories} setOpen={setOpen} onSelect={onSelect} />
                </PopoverContent>
            </Popover>
        )
    }

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <Button variant="outline" className="w-full justify-start">

                    {value
                        ? categories.find(
                            (category) => category.id === value
                        )?.name
                        : "Pilih kategori produk"}

                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <div className="mt-4 border-t">
                    <CategoryList categories={categories} setOpen={setOpen} onSelect={onSelect} />
                </div>
            </DrawerContent>
        </Drawer>
    )
}

function CategoryList({
    categories,
    setOpen,
    onSelect,
}: {
    categories: ICategory[]
    setOpen: (open: boolean) => void
    onSelect: (category: ICategory["id"]) => void
}) {
    return (
        <Command>
            <CommandInput
                placeholder="Cari kategori..."
                className="h-9"
            />
            <CommandList>
                <CommandEmpty>Category tidak ditemukan.</CommandEmpty>
                <ScrollArea className="max-h-[200px]">
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
                </ScrollArea>
            </CommandList>
        </Command>
    )
}
