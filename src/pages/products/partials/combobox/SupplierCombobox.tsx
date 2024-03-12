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
import { ISupplier } from "@/types/supplier"
import axios from "@/lib/axios"
import { AxiosError } from "axios"
import { toast } from "@/components/ui/use-toast"
import { useBreakpoint } from "@/hooks/useBreakpoint"
import { CaretSortIcon } from "@radix-ui/react-icons"
import { cn } from "@/lib/utils"

interface SupplierComboboxProps {
    value: number;
    onSelect: (supplier: ISupplier["id"]) => void;
}

export function SupplierCombobox({ value, onSelect }: SupplierComboboxProps) {
    const [open, setOpen] = useState(false)
    const { isAboveMd } = useBreakpoint('md')
    const [suppliers, setSuppliers] = useState<ISupplier[]>([]);

    useEffect(() => {
        async function fetchSuppliers() {
            try {
                const response = await axios.get('api/v1/suppliers?columns[]=id&columns[]=name');

                setSuppliers(response.data.data.rows)
            } catch (error) {
                if (error instanceof AxiosError)
                    toast({
                        variant: 'destructive',
                        title: 'Terjadi kesalahan',
                        description: error.response?.data.errors,
                    })
            }
        }


        fetchSuppliers()
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
                            ? suppliers.find(
                                (supplier) => supplier.id === value
                            )?.name
                            : "Pilih supplier produk"}
                        <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] max-h-[var(--radix-popover-content-available-height)] p-0">
                    <SupplierList suppliers={suppliers} setOpen={setOpen} onSelect={onSelect} />
                </PopoverContent>
            </Popover>
        )
    }

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <Button variant="outline" className="w-full justify-start">

                    {value
                        ? suppliers.find(
                            (supplier) => supplier.id === value
                        )?.name
                        : "Pilih supplier produk"}

                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <div className="mt-4 border-t">
                    <SupplierList suppliers={suppliers} setOpen={setOpen} onSelect={onSelect} />
                </div>
            </DrawerContent>
        </Drawer>
    )
}

function SupplierList({
    suppliers,
    setOpen,
    onSelect,
}: {
    suppliers: ISupplier[]
    setOpen: (open: boolean) => void
    onSelect: (supplier: ISupplier["id"]) => void
}) {
    return (
        <Command>
            <CommandInput
                placeholder="Cari supplier..."
                className="h-9"
            />
            <CommandList>
                <CommandEmpty>Supplier tidak ditemukan.</CommandEmpty>
                <CommandGroup>
                    {suppliers.map((supplier) => (
                        <CommandItem
                            key={supplier.id}
                            value={supplier.name}
                            onSelect={() => {
                                onSelect(supplier.id)
                                setOpen(false)
                            }}
                        >
                            {supplier.name}
                        </CommandItem>
                    ))}
                </CommandGroup>
            </CommandList>
        </Command>
    )
}
