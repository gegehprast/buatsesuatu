import React, { useEffect, useRef } from 'react'
import { useCropper } from '@/hooks/useCropper'
import { Vector } from '@cropemall/math'
import { Size } from '@/contexts/CropperContext'

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
    ['top-left', '-top-[4px] -left-[4px] cursor-nw-resize'],
    ['top-right', '-top-[4px] -right-[4px] cursor-ne-resize'],
    ['bottom-right', '-bottom-[4px] -right-[4px] cursor-se-resize'],
    ['bottom-left', '-bottom-[4px] -left-[4px] cursor-sw-resize'],
    ['left', 'top-1/2 -left-[4px] transform -translate-y-1/2 cursor-w-resize'],
    ['top', '-top-[4px] left-1/2 transform -translate-x-1/2 cursor-n-resize'],
    ['right', 'top-1/2 -right-[4px] transform -translate-y-1/2 cursor-e-resize'],
    ['bottom', '-bottom-[4px] left-1/2 transform -translate-x-1/2 cursor-s-resize'],
])

type Resizer = (
    type: CropperMarkerHandlerProps['type'],
    imgSize: Size,
    imgPos: Vector,
    size: Size,
    pos: Vector,
    start: Vector,
    mouse: Vector,
) => { newSize: Size; newPos: Vector }

const resize: Resizer = (type, imgSize, imgPos, size, pos, start, mouse) => {
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

    // Ensure the crop size does not exceed the image size
    if (newPos.x < imgPos.x) {
        newPos.x = imgPos.x
    }
    if (newPos.y < imgPos.y) {
        newPos.y = imgPos.y
    }
    if (newPos.x + newSize.width > imgPos.x + imgSize.width) {
        newSize.width = imgPos.x + imgSize.width - newPos.x
        if (type.includes('top') || type.includes('bottom')) {
            newSize.height = newSize.width / aspectRatio
        }
    }
    if (newPos.y + newSize.height > imgPos.y + imgSize.height) {
        newSize.height = imgPos.y + imgSize.height - newPos.y
        if (type.includes('left') || type.includes('right')) {
            newSize.width = newSize.height * aspectRatio
        }
    }

    return { newSize, newPos }
}

const CropperMarkerHandler: React.FC<CropperMarkerHandlerProps> = ({
    type,
}) => {
    const { imgSize, imgPos, cropSize, setCropSize, cropPos, setCropPos } =
        useCropper()
    const elementRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const element = elementRef.current

        if (!element) return

        function handleMouseDown(e: MouseEvent) {
            e.preventDefault()
            e.stopPropagation()

            const startPosition = new Vector(e.pageX, e.pageY)

            function onMouseMove(e: MouseEvent) {
                e.preventDefault()
                e.stopPropagation()

                const { newSize, newPos } = resize(
                    type,
                    imgSize,
                    imgPos,
                    cropSize,
                    cropPos,
                    startPosition,
                    new Vector(e.pageX, e.pageY),
                )

                setCropSize(newSize)
                setCropPos(() => newPos)
            }

            function onMouseUp(e: MouseEvent) {
                e.preventDefault()
                e.stopPropagation()

                document.body.removeEventListener('mousemove', onMouseMove)
            }

            document.body.addEventListener('mousemove', onMouseMove)
            document.body.addEventListener('mouseup', onMouseUp, { once: true })
        }

        element.addEventListener('mousedown', handleMouseDown)

        return () => {
            element.removeEventListener('mousedown', handleMouseDown)
        }
    }, [cropPos, cropSize, imgPos, imgSize, setCropPos, setCropSize, type])

    return (
        <div
            ref={elementRef}
            className={`absolute w-[4px] h-[4px] bg-mf-500 ${styleMap.get(type)}`}
        />
    )
}

export default CropperMarkerHandler
