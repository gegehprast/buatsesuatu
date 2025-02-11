import { useCropper } from '@/hooks/useCropper'
import useCropperRotateHandler from '@/hooks/useCropperRotateHandler'
import React from 'react'

const CropperRotateHandler: React.FC = () => {
    const { imgRotation } = useCropper()
    const [containerRef, barRefs, center] =
        useCropperRotateHandler()

    return (
        <div className="absolute bottom-0 left-0 space-x-2 w-full p-2 flex items-center text-white z-10">
            <div
                ref={containerRef}
                className="relative w-[200px] mx-auto h-6 flex items-center"
            >
                {/* rotation lebel */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 text-sm">
                    {(imgRotation / (Math.PI / 180)).toFixed(1)}°
                </div>
                
                {barRefs.map((barRef, i) => {
                    return (
                        <Bar
                            ref={barRef}
                            key={i}
                            className={i === center ? 'h-4 ' : ''}
                        />
                    )
                })}

                {/* center bar */}
                <div className="absolute w-0.5 h-4 bg-mf-400 left-1/2 -translate-x-1/2" />
            </div>
        </div>
    )
}

interface BarProps extends React.HTMLAttributes<HTMLDivElement> {
    ref: React.RefObject<HTMLDivElement | null>
}

const Bar: React.FC<BarProps> = ({ ref, ...props }) => {
    return (
        <div
            ref={ref}
            className={`absolute w-0.5 h-3 bg-gray-100 ${props.className}`}
        />
    )
}

export default CropperRotateHandler
