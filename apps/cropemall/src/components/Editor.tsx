import React, { useCallback, useEffect, useRef, useState } from 'react'
import background from '@/assets/background.png'
import useMovableWithMouse from '@/hooks/useMovableWithMouse'
import Cropper from './Cropper'

interface CropperProps {
    img: string
    alt: string
}

const Editor: React.FC<CropperProps> = ({ img, alt }) => {
    const container = useRef<HTMLDivElement>(null)
    const [image, position] = useMovableWithMouse<HTMLImageElement>()
    const [size, setSize] = useState({ width: 0, height: 0 })

    const calculateImageSize = useCallback(() => {
        if (!container.current || !image.current) {
            return
        }

        // get the container size
        const { height } = container.current.getBoundingClientRect()

        // calculate the image size based on the container height
        const ratio = image.current.naturalWidth / image.current.naturalHeight
        const imgWidth = height * ratio
        const imgHeight = height

        setSize({ width: imgWidth, height: imgHeight })
    }, [image])

    useEffect(() => {
        calculateImageSize()
    }, [calculateImageSize])

    return (
        <div className="flex flex-col aspect-video p-2">
            <div
                ref={container}
                className="relative overflow-hidden border border-collapse border-mf-500 aspect-video"
                style={{ backgroundImage: `url(${background})` }}
                onDragOver={(e) => e.preventDefault()}
            >
                <img
                    ref={image}
                    src={img}
                    alt={alt}
                    className="absolute select-none w-full h-full"
                    style={{
                        width: `${size.width}px`,
                        height: `${size.height}px`,
                    }}
                    onLoad={calculateImageSize}
                />

                <div className="absolute w-full h-full bg-mf-900/25 pointer-events-none"></div>

                {/* crop square */}
                <Cropper image={img} size={size} position={position} />
            </div>
        </div>
    )
}

export default Editor
