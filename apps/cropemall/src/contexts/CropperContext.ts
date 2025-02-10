import { UseMouseMovableSetPosition } from '@/hooks/useMouseMovable';
import { Vector } from '@cropemall/math'
import React, { createContext } from 'react'

export type Size = { width: number; height: number }

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
    setImgPos: UseMouseMovableSetPosition
    setCropPos: UseMouseMovableSetPosition

    imgRotation: number
    setImgRotation: React.Dispatch<React.SetStateAction<number>>

    result: string | undefined
    setResult: React.Dispatch<React.SetStateAction<string | undefined>>

    download: () => void
    reset: () => void
    getResult: () => Promise<string | undefined>
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

    result: undefined,
    setResult: () => {},

    download: () => {},
    reset: () => {},
    getResult: async () => undefined,
})

export default CropperContext
