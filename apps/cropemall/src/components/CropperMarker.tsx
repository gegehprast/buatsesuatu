import { useCropper } from '@/hooks/useCropper'
import { Vector } from '@buatsesuatu/math'
import { useEffect } from 'react'
import CropperMarkerHandler from './CropperMarkerHandler'

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
        imgRotation,
    } = useCropper()

    // initial crop size and position
    useEffect(() => {
        if (!containerInitialized || !imageInitialized || cropInitialized)
            return

        let size = imgSize.width * 0.8

        if (imgSize.height < size) {
            size = imgSize.height * 0.8
        }

        setCropSize({ width: size, height: size })
        setCropInitialized(true)

        setCropPos(
            () =>
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
        imgSize.height,
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
        <>
            <div
                ref={crop}
                className="absolute outline-1 outline-mf-500"
                style={{
                    width: `${cropSize.width}px`,
                    height: `${cropSize.height}px`,
                }}
            >
                <div className="w-full h-full overflow-hidden">
                    <img
                        src={img.current?.src}
                        alt="img_cropper"
                        className="block select-none pointer-events-none max-w-none! max-h-none!"
                        style={{
                            width: `${imgSize.width}px`,
                            height: `${imgSize.height}px`,
                            transform: `translate(${relativePosition.x}px, ${relativePosition.y}px) rotate(${imgRotation}rad)`,
                        }}
                    />
                </div>

                <CropperMarkerHandler type="top" />
                <CropperMarkerHandler type="bottom" />
                <CropperMarkerHandler type="left" />
                <CropperMarkerHandler type="right" />
                <CropperMarkerHandler type="top-left" />
                <CropperMarkerHandler type="top-right" />
                <CropperMarkerHandler type="bottom-left" />
                <CropperMarkerHandler type="bottom-right" />
            </div>
        </>
    )
}

export default CropperMarker
