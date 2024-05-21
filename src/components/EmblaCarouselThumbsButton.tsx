import { IImage } from "@/types/image"
import Image from "next/image"
import React from 'react'

type PropType = {
    selected: boolean
    url: IImage['path']
    index: number
    onClick: () => void
}

export const Thumb: React.FC<PropType> = (props) => {
    const { selected, index, url, onClick } = props

    return (
        <div
            className={'embla-thumbs__slide'.concat(
                selected ? ' embla-thumbs__slide--selected brightness-100' : ''
            )}
        >
            <Image onClick={onClick} src={url} height={1000} width={1000} alt={'Foto ' + index} priority className={"w-full aspect-square border object-cover rounded-md"} />
        </div>
    )
}
