import React, { useEffect, useState, Dispatch, SetStateAction, PropsWithChildren, useRef } from 'react';
import Barcode from 'react-jsbarcode';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { CheckedState } from "@radix-ui/react-checkbox";
import html2canvas from "html2canvas";

interface BarcodeExportDialogProps {
    value: string;
    productName?: string;
    company?: string;
    options?: any;
    setDisabledContextMenu?: Dispatch<SetStateAction<boolean | undefined>>

}

export default function BarcodeExportDialog({
    children,
    value,
    productName,
    company,
    setDisabledContextMenu,
}: PropsWithChildren<BarcodeExportDialogProps>) {
    const [open, setOpen] = useState(false)
    const [showProductName, setShowProductName] = useState<CheckedState>(true)
    const [showCompanyName, setShowCompanyName] = useState<CheckedState>(true)
    const printRef = useRef<HTMLDivElement>(null);


    setDisabledContextMenu && useEffect(() => {
        setDisabledContextMenu(open)
    }, [open])

    const handleDownloadBarcode = async () => {
        if (!printRef.current) return;

        const element = printRef.current;
        const canvas = await html2canvas(element, {
            scale: 5
        });

        const data = canvas.toDataURL('image/jpg');
        const link = document.createElement('a');

        if (typeof link.download === 'string') {
            link.href = data;
            link.download = 'image.jpg';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            window.open(data);
        }
    };

    const validateEan13 = (serialNumber: string): boolean => {
        const sum = serialNumber
            .split('')
            .map(Number)
            .reduce((acc, digit, index) => {
                return index % 2 === 0 ? acc + digit : acc + digit * 3;
            }, 0);

        return sum % 10 === 0;
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>

            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-[300px]">
                <DialogHeader>
                    <DialogTitle className="text-start">Barcode</DialogTitle>
                </DialogHeader>
                <div className="flex justify-center">
                    <div ref={printRef} className="flex flex-col items-center w-[210px] bg-white">
                        <div className="text-center text-xs tracking-tighter font-mono text-wrap">
                            {showCompanyName && (<p className="font-semibold">{company}</p>)}
                            {showProductName && (<p className="leading-[1.2] ">{productName}</p>)}
                        </div>
                        <Barcode
                            value={value}
                            options={{
                                format: validateEan13(value) ? 'ean13' : '',
                                height: 60,
                                width: 2,
                                flat: true,
                                marginTop: 1.5,
                            }}
                        />
                    </div>
                </div>
                <div className="flex gap-2">
                    <Checkbox id="product" checked={showProductName} onCheckedChange={setShowProductName} />
                    <label
                        htmlFor="product"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        Nama Produk
                    </label>
                </div>
                <div className="flex gap-2">
                    <Checkbox id="company" checked={showCompanyName} onCheckedChange={setShowCompanyName} />
                    <label
                        htmlFor="title"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        Nama Perusahaan
                    </label>
                </div>
                <DialogFooter>
                    <Button className="w-full" type="button" onClick={handleDownloadBarcode}>
                        Unduh
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
};