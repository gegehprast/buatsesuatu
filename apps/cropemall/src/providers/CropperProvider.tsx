import useMouseMovable from '@/hooks/useMouseMovable'
import React, { useImperativeHandle, useRef, useState } from 'react'
import CropperContext from '../contexts/CropperContext'
import useCropperDownload from '@/hooks/useCropperDownload'
import useCropperReset from '@/hooks/useCropperReset'
import useCropperResult from '@/hooks/useCropperResult'

export type CropperMethods = {
    download: () => void
    reset: () => void
    getResult: () => Promise<string | undefined>
}

interface CropperProviderProps {
    children: React.ReactNode
    ref?: React.RefObject<CropperMethods | null>
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

    const [img, imgPos, setImgPos] = useMouseMovable<HTMLImageElement>(undefined, true)
    const [crop, cropPos, setCropPos] = useMouseMovable<HTMLDivElement>({
        top: imgPos.y,
        left: imgPos.x,
        right: imgPos.x + imgSize.width,
        bottom: imgPos.y + imgSize.height,
    })

    const [imgRotation, setImgRotation] = useState(0)

    const [result, setResult] = useState<string | undefined>(undefined)

    const download = useCropperDownload({
        img,
        imgSize,
        imgRotation,
        cropSize,
        cropPos,
        imgPos,
    })
    const reset = useCropperReset({
        container,
        img,
        setImgSize,
        setImgPos,
        setCropSize,
        setCropPos,
        setImgRotation,
    })
    const getResult = useCropperResult({
        img,
        imgSize,
        imgRotation,
        cropSize,
        cropPos,
        imgPos,
        setResult,
    })

    useImperativeHandle(ref, () => {
        return {
            download,
            reset,
            getResult,
        }
    }, [download, reset, getResult])

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

                containerSize,
                imgSize,
                cropSize,
                setContainerSize,
                setImgSize,
                setCropSize,

                imgPos,
                cropPos,
                setImgPos,
                setCropPos,

                imgRotation,
                setImgRotation,

                result, 
                setResult,

                download,
                reset,
                getResult
            }}
        >
            {children}
        </CropperContext.Provider>
    )
}

export default CropperProvider
