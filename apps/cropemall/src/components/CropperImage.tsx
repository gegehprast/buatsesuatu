import { useCropper } from '@/hooks/useCropper'
import { Vector } from '@cropemall/math'
import React, { useEffect } from 'react'

interface CropperImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string
}

const CropperImage: React.FC<CropperImageProps> = ({ src, ...props }) => {
    const {
        imageLoaded,
        setImageLoaded,
        imageInitialized,
        setImageInitialized,
        containerInitialized,
        containerSize,
        img,
        imgSize,
        setImgSize,
        imgPos,
        setImgPos,
        imgRotation,
    } = useCropper()

    useEffect(() => {
        if (!containerInitialized || !imageLoaded || imageInitialized) return

        const imgEl = img.current

        if (!imgEl) return

        const ratio = imgEl.naturalWidth / imgEl.naturalHeight
        const width = containerSize.height * ratio
        const height = containerSize.height

        setImgSize({ width, height })

        setImgPos(() => new Vector((containerSize.width - width) / 2, 0))

        setImageInitialized(true)
    }, [
        imageLoaded,
        containerInitialized,
        containerSize.height,
        containerSize.width,
        img,
        setImageInitialized,
        setImgPos,
        setImgSize,
        imageInitialized,
    ])

    const onLoad: React.ImgHTMLAttributes<HTMLImageElement>['onLoad'] = () => {
        setImageLoaded(true)
    }

    return (
        <>
            <img
                ref={img}
                onLoad={onLoad}
                src={src}
                style={{
                    width: `${imgSize.width}px`,
                    height: `${imgSize.height}px`,
                    transform: `translate(${imgPos.x}px, ${imgPos.y}px) rotate(${imgRotation}rad)`,
                }}
                className={`absolute block select-none ${props.className || ''} max-w-none! max-h-none!`}
                {...props}
            />

            {!imageInitialized && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <p className="text-white">Loading...</p>
                </div>
            )}

            {/* x,y dot debug */}
            <div
                className="absolute bg-red-500 w-1 h-1"
                style={{
                    transform: `translate(${imgPos.x}px, ${imgPos.y}px)`,
                }}
            ></div>

            {/* x,y dot debug */}
            <div
                className="absolute bg-blue-500 w-1 h-1"
                style={{
                    transform: `translate(${imgPos.x + imgSize.width}px, ${imgPos.y}px)`,
                }}
            ></div>

            {/* x,y dot debug */}
            <div
                className="absolute bg-green-500 w-1 h-1"
                style={{
                    transform: `translate(${imgPos.x}px, ${imgPos.y + imgSize.height}px)`,
                }}
            ></div>

            {/* x,y dot debug */}
            <div
                className="absolute bg-yellow-500 w-1 h-1"
                style={{
                    transform: `translate(${imgPos.x + imgSize.width}px, ${imgPos.y + imgSize.height}px)`,
                }}
            ></div>
        </>
    )
}

export default CropperImage
