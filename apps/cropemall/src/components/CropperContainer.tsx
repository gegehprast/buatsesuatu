import background from '@/assets/background.png'
import { useCropper } from '@/hooks/useCropper'
import React, { useEffect, useRef } from 'react'
import CropperMarker from './CropperMarker'
import { Vector } from '@buatsesuatu/math'
import CropperRotateHandler from './CropperRotateHandler'

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
    
    const lastTouchDistance = useRef<number>(0)

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

        const handleTouchStart = (e: TouchEvent) => {
            if (e.touches.length === 2) {
                e.preventDefault()
                const touch1 = e.touches[0]
                const touch2 = e.touches[1]
                lastTouchDistance.current = Math.hypot(
                    touch2.clientX - touch1.clientX,
                    touch2.clientY - touch1.clientY,
                )
            }
        }

        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches.length === 2) {
                e.preventDefault()
                const touch1 = e.touches[0]
                const touch2 = e.touches[1]
                const currentDistance = Math.hypot(
                    touch2.clientX - touch1.clientX,
                    touch2.clientY - touch1.clientY,
                )

                const factor = 0.8
                const delta =
                    (currentDistance - lastTouchDistance.current) * factor
                const aspectRatio = imgSize.width / imgSize.height
                const newWidth = imgSize.width + delta
                const newHeight = newWidth / aspectRatio

                // center point of the pinch
                const rect = containerEl.getBoundingClientRect()
                const centerX = (touch1.clientX + touch2.clientX) / 2
                const centerY = (touch1.clientY + touch2.clientY) / 2
                const offsetX = (centerX - rect.left - imgPos.x) / imgSize.width
                const offsetY = (centerY - rect.top - imgPos.y) / imgSize.height

                const newImgPosX =
                    imgPos.x - (newWidth - imgSize.width) * offsetX
                const newImgPosY =
                    imgPos.y - (newHeight - imgSize.height) * offsetY

                setImgSize({ width: newWidth, height: newHeight })
                setImgPos(() => new Vector(newImgPosX, newImgPosY))

                lastTouchDistance.current = currentDistance
            }
        }

        imgEl.addEventListener('wheel', zoom, { passive: false })
        cropEl.addEventListener('wheel', zoom, { passive: false })

        imgEl.addEventListener('touchstart', handleTouchStart, {
            passive: false,
        })
        cropEl.addEventListener('touchstart', handleTouchStart, {
            passive: false,
        })

        imgEl.addEventListener('touchmove', handleTouchMove, { passive: false })
        cropEl.addEventListener('touchmove', handleTouchMove, {
            passive: false,
        })

        return () => {
            imgEl.removeEventListener('wheel', zoom)
            cropEl.removeEventListener('wheel', zoom)
            imgEl.removeEventListener('touchstart', handleTouchStart)
            cropEl.removeEventListener('touchstart', handleTouchStart)
            imgEl.removeEventListener('touchmove', handleTouchMove)
            cropEl.removeEventListener('touchmove', handleTouchMove)
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
            className="relative overflow-hidden border border-collapse border-mf-500 aspect-video touch-none"
            style={{ backgroundImage: `url(${background})` }}
            onDragOver={(e) => e.preventDefault()}
        >
            {children}

            <CropperBackdrop />

            <CropperMarker />

            <CropperRotateHandler />
        </div>
    )
}

const CropperBackdrop: React.FC = () => {
    return (
        <div className="absolute w-full h-full bg-gray-900/30 pointer-events-none"></div>
    )
}

export default CropperContainer
