import React, { useEffect, useMemo, useRef, useState } from 'react'
import background from '@/assets/background.png'
import useMovableWithMouse from '@/hooks/useMovableWithMouse'
import Cropper from './Cropper'
import { Vector } from '@cropemall/math'

interface CropperProps {
    img: string
    alt: string
}

const Editor: React.FC<CropperProps> = ({ img, alt }) => {
    const canvas = useRef<HTMLCanvasElement>(null)
    const [image, imgPos, setImgPos] = useMovableWithMouse<HTMLImageElement>()
    const [cropper, cropperPos, setCropperPos] = useMovableWithMouse<HTMLDivElement>()
    const container = useRef<HTMLDivElement>(null)
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
    const [imgSize, setImgSize] = useState({ width: 0, height: 0 })

    const cropperSize = useMemo(() => {
        let size = containerSize.width * 0.5

        if (imgSize.width < size) {
            size = imgSize.width * 0.8
        }

        return { width: size, height: size }
    }, [containerSize.width, imgSize.width])

    const relativePosition = useMemo(() => {
        const imageX = imgPos.x
        const cropperX = cropperPos.x
        const imageY = imgPos.y
        const cropperY = cropperPos.y

        return new Vector((cropperX - imageX) * -1, (cropperY - imageY) * -1)
    }, [cropperPos.x, cropperPos.y, imgPos.x, imgPos.y])

    useEffect(() => {
        setCropperPos(
            new Vector(
                (containerSize.width - cropperSize.width) / 2,
                (containerSize.height - cropperSize.height) / 2,
            ),
        )
    }, [containerSize.height, containerSize.width, cropperSize.height, cropperSize.width, setCropperPos])

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
        setImgSize({ width: imgWidth, height: imgHeight })

        // set the initial position
        setImgPos(new Vector((width - imgWidth) / 2, 0))
    }

    const handleCrop = () => {
        if (!canvas.current || !image.current) {
            return
        }

        const ctx = canvas.current.getContext('2d')

        if (!ctx) {
            return
        }
        
        const ratioToNatural = image.current.naturalWidth / imgSize.width
        const actualCropperSize = {
            width: cropperSize.width * ratioToNatural,
            height: cropperSize.height * ratioToNatural,
        }
        const distCropperToImage = cropperPos.sub(imgPos)
        const actualPosition = distCropperToImage.mult(ratioToNatural)
        
        ctx.canvas.width = actualCropperSize.width
        ctx.canvas.height = actualCropperSize.height

        ctx.drawImage(
            image.current,
            actualPosition.x,
            actualPosition.y,
            actualCropperSize.width,
            actualCropperSize.height,
            0,
            0,
            actualCropperSize.width,
            actualCropperSize.height,
        )
    }

    return (
        <div className="relative flex flex-col aspect-video p-2">
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
                        width: `${imgSize.width}px`,
                        height: `${imgSize.height}px`,
                    }}
                    onLoad={calculateImageSize}
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

            <div className="w-full flex justify-center mt-2">
                <button
                    onClick={handleCrop}
                    className="bg-mf-400 p-2 text-white rounded"
                >
                    Crop
                </button>
            </div>

            <div className="relative w-full overflow-auto mt-2 bg-mf-100">
                <canvas ref={canvas} className="block bg-white" />
            </div>
        </div>
    )
}

export default Editor
