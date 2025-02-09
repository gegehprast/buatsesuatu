import useFileStore from '@/hooks/useFileStore'
import Croppa, { CroppaMethods } from './Croppa'
import React, { useEffect, useState } from 'react'

interface CanvasProps {
    croppaRefs: React.RefObject<React.RefObject<CroppaMethods | null>[]>
}

const Canvas: React.FC<CanvasProps> = ({ croppaRefs }) => {
    const files = useFileStore((s) => s.files)
    const [images, setImages] = useState<HTMLImageElement[]>([])

    useEffect(() => {
        const images = files.map((file) => {
            const img = new Image()
            img.src = URL.createObjectURL(file)
            return img
        })

        setImages(images)
    }, [files])

    useEffect(() => {
        return () => {
            // revoke object urls
            images.forEach((img) => URL.revokeObjectURL(img.src))
        }
    }, [images])

    return (
        <div className="grid grid-cols-1 gap-2 p-2 md:grid-cols-2 xl:grid-cols-3">
            {images.map((img, i) => (
                <Croppa
                    ref={croppaRefs.current[i]}
                    key={files[i].name}
                    src={img.src}
                    alt={files[i].name}
                />
            ))}
        </div>
    )
}

export default Canvas
