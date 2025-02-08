import background from '@/assets/background.png'
import { useCropper } from '@/hooks/useCropper'
import React, { useEffect } from 'react'
import CropperMarker from './CropperMarker'

interface CropperContainerProps {
    children: React.ReactNode
}

const CropperContainer: React.FC<CropperContainerProps> = ({ children }) => {
    const {
        containerInitialized,
        setContainerInitialized,
        container,
        setContainerSize,
        imgSize,
        setImgSize,
    } = useCropper()

    useEffect(() => {
        const containerEl = container.current

        if (!containerEl) return

        const zoom = (e: WheelEvent) => {
            e.preventDefault()

            const factor = 0.1
            const aspectRatio = imgSize.width / imgSize.height
            const width = imgSize.width + e.deltaY * factor
            const height = width / aspectRatio

            setImgSize({ width, height })
        }

        containerEl.addEventListener('wheel', zoom, { passive: false })

        if (containerInitialized) return

        const { width, height } = containerEl.getBoundingClientRect()

        setContainerSize({ width, height })

        setContainerInitialized(true)

        return () => {
            containerEl.removeEventListener('wheel', zoom)
        }
    }, [
        container,
        containerInitialized,
        imgSize.height,
        imgSize.width,
        setContainerInitialized,
        setContainerSize,
        setImgSize,
    ])

    return (
        <div
            ref={container}
            className="relative overflow-hidden border border-collapse border-mf-500 aspect-video"
            style={{ backgroundImage: `url(${background})` }}
            onDragOver={(e) => e.preventDefault()}
        >
            {children}

            <CropperBackdrop />

            <CropperMarker />
        </div>
    )
}

const CropperBackdrop: React.FC = () => {
    return (
        <div className="absolute w-full h-full bg-mf-900/25 pointer-events-none"></div>
    )
}

export default CropperContainer
