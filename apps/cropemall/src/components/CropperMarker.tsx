import { useCropper } from '@/hooks/useCropper'
import { Vector } from '@cropemall/math'
import { useEffect } from 'react'

const CropperMarker: React.FC = () => {
    const {
        containerInitialized,
        imageInitialized,
        cropInitialized,
        setCropInitialized,
        img,
        containerSize,
        imgSize,
        imgPos,
        crop,
        cropSize,
        setCropSize,
        cropPos,
        setCropPos,
    } = useCropper()

    useEffect(() => {
        if (!containerInitialized || !imageInitialized || cropInitialized)
            return

        let size = containerSize.width * 0.5

        if (imgSize.width < size) {
            size = imgSize.width * 0.8
        }

        setCropSize({ width: size, height: size })
        setCropInitialized(true)

        setCropPos(
            new Vector(
                (containerSize.width - size) / 2,
                (containerSize.height - size) / 2,
            ),
        )
    }, [
        containerInitialized,
        containerSize.height,
        containerSize.width,
        cropInitialized,
        imageInitialized,
        imgSize.width,
        setCropInitialized,
        setCropPos,
        setCropSize,
    ])

    const relativePosition = (() => {
        const imageX = imgPos.x
        const cropperX = cropPos.x
        const imageY = imgPos.y
        const cropperY = cropPos.y

        return new Vector((cropperX - imageX) * -1, (cropperY - imageY) * -1)
    })()

    return (
        <div
            ref={crop}
            className="absolute outline-1 outline-mf-500 overflow-hidden"
            style={{
                width: `${cropSize.width}px`,
                height: `${cropSize.height}px`,
            }}
        >
            <img
                src={img.current?.src}
                alt="img_cropper"
                className="block select-none pointer-events-none max-w-none! max-h-none!"
                style={{
                    width: `${imgSize.width}px`,
                    height: `${imgSize.height}px`,
                    transform: `translate(${relativePosition.x}px, ${relativePosition.y}px)`,
                }}
            />
        </div>
    )
}

export default CropperMarker
