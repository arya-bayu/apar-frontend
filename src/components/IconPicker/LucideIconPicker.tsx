// components/IconPicker.tsx
import { FC, useState, useEffect } from 'react';
import { LucideIcons } from '@/components/IconPicker/LucidIconMapping';
import * as Lucide from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton"; // Import your Skeleton component
import React from 'react';

interface IconPickerProps {
    onSelect: (icon: keyof typeof LucideIcons) => void;
    searchTerm: string;
}

const IconPicker: FC<IconPickerProps> = ({ onSelect, searchTerm }) => {
    const [loadingIcons, setLoadingIcons] = useState(true);
    const [filteredIcons, setFilteredIcons] = useState<string[]>([]);

    useEffect(() => {
        // Simulate an asynchronous data fetching process
        const fetchData = async () => {
            // Simulate delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            const icons = Object.keys(LucideIcons).filter(iconName =>
                iconName.toLowerCase().includes(searchTerm.toLowerCase())
            );

            setFilteredIcons(icons);
            setLoadingIcons(false);
        };

        // Trigger data fetching
        fetchData();
    }, [searchTerm]);

    return (
        <div className="grid grid-cols-6 gap-4">
            {loadingIcons
                ? Array.from({ length: 36 }).map((_, index) => (
                    <div className="flex justify-center" key={index}>
                        {/* Skeleton loaders */}
                        <Skeleton className="h-8 w-8" />
                    </div>
                ))
                : filteredIcons.map((iconName) => {
                    const IconComponent = Lucide[iconName as keyof typeof Lucide] as React.FunctionComponent<Lucide.LucideProps>;
                    return (
                        <div className="flex justify-center" key={iconName} onClick={() => onSelect(iconName as keyof typeof LucideIcons)}>
                            {React.createElement(IconComponent, { size: 18 })}
                        </div>
                    );
                })}
        </div>
    );
};

export default IconPicker;
