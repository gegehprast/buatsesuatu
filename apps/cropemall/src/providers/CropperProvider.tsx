import useMouseMovable from '@/hooks/useMouseMovable'
import React, { useImperativeHandle, useRef, useState } from 'react'
import CropperContext from '../contexts/CropperContext'
import { download } from '@/libs/download'
import { Vector } from '@cropemall/math'

export type CropperProviderMethods = {
    download: () => void
    reset: () => void
}

interface CropperProviderProps {
    children: React.ReactNode
    ref: React.RefObject<CropperProviderMethods | null>
}

const CropperProvider: React.FC<CropperProviderProps> = ({ children, ref }) => {
    const [imageLoaded, setImageLoaded] = useState(false)

    const [containerInitialized, setContainerInitialized] = useState(false)
    const [imageInitialized, setImageInitialized] = useState(false)
    const [cropInitialized, setCropInitialized] = useState(false)

    const container = useRef<HTMLDivElement>(null)

    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
    const [imgSize, setImgSize] = useState({ width: 0, height: 0 })
    const [cropSize, setCropSize] = useState({ width: 0, height: 0 })

    const [img, imgPos, setImgPos] = useMouseMovable<HTMLImageElement>()
    const [crop, cropPos, setCropPos] = useMouseMovable<HTMLDivElement>({
        top: imgPos.y,
        left: imgPos.x,
        right: imgPos.x + imgSize.width,
        bottom: imgPos.y + imgSize.height,
    })

    useImperativeHandle(ref, () => {
        return {
            download() {
                if (!img.current) return

                download(img.current, imgSize, cropSize, cropPos, imgPos)
            },
            reset() {
                if (!container.current || !img.current) {
                    return
                }

                const containerEl = container.current
                const imgEl = img.current

                const { width: cWidth, height: cHeight } =
                    containerEl.getBoundingClientRect()

                // reset image size and position
                const ratio = imgEl.naturalWidth / imgEl.naturalHeight
                const newImgSize = { width: cHeight * ratio, height: cHeight }
                const newImgPos = new Vector((cWidth - newImgSize.width) / 2, 0)
                setImgSize(newImgSize)
                setImgPos(() => newImgPos)

                // reset crop size and position
                let size = newImgSize.width * 0.8

                if (newImgSize.height < size) {
                    size = newImgSize.height * 0.8
                }

                setCropSize({ width: size, height: size })
                setCropPos(
                    () => new Vector((cWidth - size) / 2, (cHeight - size) / 2),
                    {},
                )
            },
        }
    }, [cropPos, cropSize, img, imgPos, imgSize, setCropPos, setImgPos])

    return (
        <CropperContext.Provider
            value={{
                imageLoaded,
                setImageLoaded,

                containerInitialized,
                setContainerInitialized,
                imageInitialized,
                setImageInitialized,
                cropInitialized,
                setCropInitialized,

                container,
                img,
                crop,

                imgSize,
                setImgSize,
                cropSize,
                setCropSize,

                imgPos,
                setImgPos,
                cropPos,
                setCropPos,
                containerSize,
                setContainerSize,
            }}
        >
            {children}
        </CropperContext.Provider>
    )
}

export default CropperProvider
