import useFileStore from '@/hooks/useFileStore'
import Croppa, { CroppaMethods } from './Croppa'
import React from 'react'

interface CanvasProps {
    croppaRefs: React.RefObject<React.RefObject<CroppaMethods | null>[]>
}

const Canvas: React.FC<CanvasProps> = ({ croppaRefs }) => {
    const files = useFileStore((s) => s.files)

    return (
        <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
            {files.map((file, i) => (
                <Croppa
                    ref={croppaRefs.current[i]}
                    key={file.name}
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                />
            ))}
        </div>
    )
}

export default Canvas
