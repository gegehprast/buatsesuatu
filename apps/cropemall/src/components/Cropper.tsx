import React, { useState } from 'react'
import useMovableWithMouse from '@/hooks/useMovableWithMouse'
import { Vector } from '@cropemall/math'

interface CropperProps {
    image: string
    size: { width: number; height: number }
    position: Vector
}

const Cropper: React.FC<CropperProps> = ({ image, size, position }) => {
    const [movable, cropperPosition] = useMovableWithMouse<HTMLDivElement>()
    const cropperSize = { width: 200, height: 200 }

    function getRelativePosition() {
        const imageX = position.x
        const cropperX = cropperPosition.x
        const imageY = position.y
        const cropperY = cropperPosition.y

        return {
            x: (cropperX - imageX) * -1,
            y: (cropperY - imageY) * -1,
        }
    }

    const relativePosition = getRelativePosition()

    return (
        <div
            ref={movable}
            className="absolute outline-1 outline-mf-500 overflow-hidden"
            style={{
                width: `${cropperSize.width}px`,
                height: `${cropperSize.height}px`,
            }}
        >
            <img
                src={image}
                alt="img_cropper"
                className="block select-none max-w-none! max-h-none!"
                style={{
                    width: `${size.width}px`,
                    height: `${size.height}px`,
                    transform: `translate(${relativePosition.x}px, ${relativePosition.y}px)`,
                }}
            />
        </div>
    )
}

export default Cropper
