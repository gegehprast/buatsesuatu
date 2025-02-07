import React, { useEffect, useMemo } from 'react'
import useMovableWithMouse from '@/hooks/useMovableWithMouse'
import { Vector } from '@cropemall/math'

interface CropperProps {
    containerSize: { width: number; height: number }
    image: string
    size: { width: number; height: number }
    position: Vector
}

const Cropper: React.FC<CropperProps> = ({
    containerSize,
    image,
    size: imageSize,
    position: imagePosition,
}) => {
    const [movable, position, setPosition] =
        useMovableWithMouse<HTMLDivElement>()

    const size = useMemo(() => {
        let size = containerSize.width * 0.5

        if (imageSize.width < size) {
            size = imageSize.width
        }

        return { width: size, height: size }
    }, [imageSize.width, containerSize.width])

    const relativePosition = useMemo(() => {
        const imageX = imagePosition.x
        const cropperX = position.x
        const imageY = imagePosition.y
        const cropperY = position.y

        return {
            x: (cropperX - imageX) * -1,
            y: (cropperY - imageY) * -1,
        }
    }, [imagePosition.x, imagePosition.y, position.x, position.y])

    useEffect(() => {
        setPosition(
            new Vector(
                (containerSize.width - size.width) / 2,
                (containerSize.height - size.height) / 2,
            ),
        )
    }, [containerSize, setPosition, size.height, size.width])

    return (
        <div
            ref={movable}
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
                    transform: `translate(${relativePosition.x}px, ${relativePosition.y}px)`,
                }}
            />
        </div>
    )
}

export default Cropper
