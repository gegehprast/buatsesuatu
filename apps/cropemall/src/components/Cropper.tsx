import React from 'react'
import background from '@/assets/background.png'
import useMovableWithMouse from '@/hooks/useMovableWithMouse'

interface CropperProps {
    img: string
    alt: string
}

const Cropper: React.FC<CropperProps> = ({ img, alt }) => {
    const [image] = useMovableWithMouse<HTMLImageElement>()
    const [cropper] = useMovableWithMouse<HTMLDivElement>()

    return (
        <div className="flex flex-col aspect-video">
            <div
                className="relative overflow-hidden border border-collapse border-mf-500 aspect-video"
                style={{ backgroundImage: `url(${background})` }}
                onDragOver={(e) => e.preventDefault()}
            >
                <img
                    src={img}
                    alt={alt}
                    className="absolute object-contain h-full select-none"
                    ref={image}
                />

                {/* crop square */}
                <div
                    ref={cropper}
                    className="absolute w-40 h-40 border border-mf-500 select-none"
                />
            </div>
        </div>
    )
}

export default Cropper
