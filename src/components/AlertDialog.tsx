import React from 'react';

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

interface ICustomAlertDialog {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    onContinue: () => void;
}

const CustomAlertDialog = ({ open, onOpenChange, title, description, onContinue }: ICustomAlertDialog) => {

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => onOpenChange(false)}>Batal</AlertDialogCancel>
                    <AlertDialogAction onClick={onContinue}>Lanjutkan</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default CustomAlertDialog;