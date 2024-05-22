import React, { PropsWithChildren, useState } from 'react';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Loader2 } from "lucide-react";
import { Button } from "./ui/button";

interface ICustomAlertDialog {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    onContinue: () => void;
}

const CustomAlertDialog = ({ open, onOpenChange, title, description, onContinue }: ICustomAlertDialog) => {
    const [isLoading, setIsLoading] = useState<boolean>(false)

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => onOpenChange(false)}>Batal</AlertDialogCancel>
                    <Button
                        disabled={isLoading}
                        onClick={async () => {
                            setIsLoading(true);
                            try {
                                await onContinue();
                            } finally {
                                setIsLoading(false);
                                onOpenChange(false);
                            }
                        }}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Memproses...
                            </>
                        ) : (
                            "Lanjutkan"
                        )}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default CustomAlertDialog;