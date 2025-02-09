import { Vector } from '@cropemall/math'
import React, { useEffect, useRef, useState } from 'react'

type UseMovableWithMouse<T extends HTMLElement> = [
    React.RefObject<T | null>,
    Vector,
    React.Dispatch<React.SetStateAction<Vector>>,
]

const useMouseMovable = <T extends HTMLElement>(): UseMovableWithMouse<T> => {
    const elementRef = useRef<T>(null)
    const startPos = useRef(new Vector(0, 0))
    const currPos = useRef(new Vector(0, 0))
    const [position, setPosition] = useState(new Vector(0, 0))

    useEffect(() => {
        const element = elementRef.current

        if (!element) return

        function handleMouseDown(e: MouseEvent) {
            e.preventDefault()
            e.stopPropagation()

            startPos.current = new Vector(e.clientX, e.clientY)

            function handleMouseMove(e: MouseEvent) {
                e.preventDefault()
                e.stopPropagation()

                currPos.current = new Vector(e.clientX, e.clientY)

                const force = currPos.current.sub(startPos.current)

                setPosition((pos) => pos.add(force))

                startPos.current = currPos.current
            }

            function handleMouseUp(e: MouseEvent) {
                e.preventDefault()
                e.stopPropagation()

                document.body.removeEventListener('mousemove', handleMouseMove)
            }

            document.body.addEventListener('mousemove', handleMouseMove)
            document.body.addEventListener('mouseup', handleMouseUp, {
                once: true,
            })
        }

        element.addEventListener('mousedown', handleMouseDown)

        return () => {
            element.removeEventListener('mousedown', handleMouseDown)
        }
    }, [])

    useEffect(() => {
        if (!elementRef.current) return

        elementRef.current.style.cursor = 'move'
        elementRef.current.style.transform = `translate(${position.x}px, ${position.y}px)`
    }, [position])

    return [elementRef, position, setPosition]
}

export default useMouseMovable
