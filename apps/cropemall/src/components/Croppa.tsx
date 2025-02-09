import CropperProvider from '@/providers/CropperProvider'
import React, { useRef } from 'react'
import CropperContainer from './CropperContainer'
import CropperImage from './CropperImage'

interface CroppaProps {
    src: string
    alt: string
}

const Croppa: React.FC<CroppaProps> = ({ src, alt }) => {
    const cropper = useRef<{ download: () => void, reset: () => void }>(null)

    const crop = () => {
        if (!cropper.current) return

        cropper.current.download()
    }

    const reset = () => {
        if (!cropper.current) return

        cropper.current.reset()
    }

    return (
        <div className="relative flex flex-col aspect-video p-2 bg-gray-200 border border-mf-500 rounded">
            <CropperProvider ref={cropper}>
                <CropperContainer>
                    <CropperImage src={src} alt={alt} />
                </CropperContainer>
            </CropperProvider>

            <div className="flex justify-center gap-2 mt-2">
                <button className="bg-mf-500 text-white p-1" onClick={crop}>
                    Crop
                </button>
                <button className="bg-mf-500 text-white p-1" onClick={reset}>
                    Cancel
                </button>
            </div>
        </div>
    )
}

export default Croppa
