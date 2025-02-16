import { Vector } from '@buatsesuatu/math'
import { createRef, useEffect, useRef } from 'react'
import { useCropper } from './useCropper'

const keep = 6
const containerWidth = 400
const barWith = 2
const containerCenter = containerWidth / 2
const barCenterOffset = barWith / 2
const maxBarStep = 15
const barCount = 81
const centerIndex = Math.floor(barCount / 2)
const atMinus180 = centerIndex - 180 / 0.5 / maxBarStep
const atMinus90 = centerIndex - 90 / 0.5 / maxBarStep
const atMinus45 = centerIndex - 45 / 0.5 / maxBarStep
const at45 = centerIndex + 45 / 0.5 / maxBarStep
const at90 = centerIndex + 90 / 0.5 / maxBarStep
const at180 = centerIndex + 180 / 0.5 / maxBarStep
const bars = Array.from({ length: barCount }, (_, i) => {
    const centerOffset = centerIndex * maxBarStep
    const totalOffset = centerOffset - containerCenter + barCenterOffset
    const positionX = i * maxBarStep - totalOffset
    const pos = new Vector(positionX, 0)

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

            const currentCenter = Math.round(
                centerIndex - offsetForce.x / maxBarStep,
            )

            bar.style.transform = `translateX(${newPos.x}px)`

            // opacity style
            if (i > currentCenter - keep && i < currentCenter + keep) {
                bar.style.opacity = '1'
            }

            // receding opacity style for left side
            if (i < currentCenter - keep) {
                const op = Math.abs(i - (currentCenter - keep)) / 10

                bar.style.opacity = `${1 - op}`
            }

            // receding opacity style for right side
            if (i > currentCenter + keep) {
                const op = Math.abs(i - (currentCenter + keep)) / 10

                bar.style.opacity = `${1 - op}`
            }

            // center style
            if (i === centerIndex) {
                bar.style.backgroundColor = '#ff9cd3'
                bar.style.height = '16px'
            }

            // 180 and -180 style
            if (i === atMinus180 || i === at180) {
                bar.style.backgroundColor = '#d1d5dc'
                bar.style.height = '16px'
            }

            // 90, -90, 45, -45 style
            if (
                i === atMinus90 ||
                i === at90 ||
                i === atMinus45 ||
                i === at45
            ) {
                bar.style.backgroundColor = '#ffc9e8'
                bar.style.height = '16px'
            }

            // width style
            bar.style.width = `${barWith}px`
        })
    }, [barRefs, imgRotation])

    return [
        containerRef,
        barRefs,
        centerIndex,
        atMinus180,
        atMinus90,
        atMinus45,
        at45,
        at90,
        at180,
    ] as const
}

export default useCropperRotateHandler
