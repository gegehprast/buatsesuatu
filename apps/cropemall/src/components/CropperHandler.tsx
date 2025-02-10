import { useCropper } from '@/hooks/useCropper'
import { Check, PencilOff } from 'lucide-react'
import React from 'react'

const CropperHandler: React.FC = () => {
    const { download, reset } = useCropper()

    return (
        <div className="z-10 absolute flex flex-col justify-center gap-2 top-1 left-1">
            <button
                onClick={download}
                title="Download cropped"
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
    )
}

export default CropperHandler
