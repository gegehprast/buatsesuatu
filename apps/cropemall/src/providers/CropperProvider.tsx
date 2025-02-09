import useMouseMovable from '@/hooks/useMouseMovable'
import React, { useImperativeHandle, useRef, useState } from 'react'
import CropperContext from '../contexts/CropperContext'
import { download } from '@/libs/download'

interface CropperProviderProps {
    children: React.ReactNode,
    ref: React.RefObject<{ download: () => void } | null>
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
        }
    }, [cropPos, cropSize, img, imgPos, imgSize])

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
