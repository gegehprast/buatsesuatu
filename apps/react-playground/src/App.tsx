import { useEffect, useState } from 'react'

type Bar = {
    positionX: number
    opacity: number
}

const containerWidth = 1000
const barCount = 40
const centerIndex = Math.floor(barCount / 2)
const barWith = 2

// Calculate the offset to center the middle bar
const containerCenter = containerWidth / 2
const barCenterOffset = barWith / 2
const maxBarStep = (containerWidth - barWith) / (barCount - 1)

const initialBars: Bar[] = Array.from({ length: barCount }, (_, i) => {
    const distanceFromCenter = Math.abs(i - centerIndex)
    const recedingFactor = 1 - distanceFromCenter / barCount
    const barStep = maxBarStep * recedingFactor
    const centerOffset = centerIndex * barStep
    const totalOffset = centerOffset - containerCenter + barCenterOffset
    const positionX = i * barStep - totalOffset

    let opacity = 1

    if (i < centerIndex - 2 || i > centerIndex + 2) {
        opacity = 1 - distanceFromCenter / centerIndex
    } else {
        opacity = 1
    }

    return { positionX, opacity }
})

const recalculatedBars = (currentCenter: number) => {
    return initialBars.map((_, i) => {
        const distanceFromCenter = Math.abs(i - currentCenter)
        const recedingFactor = 1 - distanceFromCenter / barCount
        const barStep = maxBarStep * recedingFactor
        const centerOffset = currentCenter * barStep
        const totalOffset = centerOffset - containerCenter + barCenterOffset
        const positionX = i * barStep - totalOffset

        let opacity = 1

        if (i < currentCenter - 2 || i > currentCenter + 2) {
            opacity = 1 - distanceFromCenter / centerIndex
        } else {
            opacity = 1
        }

        return { positionX, opacity }
    })
}

function App() {
    const [currentCenter, setCurrentCenter] = useState(centerIndex)
    const [bars, setBars] = useState(initialBars)

    useEffect(() => {
        function handleControl(e: KeyboardEvent) {
            if (e.key === 'ArrowLeft') {
                setCurrentCenter((prev) => {
                    if (prev === 0) return prev
                    return prev - 1
                })
            }

            if (e.key === 'ArrowRight') {
                setCurrentCenter((prev) => {
                    if (prev === barCount - 1) return prev
                    return prev + 1
                })
            }
        }

        window.addEventListener('keydown', handleControl)

        return () => {
            window.removeEventListener('keydown', handleControl)
        }
    }, [])

    useEffect(() => {
        setBars(recalculatedBars(currentCenter))
    }, [currentCenter])

    return (
        <div className="p-2">
            <div
                className="relative border h-[450px] bg-black"
                style={{
                    width: `${containerWidth}px`,
                }}
            >
                <div
                    className="absolute left-0 top-0 bg-yellow-500"
                    style={{
                        width: `${barWith}px`,
                        height: '100%',
                        transform: `translate(${containerWidth / 2 - barWith / 2}px, 0)`,
                    }}
                />

                {bars.map((bar, i) => (
                    <div
                        key={i}
                        className={`absolute left-0 top-1/2 bg-red-500`}
                        style={{
                            width: `${barWith}px`,
                            height: i === currentCenter ? '48px' : '24px',
                            transform: `translate(${bar.positionX}px, -50%)`,
                            opacity: `${bar.opacity}`,
                        }}
                    />
                ))}
            </div>
        </div>
    )
}

export default App
