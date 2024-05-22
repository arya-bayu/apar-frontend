import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { XIcon } from 'lucide-react';
import { Button } from "../ui/button";
import { IImage } from "@/types/image";
import { toast } from "../ui/use-toast";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import { useInView } from "react-intersection-observer";

export interface CustomFile extends File {
    preview: string;
}

interface DropzoneProps {
    className?: string;
    required?: boolean;
    disabled?: boolean;
    singleImage?: IImage;
    allowMultiple?: boolean;
    multipleImages?: IImage[];
    maxFiles?: number;
    onExistingImagesChange?: (images: IImage[]) => void
    onImagesChange: (images: CustomFile[]) => void
}

const Dropzone: React.FC<DropzoneProps> = ({ className, required = false, disabled = false, singleImage, maxFiles = 1, allowMultiple = false, multipleImages = [], onExistingImagesChange, onImagesChange }) => {
    const [images, setImages] = useState<CustomFile[]>([]);

    const maxImages = allowMultiple ? (maxFiles + multipleImages.length + images.length) : maxFiles;

    const onDrop = useCallback((acceptedImages: File[], rejectedImages: FileRejection[]) => {

        if (maxImages === 1 && acceptedImages.length >= maxImages) {
            const file = acceptedImages[0];
            setImages([Object.assign(file, { preview: URL.createObjectURL(file) })]);
            onImagesChange([Object.assign(file, { preview: URL.createObjectURL(file) })] as CustomFile[]);
            return
        }

        if (maxImages > 1 && multipleImages.length + images.length + acceptedImages.length > maxImages) {
            toast({
                variant: 'destructive',
                title: 'Gambar gagal diunggah',
                description: 'Melebihi batas jumlah unggahan gambar.',
            })
            return
        }

        if (rejectedImages?.length) {
            toast({
                variant: 'destructive',
                title: rejectedImages?.length + ' gambar gagal diunggah',
                description: 'Melebihi batas jumlah unggahan gambar.',
            })
        }

        if (acceptedImages?.length) {
            setImages((previousImages) => [
                ...previousImages,
                ...acceptedImages.map((file) =>
                    Object.assign(file, { preview: URL.createObjectURL(file) })
                ),
            ]);

            onImagesChange([
                ...images,
                ...acceptedImages.map((file) =>
                    Object.assign(file, { preview: URL.createObjectURL(file) })
                ),
            ] as CustomFile[]);
        }
    }, [images, onImagesChange]);


    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            'image/*': [],
        },
        onDrop,
        maxSize: 10 * 1024 * 1024, // 10MB in bytes
        maxFiles: maxImages,
        multiple: allowMultiple
    });

    getRootProps.apply

    const removeFile = (index: number) => {
        const updatedImages = images.filter((_, i) => i !== index);
        setImages(updatedImages);
        onImagesChange(updatedImages);
    };

    const removeAll = async () => {
        setImages([]);
        onImagesChange([]);
        if (onExistingImagesChange && multipleImages.length > 0) {
            onExistingImagesChange([]);
        }
    };

    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 0.5
    })

    return (
        <div>
            {!disabled && (
                <div
                    {...getRootProps({
                        className: `${className} ${maxImages === 1 ? 'h-72' : 'h-36'} group relative mt-2 flex cursor-pointer flex-col items-center justify-center rounded-md border border-gray-300 bg-white shadow-sm transition-all hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:bg-zinc-800`,
                    })}
                >
                    <input disabled={disabled} name="images" {...getInputProps()} />
                    <div
                        className={`
                        ${isDragActive && 'border-2 border-zinc-950 dark:border-zinc-50'} 
                        absolute z-[3] flex h-full w-full flex-col items-center justify-center rounded-md px-10 transition-all
                        ${!isDragActive && maxImages === 1 && (singleImage || images.length > 0)
                                ? 'bg-white/80 opacity-0 hover:opacity-95 hover:backdrop-blur-md dark:bg-zinc-800/80'
                                : 'bg-white hover:bg-gray-50 dark:bg-zinc-950/80 dark:hover:bg-zinc-800 '
                            }
                        `}>
                        <svg
                            className={`${isDragActive ? 'scale-110' : 'scale-100'
                                } h-7 w-7 text-gray-500 transition-all duration-75 group-hover:scale-110 group-active:scale-95 dark:text-zinc-50`}
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path>
                            <path d="M12 12v9"></path>
                            <path d="m16 16-4-4-4 4"></path>
                        </svg>
                        <p className="mt-2 text-center text-sm text-gray-500 dark:text-zinc-50">
                            {isDragActive ? (
                                'Drop gambar ke kotak ini'
                            ) : (
                                'Drag dan drop gambar ke kotak ini, atau klik untuk memilih file'
                            )}
                        </p>
                    </div>
                    {maxImages === 1 && (singleImage || images.length > 0) && (
                        <Image
                            priority
                            src={images.length > 0 ? images[0].preview : `${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/` + singleImage?.path}
                            alt={images.length > 0 ? images[0].name : "Header Image"}
                            width={0}
                            height={0}
                            sizes="100vw"
                            className="h-full w-full rounded-md object-cover"
                        />
                    )}
                </div>)
            }

            {
                !disabled && (
                    <div className="my-2 gap-2">
                        {maxImages === 1 && (singleImage || images.length > 0) && (
                            <Button
                                variant="destructive"
                                type="button"
                                className="w-full my-3"
                                onClick={() => {
                                    removeAll()
                                }}
                            >
                                Hapus Gambar
                            </Button>
                        )}
                    </div>)
            }

            {/* Preview for Multiple Images */}
            {
                maxImages > 1 && (multipleImages.length > 0 || images.length > 0) && (
                    <section className={disabled ? '' : 'mt-10'}>
                        {!disabled && (<div className='flex justify-between
                '>
                            <h2 className="text-center text-lg font-bold text-zinc-950 dark:text-zinc-50">Preview</h2>
                            <Button
                                variant="outline"
                                type="button"
                                className="uppercase text-[0.6rem] tracking-wider px-3 "
                                onClick={() => {
                                    removeAll()
                                    // singleImage && onImageRemove()
                                }}
                            >
                                Hapus Semua Gambar
                            </Button>
                        </div>)}

                        <Carousel
                            opts={{
                                align: "start",
                            }}
                            className="mt-6 w-full rounded-lg overflow-clip"
                        >
                            <CarouselContent>
                                {multipleImages.map((image, index) => (
                                    <CarouselItem key={index} className="md:basis-1/2 relative lg:basis-1/3">
                                        <Image
                                            priority
                                            src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/` + image.path}
                                            alt={`Gambar ${index}`}
                                            width={100}
                                            height={100}
                                            unoptimized
                                            className='h-full w-full object-contain rounded-lg aspect-square bg-white border'
                                        />
                                        {!disabled && onExistingImagesChange && (
                                            <button
                                                type='button'
                                                className='w-7 h-7 border dark:border-zinc-950 border-zinc-400 dark:bg-zinc-800 bg-zinc-100 rounded-full flex justify-center items-center absolute top-3 right-3 hover:bg-white transition-colors'
                                                onClick={() => {
                                                    const idToRemove = image.id;
                                                    const updatedImages = multipleImages.filter(img => img.id !== idToRemove);
                                                    onExistingImagesChange(updatedImages);
                                                }}>
                                                <XIcon className='w-5 h-5 text-zinc-500 dark:text-zinc-100 hover:fill-zinc-400 transition-colors' />
                                            </button>
                                        )

                                        }

                                    </CarouselItem>
                                ))}
                                {images.map((file, index) => (
                                    <CarouselItem key={index} className="md:basis-1/2 relative lg:basis-1/3">
                                        <Image
                                            priority
                                            src={file.preview}
                                            alt={file.name}
                                            width={100}
                                            height={100}
                                            className='h-full w-full object-contain rounded-lg aspect-square bg-white border'
                                        />
                                        <button
                                            type='button'
                                            className='w-7 h-7 border dark:border-zinc-950 border-zinc-400 dark:bg-zinc-800 bg-zinc-100 rounded-full flex justify-center items-center absolute top-3 right-3 hover:bg-white transition-colors'
                                            onClick={() => removeFile(index)}
                                        >
                                            <XIcon className='w-5 h-5 text-zinc-500 dark:text-zinc-100 hover:fill-zinc-400 transition-colors' />
                                        </button>

                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                        </Carousel>
                        <div className="flex justify-end mt-4">
                            {!disabled && (<p className="text-sm font-bold text-zinc-500 dark:text-zinc-50">{multipleImages.length + images.length}/{maxImages}</p>)}
                        </div>
                    </section>
                )
            }

        </div >
    );
};

export default Dropzone;