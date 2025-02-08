import React from 'react'
import { Vector } from '@cropemall/math'

interface CropperProps {
    movableRef: React.RefObject<HTMLDivElement | null>
    image: string
    imageSize: { width: number; height: number }
    imagePos: Vector
    size: { width: number; height: number }
}

const Cropper: React.FC<CropperProps> = ({
    movableRef,
    image,
    imageSize,
    imagePos,
    size,
}) => {
    return (
        <div
            ref={movableRef}
            className="absolute outline-1 outline-mf-500 overflow-hidden"
            style={{
                width: `${size.width}px`,
                height: `${size.height}px`,
            }}
        >
            <img
                src={image}
                alt="img_cropper"
                className="block select-none max-w-none! max-h-none!"
                style={{
                    width: `${imageSize.width}px`,
                    height: `${imageSize.height}px`,
                    transform: `translate(${imagePos.x}px, ${imagePos.y}px)`,
                }}
            />
        </div>
    )
}

export default Cropper
