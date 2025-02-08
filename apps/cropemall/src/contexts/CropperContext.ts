import { Vector } from '@cropemall/math'
import React, { createContext } from 'react'

interface CropperContextValue {
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

    containerSize: { width: number; height: number }
    imgSize: { width: number; height: number }
    cropSize: { width: number; height: number }
    setContainerSize: (size: { width: number; height: number }) => void
    setImgSize: (size: { width: number; height: number }) => void
    setCropSize: (size: { width: number; height: number }) => void

    imgPos: Vector
    cropPos: Vector
    setImgPos: (pos: Vector) => void
    setCropPos: (pos: Vector) => void
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
})

export default CropperContext
