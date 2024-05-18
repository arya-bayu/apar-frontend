// components/IconPicker.tsx
import { useState, useEffect, PropsWithChildren } from 'react';
import { LucideIcons } from '@/components/IconPicker/LucidIconMapping';
import * as Lucide from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import React from 'react';
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from '@/components/ui/drawer'
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";

interface IconPickerProps {
    onSelect: (icon: keyof typeof LucideIcons) => void;
}

interface LucideIconPackProps {
    onSelect: (icon: keyof typeof LucideIcons) => void;
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    loadingIcons: boolean;
    filteredIcons: string[];
    setOpen: (value: boolean) => void;
}

const LucideIconPack: React.FC<LucideIconPackProps> = ({ onSelect, searchTerm, setSearchTerm, loadingIcons, filteredIcons, setOpen }) => {
    return (
        <div className="flex flex-col">
            <Input
                className="h-8 mb-4"
                id="searchIcon"
                placeholder="Cari ikon"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <ScrollArea className="h-48 overflow-y-auto">
                <div className="grid grid-cols-6 gap-4">
                    {loadingIcons
                        ? Array.from({ length: 36 }).map((_, index) => (
                            <div className="flex justify-center" key={index}>
                                <Skeleton className="h-8 w-8" />
                            </div>
                        ))
                        : filteredIcons.map((iconName) => {
                            const IconComponent = Lucide[iconName as keyof typeof Lucide] as React.FC<Lucide.LucideProps>;
                            return (
                                <div className="flex justify-center" key={iconName} onClick={() => {
                                    onSelect(iconName as keyof typeof LucideIcons);
                                    setOpen(false);
                                }}>
                                    {React.createElement(IconComponent, { size: 18 })}
                                </div>
                            );
                        })}
                </div>
            </ScrollArea>
        </div>
    );
};

export function IconPicker({ onSelect, children }: PropsWithChildren<IconPickerProps>) {
    const [loadingIcons, setLoadingIcons] = useState(true);
    const [filteredIcons, setFilteredIcons] = useState<string[]>([]);
    const { isAboveMd } = useBreakpoint('md')
    const [open, setOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState<string>('');

    useEffect(() => {
        const fetchData = async () => {

            const icons = Object.keys(LucideIcons).filter(iconName =>
                iconName.toLowerCase().includes(searchTerm.toLowerCase())
            );

            setFilteredIcons(icons);
            setLoadingIcons(false);
        };

        fetchData();
    }, [searchTerm]);

    const content = (
        <LucideIconPack
            onSelect={onSelect}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            loadingIcons={loadingIcons}
            filteredIcons={filteredIcons}
            setOpen={setOpen}
        />
    );

    if (isAboveMd) {
        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    {children}
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] max-h-[50vh]">
                    <DialogHeader>
                        <DialogTitle>Pilih Ikon</DialogTitle>
                        <DialogDescription>
                            Pilih satu ikon yang merepresentasikan fitur
                        </DialogDescription>
                    </DialogHeader>
                    {content}
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Drawer
            open={open}
            onOpenChange={setOpen}
        >
            <DrawerTrigger asChild>
                {children}
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader className="text-left">
                    <DrawerTitle>Pilih Ikon</DrawerTitle>
                    <DrawerDescription>
                        Pilih satu ikon yang merepresentasikan fitur
                    </DrawerDescription>
                </DrawerHeader>
                {content}
                <DrawerFooter className="pt-2">
                    <DrawerClose asChild>
                        <Button variant="outline">Batal</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
};

export default IconPicker