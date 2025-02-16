import CropperProvider, { CropperMethods } from '@/providers/CropperProvider'
import React from 'react'
import CropperContainer from './CropperContainer'
import CropperImage from './CropperImage'
import CropperHandler from './CropperHandler'
import CropperResult from './CropperResult'

interface CroppaProps {
    src: string
    alt: string
    ref?: React.RefObject<CropperMethods | null>
}

const Croppa: React.FC<CroppaProps> = ({ src, alt, ref }) => {
    return (
        <div className="relative flex flex-col aspect-video bg-gray-200 border border-mf-500 rounded">
            <CropperProvider ref={ref}>
                <CropperContainer>
                    <CropperImage src={src} alt={alt} />

                    <CropperHandler />
                </CropperContainer>

                <CropperResult />
            </CropperProvider>
        </div>
    )
}

export default Croppa
