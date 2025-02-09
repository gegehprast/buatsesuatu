import Dropable from './components/Dropable'
import Canvas from './components/Canvas'
import useFileStore from './hooks/useFileStore'
import { CroppaMethods } from './components/Croppa'
import { useRef, createRef } from 'react'

function App() {
    const files = useFileStore((s) => s.files)
    const setFiles = useFileStore((s) => s.setFiles)
    const croppaRefs = useRef<React.RefObject<CroppaMethods | null>[]>([])
    croppaRefs.current = files.map(() => createRef())

    const crop = () => {
        croppaRefs.current.forEach((ref) => {
            if (!ref.current) return

            ref.current.crop()
        })
    }

    const reset = () => {
        croppaRefs.current.forEach((ref) => {
            if (!ref.current) return

            ref.current.reset()
        })
    }

    return (
        <div className="relative flex h-screen bg-white">
            <main className="relative flex flex-col flex-1 overflow-auto">
                {files.length === 0 && <Dropable />}

                {files.length > 0 && <Canvas croppaRefs={croppaRefs} />}
            </main>

            {files.length > 0 && (
                <nav className="absolute flex flex-row gap-2 p-2 rounded bg-mf-200 bottom-4 right-8">
                    <button
                        onClick={crop}
                        title="Crop all"
                        className="p-2 px-4 text-white rounded-md bg-mf-500 hover:bg-mf-600 transition-colors duration-300 ease-in-out cursor-pointer"
                    >
                        cropemall
                    </button>

                    <button
                        onClick={reset}
                        title="Reset all"
                        className="p-2 px-4 text-white rounded-md bg-gray-500 hover:bg-gray-600 transition-colors duration-300 ease-in-out cursor-pointer"
                    >
                        Reset all
                    </button>

                    <button
                        onClick={() => {
                            setFiles([])
                        }}
                        title="Reset all"
                        className="p-2 px-4 text-white rounded-md bg-gray-500 hover:bg-gray-600 transition-colors duration-300 ease-in-out cursor-pointer"
                    >
                        Start over
                    </button>
                </nav>
            )}
        </div>
    )
}

export default App
