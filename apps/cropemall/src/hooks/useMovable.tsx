import { Vector } from '@cropemall/math'
import React, { useRef, useState } from 'react'

type Position = Vector
type DragStartHandler = (e: React.DragEvent<HTMLDivElement>) => void
type DragHandler = (e: React.DragEvent<HTMLDivElement>) => void
type DragEndHandler = (e: React.DragEvent<HTMLDivElement>) => void

type UseMovable = () => [
    Position,
    DragStartHandler,
    DragHandler,
    DragEndHandler,
]

const useMovable: UseMovable = () => {
    const [position, setPosition] = useState(new Vector(0, 0))
    const dragStartPosRef = useRef(new Vector(0, 0))
    const dragEndPosRef = useRef(new Vector(0, 0))

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        dragStartPosRef.current = new Vector(e.clientX, e.clientY)
    }

    const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()

        dragEndPosRef.current = new Vector(e.clientX, e.clientY)

        const force = dragEndPosRef.current.sub(dragStartPosRef.current)
        const pos = position.add(force)

        setPosition(pos)

        dragStartPosRef.current = dragEndPosRef.current
    }

    return [position, handleDragStart, handleDrag, handleDrag]
}

export default useMovable
