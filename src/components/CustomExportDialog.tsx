import React, { PropsWithChildren } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";

interface ICustomExportDialog {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    onContinue: () => void;
}

const CustomExportDialog = ({ open, onOpenChange, title, description, children, onContinue }: PropsWithChildren<ICustomExportDialog>) => {

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                    {children}
                </DialogHeader>
                <DialogFooter className="flex flex-row justify-end gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
                    <Button onClick={onContinue}>Lanjutkan</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CustomExportDialog;