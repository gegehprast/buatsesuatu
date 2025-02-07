import { Vector } from '@cropemall/math'
import { useEffect, useRef, useState } from 'react'

type UseMovable<T extends HTMLElement> = [
    React.MutableRefObject<T | null>
]

const useMovable = <T extends HTMLElement>(): UseMovable<T> => {
    const elementRef = useRef<T>(null)
    const dragStartPosRef = useRef(new Vector(0, 0))
    const dragEndPosRef = useRef(new Vector(0, 0))

    const [position, setPosition] = useState(new Vector(0, 0))

    useEffect(() => {
        const element = elementRef.current

        if (!element) {
            return
        }

        function handleDragStart(e: DragEvent) {
            dragStartPosRef.current = new Vector(e.clientX, e.clientY)
        }

        function handleDrag(e: DragEvent) {
            e.preventDefault()
            e.stopPropagation()

            dragEndPosRef.current = new Vector(e.clientX, e.clientY)

            const force = dragEndPosRef.current.sub(dragStartPosRef.current)

            setPosition((pos) => pos.add(force))

            dragStartPosRef.current = dragEndPosRef.current
        }

        function handleDragEnd(e: DragEvent) {
            e.preventDefault()
            e.stopPropagation()

            dragEndPosRef.current = new Vector(e.clientX, e.clientY)

            const force = dragEndPosRef.current.sub(dragStartPosRef.current)

            setPosition((pos) => pos.add(force))
        }

        element.addEventListener('dragstart', handleDragStart)
        element.addEventListener('drag', handleDrag)
        element.addEventListener('dragend', handleDragEnd)

        return () => {
            element.removeEventListener(
                'dragstart',
                handleDragStart,
            )
            element.removeEventListener('drag', handleDrag)
            element.removeEventListener('dragend', handleDragEnd)
        }
    }, [])

    useEffect(() => {
        if (elementRef.current) {
            elementRef.current.setAttribute('draggable', 'true')
            elementRef.current.style.transform = `translate(${position.x}px, ${position.y}px)`
        }
    }, [position])

    return [elementRef]
}

export default useMovable
