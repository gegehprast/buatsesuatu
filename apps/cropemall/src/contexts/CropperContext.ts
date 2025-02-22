import { UseMovableSetPosition } from '@/hooks/useMovable'
import { Bounds, Size, State } from '@/libs/cropper'
import { Vector } from '@buatsesuatu/math'
import React, { createContext } from 'react'

export const defaultState: State = {
    renderedImageBounds: {
        minX: 0,
        maxX: 0,
        minY: 0,
        maxY: 0,
    },
    renderedCropperSize: { width: 0, height: 0 },
    renderedCropperPos: new Vector(0, 0),

    imageRotation: 0,

    actualImageDimension: { width: 0, height: 0 },
    actualImageBounds: {
        minX: 0,
        maxX: 0,
        minY: 0,
        maxY: 0,
    },
    actualCropperSize: { width: 0, height: 0 },
    actualCropperPos: new Vector(0, 0),
}

export interface CropperContextValue {
    imageLoaded: boolean
    setImageLoaded: (loaded: boolean) => void

    containerInitialized: boolean
    imageInitialized: boolean
    cropInitialized: boolean
    setContainerInitialized: (initialized: boolean) => void
    setImageInitialized: (initialized: boolean) => void
    setCropInitialized: (initialized: boolean) => void

    container: React.RefObject<HTMLDivElement | null>
    img: React.RefObject<HTMLImageElement | null>
    crop: React.RefObject<HTMLDivElement | null>

    containerSize: Size
    imgSize: Size
    cropSize: Size
    setContainerSize: React.Dispatch<React.SetStateAction<Size>>
    setImgSize: React.Dispatch<React.SetStateAction<Size>>
    setCropSize: React.Dispatch<React.SetStateAction<Size>>

    imgPos: Vector
    cropPos: Vector
    setImgPos: UseMovableSetPosition
    setCropPos: UseMovableSetPosition

    imgRotation: number
    setImgRotation: React.Dispatch<React.SetStateAction<number>>
    imgBounds: Bounds

    result: string | undefined
    setResult: React.Dispatch<React.SetStateAction<string | undefined>>

    download: () => void
    reset: () => void
    getResult: () => Promise<string | undefined>
    setActualCropperSize: (setter: (prev: Size) => Size) => void

    state: State
}

const CropperContext = createContext<CropperContextValue>({
    imageLoaded: false,
    setImageLoaded: () => {},

    containerInitialized: false,
    imageInitialized: false,
    cropInitialized: false,
    setContainerInitialized: () => {},
    setImageInitialized: () => {},
    setCropInitialized: () => {},

    container: { current: null },
    img: { current: null },
    crop: { current: null },

    containerSize: { width: 0, height: 0 },
    imgSize: { width: 0, height: 0 },
    cropSize: { width: 0, height: 0 },
    setContainerSize: () => {},
    setImgSize: () => {},
    setCropSize: () => {},

    imgPos: new Vector(0, 0),
    cropPos: new Vector(0, 0),
    setImgPos: () => {},
    setCropPos: () => {},

    imgRotation: 0,
    setImgRotation: () => {},
    imgBounds: {
        minX: 0,
        maxX: 0,
        minY: 0,
        maxY: 0,
    },

    result: undefined,
    setResult: () => {},

    download: () => {},
    reset: () => {},
    getResult: async () => undefined,
    setActualCropperSize: () => {},

    state: defaultState,
})

export default CropperContext
