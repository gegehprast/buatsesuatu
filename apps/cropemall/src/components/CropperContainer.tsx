import background from '@/assets/background.png'
import { useCropper } from '@/hooks/useCropper'
import React, { useEffect } from 'react'
import CropperMarker from './CropperMarker'
import { Vector } from '@cropemall/math'

interface CropperContainerProps {
    children: React.ReactNode
}

const CropperContainer: React.FC<CropperContainerProps> = ({ children }) => {
    const {
        containerInitialized,
        setContainerInitialized,
        container,
        img,
        crop,
        setContainerSize,
        imgSize,
        setImgSize,
        imgPos,
        setImgPos,
    } = useCropper()

    useEffect(() => {
        const containerEl = container.current
        const imgEl = img.current
        const cropEl = crop.current

        if (!containerEl || !imgEl || !cropEl) return

        const zoom = (e: WheelEvent) => {
            e.preventDefault()

            const factor = 0.2
            const aspectRatio = imgSize.width / imgSize.height
            const newWidth = imgSize.width + e.deltaY * factor
            const newHeight = newWidth / aspectRatio

            const rect = containerEl.getBoundingClientRect()
            const offsetX = (e.clientX - rect.left - imgPos.x) / imgSize.width
            const offsetY = (e.clientY - rect.top - imgPos.y) / imgSize.height

            const newImgPosX = imgPos.x - (newWidth - imgSize.width) * offsetX
            const newImgPosY = imgPos.y - (newHeight - imgSize.height) * offsetY

            setImgSize({ width: newWidth, height: newHeight })
            setImgPos(() => new Vector(newImgPosX, newImgPosY))
        }

        imgEl.addEventListener('wheel', zoom, { passive: false })
        cropEl.addEventListener('wheel', zoom, { passive: false })

        return () => {
            imgEl.removeEventListener('wheel', zoom)
            cropEl.removeEventListener('wheel', zoom)
        }
    }, [
        container,
        crop,
        img,
        imgPos.x,
        imgPos.y,
        imgSize.height,
        imgSize.width,
        setImgPos,
        setImgSize,
    ])

    useEffect(() => {
        const containerEl = container.current

        if (!containerEl) return

        if (containerInitialized) return

        const { width, height } = containerEl.getBoundingClientRect()

        setContainerSize({ width, height })

        setContainerInitialized(true)
    }, [
        container,
        containerInitialized,
        setContainerInitialized,
        setContainerSize,
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
        <div className="absolute w-full h-full bg-gray-900/30 pointer-events-none"></div>
    )
}

export default CropperContainer
