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
import { useBreakpoint } from "@/hooks/useBreakpoint"
import { CaretSortIcon } from "@radix-ui/react-icons"
import { cn } from "@/lib/utils"

interface StatusComboboxProps {
    value: number | null;
    onSelect: (status: number | null) => void;
    disabled?: boolean;
    hasReset?: boolean;
    statusData: { id: number; name: string }[]
}

export function StatusCombobox({ value, onSelect, disabled = false, hasReset = false, statusData }: StatusComboboxProps) {
    const [open, setOpen] = useState(false)
    const { isAboveMd } = useBreakpoint('md')

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
                                ? statusData.find(
                                    (status) => status.id === value
                                )?.name
                                : "Pilih status"}
                        </p>
                        <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] max-h-[var(--radix-popover-content-available-height)] p-0">
                    <StatusList statusData={statusData} setOpen={setOpen} onSelect={onSelect} hasReset={hasReset} />
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
                            ? statusData.find(
                                (status) => status.id === value
                            )?.name
                            : "Pilih status"}
                    </p>

                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <div className="mt-4 border-t">
                    <StatusList statusData={statusData} setOpen={setOpen} onSelect={onSelect} hasReset={hasReset} />
                </div>
            </DrawerContent>
        </Drawer>
    )
}

function StatusList({
    hasReset,
    statusData,
    setOpen,
    onSelect,
}: {
    hasReset?: boolean
    statusData: { id: number; name: string }[]
    setOpen: (open: boolean) => void
    onSelect: (status: number | null) => void
}) {

    return (
        <Command>
            <CommandInput
                placeholder="Cari status..."
                className="h-9"
            />
            {hasReset && (
                <CommandGroup>
                    <CommandItem
                        className="py-2 px-2 rounded-md"
                        key={0}
                        value={"Reset"}
                        onSelect={() => {
                            onSelect(null)
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
                {statusData.length < 1 ? (
                    <div
                        className="py-6 text-center text-sm">
                        Status tidak ditemukan.
                    </div>
                ) : (
                    <>
                        <CommandEmpty>Status tidak ditemukan.</CommandEmpty>
                        <CommandGroup>
                            {statusData.map((status) => (
                                <CommandItem
                                    key={status.id}
                                    value={status.name}
                                    onSelect={() => {
                                        onSelect(status.id)
                                        setOpen(false)
                                    }}
                                >
                                    {status.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </>
                )}
            </CommandList>
        </Command>
    )
}
