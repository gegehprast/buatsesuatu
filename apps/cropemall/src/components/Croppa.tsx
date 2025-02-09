import CropperProvider, { CropperProviderMethods } from '@/providers/CropperProvider'
import React, { useImperativeHandle, useRef } from 'react'
import CropperContainer from './CropperContainer'
import CropperImage from './CropperImage'
import { Check, PencilOff } from 'lucide-react'

export type CroppaMethods = {
    crop: () => void
    reset: () => void
}

interface CroppaProps {
    src: string
    alt: string
    ref: React.RefObject<CroppaMethods | null>
}

const Croppa: React.FC<CroppaProps> = ({ src, alt, ref }) => {
    const cropper = useRef<CropperProviderMethods>(null)

    const crop = () => {
        if (!cropper.current) return

        cropper.current.download()
    }

    const reset = () => {
        if (!cropper.current) return

        cropper.current.reset()
    }

    useImperativeHandle(ref, () => {
        return {
            crop() {
                crop()
            },
            reset() {
                reset()
            },
        }
    }, [])

    return (
        <div className="relative flex flex-col aspect-video bg-gray-200 border border-mf-500 rounded">
            <CropperProvider ref={cropper}>
                <CropperContainer>
                    <CropperImage src={src} alt={alt} />
                </CropperContainer>
            </CropperProvider>

            <div className="absolute flex flex-col justify-center gap-2 top-1 left-1">
                <button
                    onClick={crop}
                    title="Crop"
                    className="bg-gray-600/30 rounded transition-colors duration-300 ease-in-out hover:bg-mf-500 cursor-pointer text-white p-1"
                >
                    <Check width={20} height={20} />
                </button>
                <button
                    onClick={reset}
                    title="Reset"
                    className="bg-gray-600/30 rounded transition-colors duration-300 ease-in-out hover:bg-mf-500 cursor-pointer text-white p-1"
                >
                    <PencilOff width={20} height={20} />
                </button>
            </div>
        </div>
    )
}

export default Croppa
