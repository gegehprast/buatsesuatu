import { Vector } from '@cropemall/math'
import { createRef, useEffect, useRef } from 'react'
import { useCropper } from './useCropper'

const barCount = 61
const center = Math.floor(barCount / 2) - 1
const bars = Array.from({ length: barCount }, (_, i) => {
    const centerX = 100
    const offset = (i - center) * 10
    const width = 1
    const pos = new Vector(centerX + offset - width, 0)

    return pos
})
const maxAngle = 180
const maxAngleRadian = maxAngle * (Math.PI / 180)

const offsetForceToRadians = (force: Vector) => {
    return -(force.x * (Math.PI / 180))
}

const radiansToOffsetForce = (radian: number) => {
    return new Vector(-(radian / (Math.PI / 180)), 0)
}

const useCropperRotateHandler = () => {
    const { imgRotation, setImgRotation } = useCropper()
    const containerRef = useRef<HTMLDivElement | null>(null)
    const startPos = useRef<Vector>(new Vector(0, 0))
    const currPos = useRef<Vector>(new Vector(0, 0))
    const barRefs = bars.map(() => createRef<HTMLDivElement>())

    useEffect(() => {
        const container = containerRef.current

        if (!container) return

        function handleMouseDown(e: MouseEvent) {
            e.preventDefault()
            e.stopPropagation()

            startPos.current = new Vector(e.clientX, e.clientY)

            function handleMouseMove(e: MouseEvent) {
                e.preventDefault()
                e.stopPropagation()

                currPos.current = new Vector(e.clientX, e.clientY)

                const force = currPos.current.sub(startPos.current).normalize()

                setImgRotation((prev) => {
                    const currentForce = radiansToOffsetForce(prev)
                    const newForce = currentForce.add(new Vector(force.x, 0))
                    const radian = offsetForceToRadians(newForce)

                    if (radian > maxAngleRadian) return maxAngleRadian

                    if (radian < -maxAngleRadian) return -maxAngleRadian

                    return radian
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

        container.addEventListener('mousedown', handleMouseDown)

        return () => {
            container.removeEventListener('mousedown', handleMouseDown)
        }
    }, [barRefs, setImgRotation])

    useEffect(() => {
        barRefs.forEach((barRef, i) => {
            const bar = barRef.current

            if (!bar) return

            const pos = bars[i]
            const offsetForce = radiansToOffsetForce(imgRotation)
            const newPos = pos.add(offsetForce)

            bar.style.transform = `translateX(${newPos.x}px)`
        })
    }, [barRefs, imgRotation])

    return [containerRef, barRefs, center] as const
}

export default useCropperRotateHandler
