import { Vector } from '@buatsesuatu/math'
import React, { useEffect, useRef, useState } from 'react'

export type Edges = {
    top?: number
    right?: number
    bottom?: number
    left?: number
}

export type UseMovableSetPosition = (
    setter: (pos: Vector) => Vector,
    edges?: Edges,
) => void

const constraint = <T extends HTMLElement>(
    element: T,
    pos: Vector,
    edges?: Edges,
) => {
    const newPos = pos.copy()
    const { width, height } = element.getBoundingClientRect()

    if (edges) {
        if (edges.top !== undefined) {
            newPos.y = Math.max(edges.top, newPos.y)
        }

        if (edges.right !== undefined) {
            newPos.x = Math.min(edges.right - width, newPos.x)
        }

        if (edges.bottom !== undefined) {
            newPos.y = Math.min(edges.bottom - height, newPos.y)
        }

        if (edges.left !== undefined) {
            newPos.x = Math.max(edges.left, newPos.x)
        }
    }

    return newPos
}

/**
 * 
 * @param edges The edges of the movable element
 * @param dontUpdateStyle If true the element transformation style will not be updated
 * @returns 
 */
const useMovable = <T extends HTMLElement>(
    edges?: Edges,
    dontUpdateStyle?: boolean,
): [React.RefObject<T | null>, Vector, UseMovableSetPosition] => {
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

                setPosition((pos) => {
                    const newPos = pos.add(force)

                    if (!element) return newPos

                    return constraint(element, newPos, edges)
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

        if (dontUpdateStyle) return

        elementRef.current.style.transform = `translate(${position.x}px, ${position.y}px)`
    }, [position, dontUpdateStyle])

    const _setPosition: UseMovableSetPosition = (setter, _edges) => {
        setPosition((pos) => {
            const newPos = setter(pos)

            if (!elementRef.current) return newPos

            return constraint(elementRef.current, newPos, _edges || edges)
        })
    }

    return [elementRef, position, _setPosition]
}

export default useMovable
