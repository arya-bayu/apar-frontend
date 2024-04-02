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
import { ICustomer } from "@/types/customer"
import axios from "@/lib/axios"
import { AxiosError } from "axios"
import { toast } from "@/components/ui/use-toast"
import { useBreakpoint } from "@/hooks/useBreakpoint"
import { CaretSortIcon } from "@radix-ui/react-icons"
import { cn } from "@/lib/utils"
import { ChevronRightIcon } from "lucide-react";
import CustomerDialog from "@/pages/customers/partials/CustomerDialog";

interface CustomerComboboxProps {
    value: number | null;
    onSelect: (customer: ICustomer["id"]) => void;
    disabled?: boolean;
    hasReset?: boolean;
}

export function CustomerCombobox({ value, disabled = false, onSelect, hasReset = false }: CustomerComboboxProps) {
    const [open, setOpen] = useState(false)
    const { isAboveMd } = useBreakpoint('md')
    const [customers, setCustomers] = useState<ICustomer[]>([]);

    async function fetchCustomers() {
        try {
            const response = await axios.get('api/v1/customers?columns=id,company_name');

            setCustomers(response.data.data)
        } catch (error) {
            if (error instanceof AxiosError)
                toast({
                    variant: 'destructive',
                    title: 'Terjadi kesalahan',
                    description: error.response?.data.errors,
                })
        }
    }

    useEffect(() => {
        fetchCustomers()
    }, [])

    if (isAboveMd) {
        return (
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        disabled={disabled}
                        variant="outline"
                        role="combobox"
                        className={cn(
                            "w-full justify-between",
                            !value && "text-muted-foreground"
                        )}
                    >
                        <p className="truncate ...">
                            {value
                                ? customers.find(
                                    (customer) => customer.id === value
                                )?.company_name
                                : "Pilih customer"}
                        </p>
                        <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] max-h-[var(--radix-popover-content-available-height)] p-0">
                    <CustomerList customers={customers} setOpen={setOpen} onSelect={onSelect} fetchCustomers={fetchCustomers} hasReset />
                </PopoverContent>
            </Popover>
        )
    }

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <Button disabled={disabled} variant="outline" className="w-full justify-start">

                    <p className="truncate">
                        {value
                            ? customers.find(
                                (customer) => customer.id === value
                            )?.company_name
                            : "Pilih customer"}
                    </p>

                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <div className="mt-4 border-t">
                    <CustomerList customers={customers} setOpen={setOpen} onSelect={onSelect} fetchCustomers={fetchCustomers} hasReset />
                </div>
            </DrawerContent>
        </Drawer>
    )
}

function CustomerList({
    hasReset,
    customers,
    setOpen,
    onSelect,
    fetchCustomers,
}: {
    hasReset?: boolean
    customers: ICustomer[]
    setOpen: (open: boolean) => void
    onSelect: (customerId: ICustomer["id"]) => void
    fetchCustomers: () => void;
}) {
    return (
        <Command>
            <CommandInput
                placeholder="Cari customer..."
                className="h-9"
            />
            {hasReset && (
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
                {customers.length < 1 ? (
                    <CommandGroup className="py-6 text-center text-sm">
                        Customer tidak ditemukan.
                    </CommandGroup>
                ) : (
                    <>
                        <CommandEmpty>Customer tidak ditemukan.</CommandEmpty>
                        <CommandGroup>
                            {customers.map((customer) => (
                                <CommandItem
                                    key={customer.id}
                                    value={customer.company_name}
                                    onSelect={() => {
                                        onSelect(customer.id)
                                        setOpen(false)
                                    }}
                                >
                                    {customer.company_name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </>
                )}
            </CommandList>
            <CommandSeparator />
            <CommandGroup className="hover:bg-zinc-100 dark:hover:bg-zinc-800">

                <CustomerDialog onSuccess={fetchCustomers}>
                    <div
                        className="flex flex-row justify-between items-center">
                        <div className="flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50">Customer Baru</div>
                        <ChevronRightIcon />
                    </div>
                </CustomerDialog>
            </CommandGroup>
        </Command>
    )
}
