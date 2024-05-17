import React from 'react';
import { BsWhatsapp } from "react-icons/bs";
import { Button } from "./ui/button";

const FloatingChatButton = ({ message }: { message: string }) => {
    return (
        <Button
            onClick={() => {
                window.open(`https://wa.me/+6281234567890?text=${message}`, '_blank');
            }}
            variant="whatsapp"
            size="xlarge"
            className="fixed bottom-6 right-6 z-[19] w-0 md:w-auto h-16 md:h-auto rounded-full text-xl flex gap-2 justify-center items-center"
            aria-label="Chat WhatsApp"
        >
            <span><BsWhatsapp size={22} aria-label="Whatsapp button" /></span>
            <span className="font-bold text-lg hidden md:block">WhatsApp</span>
        </Button>
    );
};

export default FloatingChatButton;
