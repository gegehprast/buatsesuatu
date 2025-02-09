import { Vector } from '@cropemall/math'
import React, { useEffect, useRef, useState } from 'react'

const useMouseMovable = <T extends HTMLElement>(edges?: {
    top?: number
    right?: number
    bottom?: number
    left?: number
}): [
    React.RefObject<T | null>,
    Vector,
    React.Dispatch<React.SetStateAction<Vector>>,
] => {
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

                const { width, height } = element?.getBoundingClientRect() || { width: 0, height: 0 }
                currPos.current = new Vector(e.clientX, e.clientY)

                const force = currPos.current.sub(startPos.current)

                setPosition((pos) => {
                    let x = pos.x + force.x
                    let y = pos.y + force.y

                    if (edges) {
                        if (edges.top !== undefined) {
                            y = Math.max(edges.top, y)
                        }

                        if (edges.right !== undefined) {
                            x = Math.min(edges.right - width, x)
                        }

                        if (edges.bottom !== undefined) {
                            y = Math.min(edges.bottom - height, y)
                        }

                        if (edges.left !== undefined) {
                            x = Math.max(edges.left, x)
                        }
                    }

                    return new Vector(x, y)
                })

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
    }, [edges])

    useEffect(() => {
        if (!elementRef.current) return

        elementRef.current.style.cursor = 'move'
        elementRef.current.style.transform = `translate(${position.x}px, ${position.y}px)`
    }, [position])

    return [elementRef, position, setPosition]
}

export default useMouseMovable
