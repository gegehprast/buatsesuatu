import React, { useEffect, useRef, useState } from 'react'
import background from '@/assets/background.png'
import useMouseMovable from '@/hooks/useMouseMovable'
import Cropper from './Cropper'
import { Vector } from '@cropemall/math'

const crop = (image: HTMLImageElement, renderedImageSize: { width: number, height: number }, cropperSize: { width: number, height: number }, cropperPos: Vector, renderedImagePosition: Vector) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
        return
    }

    const ratioToNatural = image.naturalWidth / renderedImageSize.width
    const actualCropperSize = {
        width: cropperSize.width * ratioToNatural,
        height: cropperSize.height * ratioToNatural,
    }
    const distCropperToImage = cropperPos.sub(renderedImagePosition)
    const actualPosition = distCropperToImage.mult(ratioToNatural)

    ctx.canvas.width = actualCropperSize.width
    ctx.canvas.height = actualCropperSize.height

    ctx.drawImage(
        image,
        actualPosition.x,
        actualPosition.y,
        actualCropperSize.width,
        actualCropperSize.height,
        0,
        0,
        actualCropperSize.width,
        actualCropperSize.height,
    )
    
    const data = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.href = data
    link.download = 'cropped.png'
    link.click()
}

interface CropperProps {
    img: string
    alt: string
}

const Editor: React.FC<CropperProps> = ({ img, alt }) => {
    const [image, imgPos, setImgPos] = useMouseMovable<HTMLImageElement>()
    const [cropper, cropperPos, setCropperPos] = useMouseMovable<HTMLDivElement>()
    const container = useRef<HTMLDivElement>(null)
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
    const [imgSize, setImgSize] = useState({ width: 0, height: 0 })

    const cropperSize = (() => {
        let size = containerSize.width * 0.5

        if (imgSize.width < size) {
            size = imgSize.width * 0.8
        }

        return { width: size, height: size }
    })()

    const relativePosition = (() => {
        const imageX = imgPos.x
        const cropperX = cropperPos.x
        const imageY = imgPos.y
        const cropperY = cropperPos.y

        return new Vector((cropperX - imageX) * -1, (cropperY - imageY) * -1)
    })()

    useEffect(() => {
        setCropperPos(
            () => new Vector(
                (containerSize.width - cropperSize.width) / 2,
                (containerSize.height - cropperSize.height) / 2,
            ),
        )
    }, [
        containerSize.height,
        containerSize.width,
        cropperSize.height,
        cropperSize.width,
        setCropperPos,
    ])

    const initialize = () => {
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
        setImgSize({ width: imgWidth, height: imgHeight })

        // set the initial position
        setImgPos(() => new Vector((width - imgWidth) / 2, 0))
    }

    const zoom = (e: React.WheelEvent) => {
        e.preventDefault()

        if (!image.current) {
            return
        }
        
        const { width, height } = imgSize
        const { deltaY } = e
        const factor = 0.1
        const aspectRatio = width / height
        const newWidth = width + deltaY * factor
        const newHeight = newWidth / aspectRatio

        setImgSize({ width: newWidth, height: newHeight })
    }

    return (
        <div className="relative flex flex-col aspect-video p-2 bg-gray-200 border border-mf-500 rounded">
            <div
                ref={container}
                className="relative overflow-hidden border border-collapse border-mf-500 aspect-video"
                style={{ backgroundImage: `url(${background})` }}
                onDragOver={(e) => e.preventDefault()}
                onWheel={zoom}
            >
                <img
                    ref={image}
                    src={img}
                    alt={alt}
                    className="absolute select-none w-full h-full"
                    style={{
                        width: `${imgSize.width}px`,
                        height: `${imgSize.height}px`,
                    }}
                    onLoad={initialize}
                />

                <div className="absolute w-full h-full bg-mf-900/25 pointer-events-none"></div>

                {/* crop square */}
                <Cropper
                    movableRef={cropper}
                    image={img}
                    imageSize={imgSize}
                    imagePos={relativePosition}
                    size={cropperSize}
                />
            </div>

            {image.current && (<div className="w-full flex justify-center mt-2">
                <button
                    onClick={() => crop(image.current!, imgSize, cropperSize, cropperPos, imgPos)}
                    className="bg-mf-400 p-2 text-white rounded"
                >
                    Crop
                </button>
            </div>)}
        </div>
    )
}

export default Editor
