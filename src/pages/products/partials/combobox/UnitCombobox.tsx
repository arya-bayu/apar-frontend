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
import { IUnit } from "@/types/unit"
import axios from "@/lib/axios"
import { AxiosError } from "axios"
import { toast } from "@/components/ui/use-toast"
import { useBreakpoint } from "@/hooks/useBreakpoint"
import { CaretSortIcon } from "@radix-ui/react-icons"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area";

interface UnitComboboxProps {
    value: number;
    onSelect: (unit: IUnit["id"]) => void;
}

export function UnitCombobox({ value, onSelect }: UnitComboboxProps) {
    const [open, setOpen] = useState(false)
    const { isAboveMd } = useBreakpoint('md')
    const [units, setUnits] = useState<IUnit[]>([]);

    useEffect(() => {
        async function fetchUnits() {
            try {
                const response = await axios.get('api/v1/units?columns[]=id&columns[]=name');

                setUnits(response.data.data.rows)
            } catch (error) {
                if (error instanceof AxiosError)
                    toast({
                        variant: 'destructive',
                        title: 'Terjadi kesalahan',
                        description: error.response?.data.errors,
                    })
            }
        }


        fetchUnits()
    }, [])

    if (isAboveMd) {
        return (
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                            "pt-[9.5px] pb-[9.5px]",
                            "w-full justify-between",
                            !value && "text-muted-foreground"
                        )}
                    >
                        {value
                            ? units.find(
                                (unit) => unit.id === value
                            )?.name
                            : "Pilih unit produk"}
                        <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] max-h-[var(--radix-popover-content-available-height)] p-0">
                    <UnitList units={units} setOpen={setOpen} onSelect={onSelect} />
                </PopoverContent>
            </Popover>
        )
    }

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <Button variant="outline" className="w-full justify-start">

                    {value
                        ? units.find(
                            (unit) => unit.id === value
                        )?.name
                        : "Pilih unit produk"}

                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <div className="mt-4 border-t">
                    <UnitList units={units} setOpen={setOpen} onSelect={onSelect} />
                </div>
            </DrawerContent>
        </Drawer>
    )
}

function UnitList({
    units,
    setOpen,
    onSelect,
}: {
    units: IUnit[]
    setOpen: (open: boolean) => void
    onSelect: (unit: IUnit["id"]) => void
}) {
    return (
        <Command>
            <CommandInput
                placeholder="Cari unit..."
                className="h-9"
            />
            <CommandList>
                <CommandEmpty>Unit tidak ditemukan.</CommandEmpty>
                <ScrollArea className="max-h-[200px]">
                    <CommandGroup>
                        {units.map((unit) => (
                            <CommandItem
                                key={unit.id}
                                value={unit.name}
                                onSelect={() => {
                                    onSelect(unit.id)
                                    setOpen(false)
                                }}
                            >
                                {unit.name}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </ScrollArea>
            </CommandList>
        </Command>
    )
}
