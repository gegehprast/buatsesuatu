import { Vector } from '@cropemall/math'
import { createRef, useEffect, useRef } from 'react'
import { useCropper } from './useCropper'

const keep = 6
const containerWidth = 400
const barStep = 15
const barCount = 101
const center = Math.floor(barCount / 2)
const atMinus180 = center - 180 / 0.5 / barStep
const atMinus90 = center - 90 / 0.5 / barStep
const atMinus45 = center - 45 / 0.5 / barStep
const at45 = center + 45 / 0.5 / barStep
const at90 = center + 90 / 0.5 / barStep
const at180 = center + 180 / 0.5 / barStep
const bars = Array.from({ length: barCount }, (_, i) => {
    const centerX = containerWidth / 2
    const width = 1
    const offset = (i - center) * barStep
    const pos = new Vector(centerX + offset - width, 0)

    return pos
})
const maxAngle = 180
const maxAngleRadian = maxAngle * (Math.PI / 180)

const offsetForceToRadians = (force: Vector) => {
    return -(force.x * 0.5 * (Math.PI / 180))
}

const radiansToOffsetForce = (radian: number) => {
    return new Vector(-(radian / 0.5 / (Math.PI / 180)), 0)
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

                const force = currPos.current.sub(startPos.current)

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

            const currentCenter = Math.round(center - offsetForce.x / barStep)

            if (i > currentCenter - keep && i < currentCenter + keep) {
                bar.style.opacity = '1'
            }

            if (i < currentCenter - keep) {
                const op = Math.abs(i - (currentCenter - keep)) / 10
                bar.style.opacity = `${1 - op}`
            }

            if (i > currentCenter + keep) {
                const op = Math.abs(i - (currentCenter + keep)) / 10
                bar.style.opacity = `${1 - op}`
            }

            if (i === center) {
                bar.style.backgroundColor = '#ff9cd3'
                bar.style.height = '16px'
            }

            if (i === atMinus180 || i === at180) {
                bar.style.backgroundColor = '#d1d5dc'
                bar.style.height = '16px'
            }

            if (
                i === atMinus90 ||
                i === at90 ||
                i === atMinus45 ||
                i === at45
            ) {
                bar.style.backgroundColor = '#ffc9e8'
                bar.style.height = '16px'
            }
        })
    }, [barRefs, imgRotation])

    return [
        containerRef,
        barRefs,
        center,
        atMinus180,
        atMinus90,
        atMinus45,
        at45,
        at90,
        at180,
    ] as const
}

export default useCropperRotateHandler
