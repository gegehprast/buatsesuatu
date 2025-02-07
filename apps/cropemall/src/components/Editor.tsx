import React, { useRef, useState } from 'react'
import background from '@/assets/background.png'
import useMovableWithMouse from '@/hooks/useMovableWithMouse'
import Cropper from './Cropper'
import { Vector } from '@cropemall/math'

interface CropperProps {
    img: string
    alt: string
}

const Editor: React.FC<CropperProps> = ({ img, alt }) => {
    const [image, position, setPosition] = useMovableWithMouse<HTMLImageElement>()
    const container = useRef<HTMLDivElement>(null)
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
    const [size, setSize] = useState({ width: 0, height: 0 })

    const calculateImageSize = () => {
        if (!container.current || !image.current) {
            return
        }

        // get the container size
        const { width, height } = container.current.getBoundingClientRect()

        // set the container size
        setContainerSize({ width, height })

        // calculate the image size based on the container height
        const ratio = image.current.naturalWidth / image.current.naturalHeight
        const imgWidth = height * ratio
        const imgHeight = height

        // set the image size
        setSize({ width: imgWidth, height: imgHeight })

        // set the initial position
        setPosition(new Vector((width - imgWidth) / 2, 0))
    }

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
                <Cropper containerSize={containerSize} image={img} size={size} position={position} />
            </div>
        </div>
    )
}

export default Editor
