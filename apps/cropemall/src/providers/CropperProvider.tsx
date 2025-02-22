import useMovable, { UseMovableSetPosition } from '@/hooks/useMovable'
import React, { useCallback, useImperativeHandle, useMemo, useRef, useState } from 'react'
import CropperContext, { CropperContextValue, defaultState } from '../contexts/CropperContext'
import useCropperDownload from '@/hooks/useCropperDownload'
import useCropperReset from '@/hooks/useCropperReset'
import useCropperResult from '@/hooks/useCropperResult'
import { getBounds, getState, Size } from '@/libs/cropper'

export type CropperMethods = {
    download: CropperContextValue['download']
    reset: CropperContextValue['reset']
    getResult: CropperContextValue['getResult']
    setImagePosition: UseMovableSetPosition
    setCropperSize: CropperContextValue['setActualCropperSize']
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

    const [img, imgPos, setImgPos] = useMovable<HTMLImageElement>(
        undefined,
        true,
    )

    const [imgRotation, setImgRotation] = useState(0)

    const imgBounds = useMemo(() => {
        return getBounds(
            imgPos.x,
            imgPos.y,
            imgSize.width,
            imgSize.height,
            imgRotation,
        )
    }, [imgPos, imgSize, imgRotation])

    const [crop, cropPos, setCropPos] = useMovable<HTMLDivElement>({
        top: imgBounds.minY,
        left: imgBounds.minX,
        right: imgBounds.maxX,
        bottom: imgBounds.maxY,
    })

    const [result, setResult] = useState<string | undefined>(undefined)

    const download = useCropperDownload({
        img,
        imgRotation,
        imgBounds,
        cropSize,
        cropPos,
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
        imgRotation,
        imgBounds,
        cropSize,
        cropPos,
        setResult,
    })

    const state = useMemo(() => {
        if (!img.current) return defaultState

        return getState(
            img.current!,
            imgRotation,
            imgBounds,
            cropSize,
            cropPos,
        )
    }, [cropPos, cropSize, img, imgBounds, imgRotation])
    
    const setActualCropperSize = useCallback(
        (setter: (prev: Size) => Size) => {
            if (!img.current) return

            const size = setter(state.actualCropperSize)

            const ratioToRendered = imgSize.width / img.current.naturalWidth
            const newSize = {
                width: size.width * ratioToRendered,
                height: size.height * ratioToRendered,
            }

            setCropSize(newSize)
        },
        [img, imgSize.width, state.actualCropperSize],
    )

    useImperativeHandle(ref, () => {
        return {
            download,
            reset,
            getResult,
            setImagePosition: setImgPos,
            setCropperSize: setActualCropperSize,
        }
    }, [download, reset, getResult, setImgPos, setActualCropperSize])

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
                imgBounds,

                result,
                setResult,

                download,
                reset,
                getResult,
                setActualCropperSize,

                state,
            }}
        >
            {children}
        </CropperContext.Provider>
    )
}

export default CropperProvider
