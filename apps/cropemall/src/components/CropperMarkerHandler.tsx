import React, { useEffect, useRef } from 'react'
import { useCropper } from '@/hooks/useCropper'
import { Vector } from '@buatsesuatu/math'
import { Bounds, Size } from '@/libs/cropper'

interface CropperMarkerHandlerProps {
    type:
        | 'top-left'
        | 'top-right'
        | 'bottom-right'
        | 'bottom-left'
        | 'left'
        | 'top'
        | 'right'
        | 'bottom'
}

const styleMap = new Map([
    ['top-left', '-top-[10px] -left-[10px] cursor-nw-resize'],
    ['top-right', '-top-[10px] -right-[10px] cursor-ne-resize'],
    ['bottom-right', '-bottom-[10px] -right-[10px] cursor-se-resize'],
    ['bottom-left', '-bottom-[10px] -left-[10px] cursor-sw-resize'],
    ['left', 'top-1/2 -left-[10px] transform -translate-y-1/2 cursor-w-resize'],
    ['top', '-top-[10px] left-1/2 transform -translate-x-1/2 cursor-n-resize'],
    [
        'right',
        'top-1/2 -right-[10px] transform -translate-y-1/2 cursor-e-resize',
    ],
    [
        'bottom',
        '-bottom-[10px] left-1/2 transform -translate-x-1/2 cursor-s-resize',
    ],
])

type Resizer = (
    type: CropperMarkerHandlerProps['type'],
    imgBounds: Bounds,
    size: Size,
    pos: Vector,
    start: Vector,
    mouse: Vector,
) => { newSize: Size; newPos: Vector }

const resize: Resizer = (type, imgBounds, size, pos, start, mouse) => {
    const newSize = { width: size.width, height: size.height }
    const newPos = pos.copy()
    const aspectRatio = size.width / size.height

    const deltaX = mouse.x - start.x
    const deltaY = mouse.y - start.y

    switch (type) {
        case 'top-left':
            newSize.width = size.width - deltaX
            newSize.height = newSize.width / aspectRatio
            newPos.x = pos.x + deltaX
            newPos.y = pos.y + (size.height - newSize.height)
            break
        case 'top-right':
            newSize.width = size.width + deltaX
            newSize.height = newSize.width / aspectRatio
            newPos.y = pos.y + (size.height - newSize.height)
            break
        case 'bottom-right':
            newSize.width = size.width + deltaX
            newSize.height = newSize.width / aspectRatio
            break
        case 'bottom-left':
            newSize.width = size.width - deltaX
            newSize.height = newSize.width / aspectRatio
            newPos.x = pos.x + deltaX
            break
        case 'left':
            newSize.width = size.width - deltaX
            newPos.x = pos.x + deltaX
            break
        case 'top':
            newSize.height = size.height - deltaY
            newPos.y = pos.y + deltaY
            break
        case 'right':
            newSize.width = size.width + deltaX
            break
        case 'bottom':
            newSize.height = size.height + deltaY
            break
    }

    // ensure the crop area is within the image bounds
    if (newPos.x < imgBounds.minX) {
        newPos.x = imgBounds.minX
    }

    if (newPos.y < imgBounds.minY) {
        newPos.y = imgBounds.minY
    }

    if (newPos.x + newSize.width > imgBounds.maxX) {
        newSize.width = imgBounds.maxX - newPos.x

        if (type.includes('top') || type.includes('bottom')) {
            newSize.height = newSize.width / aspectRatio
        }
    }

    if (newPos.y + newSize.height > imgBounds.maxY) {
        newSize.height = imgBounds.maxY - newPos.y

        if (type.includes('left') || type.includes('right')) {
            newSize.width = newSize.height * aspectRatio
        }
    }

    return { newSize, newPos }
}

const CropperMarkerHandler: React.FC<CropperMarkerHandlerProps> = ({
    type,
}) => {
    const { img, cropSize, setCropSize, cropPos, setCropPos, imgBounds } =
        useCropper()
    const elementRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const element = elementRef.current
        const imgElement = img.current

        if (!element || !imgElement) return

        const handleResize = (
            clientX: number,
            clientY: number,
            startPosition: Vector,
        ) => {
            if (!imgElement) return

            const { newSize, newPos } = resize(
                type,
                imgBounds,
                cropSize,
                cropPos,
                startPosition,
                new Vector(clientX, clientY),
            )

            setCropSize(newSize)
            setCropPos(() => newPos)
        }

        function handleMouseDown(e: MouseEvent) {
            e.preventDefault()
            e.stopPropagation()

            const startPosition = new Vector(e.pageX, e.pageY)

            function onMouseMove(e: MouseEvent) {
                e.preventDefault()
                e.stopPropagation()
                handleResize(e.pageX, e.pageY, startPosition)
            }

            function onMouseUp(e: MouseEvent) {
                e.preventDefault()
                e.stopPropagation()
                document.body.removeEventListener('mousemove', onMouseMove)
            }

            document.body.addEventListener('mousemove', onMouseMove)
            document.body.addEventListener('mouseup', onMouseUp, { once: true })
        }

        function handleTouchStart(e: TouchEvent) {
            e.preventDefault()
            e.stopPropagation()

            if (e.touches.length !== 1) return

            const touch = e.touches[0]
            const startPosition = new Vector(touch.pageX, touch.pageY)

            function onTouchMove(e: TouchEvent) {
                e.preventDefault()
                e.stopPropagation()

                if (e.touches.length !== 1) return

                const touch = e.touches[0]
                handleResize(touch.pageX, touch.pageY, startPosition)
            }

            function onTouchEnd(e: TouchEvent) {
                e.preventDefault()
                e.stopPropagation()
                document.body.removeEventListener('touchmove', onTouchMove)
            }

            document.body.addEventListener('touchmove', onTouchMove, {
                passive: false,
            })
            document.body.addEventListener('touchend', onTouchEnd, {
                once: true,
            })
        }

        element.addEventListener('mousedown', handleMouseDown)
        element.addEventListener('touchstart', handleTouchStart, {
            passive: false,
        })

        return () => {
            element.removeEventListener('mousedown', handleMouseDown)
            element.removeEventListener('touchstart', handleTouchStart)
        }
    }, [cropPos, cropSize, img, imgBounds, setCropPos, setCropSize, type])

    return (
        <div
            ref={elementRef}
            className={`absolute w-[10px] h-[10px] bg-mf-500 touch-none ${styleMap.get(type)}`}
        />
    )
}

export default CropperMarkerHandler
