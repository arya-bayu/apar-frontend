import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface SimpleHeroProps {
    label: string;
    title: string;
    subtitle: string;
}

const SimpleHero: React.FC<SimpleHeroProps> = ({ label, title, subtitle }) => (
    <section className="flex border-b justify-center bg-monza-50 bg-gradient-to-b from-transparent via-transparent to-stone-50">
        <div className="max-w-7xl w-full px-6 lg:px-12 py-16">
            <div className="flex justify-center lg:justify-start mb-4">
                <div className="inline-block bg-gradient-to-r from-monza-600/75 to-monza-600 rounded-lg px-3 py-1">
                    <p className="font-bold text-sm lg:text-md text-transparent bg-clip-text bg-gradient-to-r from-monza-50 to-white">
                        {label}
                    </p>
                </div>
            </div>
            <h1 className="text-center mx-auto lg:mx-0 lg:text-left max-w-2xl lg:max-w-5xl mb-4 text-5xl lg:text-6xl font-extrabold tracking-tight leading-none dark:text-white">
                {title}
            </h1>
            <p className="text-center mx-auto lg:mx-0 lg:text-left max-w-2xl lg:max-w-5xl mb-6 font-light text-zinc-700 lg:mb-8 md:text-lg lg:text-2xl">
                {subtitle}
            </p>
            <div className="space-x-4 flex justify-center lg:justify-start">
                <Link target="_blank" href="/contact-us">
                    <Button variant="monza_destructive" className="group pl-3 pr-2 justify-between gap-4" size={"lg"}>
                        <p>Hubungi Kami</p>
                        <div className="bg-zinc-50 rounded-md p-1">
                            <ArrowRight size={16} className="text-monza-500 -rotate-45 group-hover:rotate-0 transition-all" />
                        </div>
                    </Button>
                </Link>
            </div>
        </div>
    </section>
);

export default SimpleHero;
