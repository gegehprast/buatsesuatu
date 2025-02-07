import { Vector } from '@cropemall/math'
import React, { useEffect, useRef, useState } from 'react'

type UseMovableWithMouse<T extends HTMLElement> = [
    React.MutableRefObject<T | null>,
    Vector,
]

const useMovableWithMouse = <
    T extends HTMLElement,
>(): UseMovableWithMouse<T> => {
    const elementRef = useRef<T>(null)
    const startPos = useRef(new Vector(0, 0))
    const currPos = useRef(new Vector(0, 0))

    const [isDragging, setIsDragging] = useState(false)
    const [position, setPosition] = useState(new Vector(0, 0))

    useEffect(() => {
        const element = elementRef.current

        if (!element) {
            return
        }

        function handleMouseDown(e: MouseEvent) {
            e.preventDefault()
            startPos.current = new Vector(e.clientX, e.clientY)
            setIsDragging(true)
        }

        element.addEventListener('mousedown', handleMouseDown)

        return () => {
            element.removeEventListener('mousedown', handleMouseDown)
        }
    }, [])

    useEffect(() => {
        function handleMouseMove(e: MouseEvent) {
            if (!isDragging) {
                return
            }

            currPos.current = new Vector(e.clientX, e.clientY)

            const force = currPos.current.sub(startPos.current)

            setPosition((pos) => pos.add(force))

            startPos.current = currPos.current
        }

        function handleMouseUp() {
            setIsDragging(false)
        }

        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)

        return () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
        }
    }, [isDragging])

    useEffect(() => {
        if (elementRef.current) {
            elementRef.current.style.cursor = 'move'
            elementRef.current.style.transform = `translate(${position.x}px, ${position.y}px)`
        }
    }, [position])

    return [elementRef, position]
}

export default useMovableWithMouse
