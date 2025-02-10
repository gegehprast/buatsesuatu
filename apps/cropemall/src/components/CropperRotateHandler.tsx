import { useCropper } from '@/hooks/useCropper'
import React from 'react'

const CropperRotateHandler: React.FC = () => {
    const {
        setImgRotation,
    } = useCropper()

    const rotate = (add: number) => {
        setImgRotation((prev) => prev + add)
    }

    return (
        <div className="absolute bottom-0 left-0 space-x-2 p-2 bg-mf-300/50 w-full text-white z-10">
            <button className="w-1/4 bg-mf-500" onClick={() => rotate(-0.05)}>
                -1
            </button>
            <button className="w-1/4 bg-mf-500" onClick={() => rotate(0.05)}>
                +1
            </button>
        </div>
    )
}

export default CropperRotateHandler
