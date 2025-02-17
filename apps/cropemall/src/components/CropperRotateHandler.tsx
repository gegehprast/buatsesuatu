import { useCropper } from '@/hooks/useCropper'
import useCropperRotateHandler from '@/hooks/useCropperRotateHandler'
import React from 'react'

function radianToText(radian: number) {
    const degree = (radian / (Math.PI / 180)).toFixed(1)

    if (degree === '-0.0') return '0.0'

    return degree
}

const CropperRotateHandler: React.FC = () => {
    const { imgRotation } = useCropper()
    const [containerRef, barRefs] = useCropperRotateHandler()

    return (
        <div className="absolute bottom-0 left-0 space-x-2 w-full p-2 flex items-center text-white">
            <div
                ref={containerRef}
                className="relative w-[400px] mx-auto h-6 flex items-center touch-none"
            >
                {/* rotation label */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 text-sm">
                    {radianToText(imgRotation)}°
                </div>

                {barRefs.map((barRef, i) => {
                    return <Bar ref={barRef} key={i} />
                })}

                {/* center bar */}
                <div className="absolute w-0.5 h-4 bg-mf-400 left-1/2 -translate-x-1/2" />
            </div>
        </div>
    )
}

interface BarProps {
    ref: React.RefObject<HTMLDivElement | null>
}

const Bar: React.FC<BarProps> = ({ ref }) => {
    return (
        <div
            ref={ref}
            className={`absolute h-3 bg-gray-100 transition-[height] duration-200 ease-in`}
        />
    )
}

export default CropperRotateHandler
