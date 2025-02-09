import useFileStore from '@/hooks/useFileStore'
import React from 'react'

interface CropperMarkerProps {
    crop: () => void
    reset: () => void
}

const Sidebar: React.FC<CropperMarkerProps> = ({ crop, reset }) => {
    const files = useFileStore((s) => s.files)

    return (
        <aside className="static inset-0 left-0 z-50 w-64 border-l-2 shadow border-mf-500">
            {files.length > 0 && (
                <nav className="p-4">
                    <button
                        onClick={crop}
                        title="Crop all"
                        className="w-full p-2 mb-4 text-white rounded-md bg-mf-500"
                    >
                        cropemall
                    </button>

                    <button
                        onClick={reset}
                        title="Reset all"
                        className="w-full p-2 mb-4 text-white rounded-md bg-gray-500"
                    >
                        Reset all
                    </button>
                </nav>
            )}
        </aside>
    )
}

export default Sidebar
