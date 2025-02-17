import Dropable from './components/Dropable'
import Canvas from './components/Canvas'
import useFileStore from './hooks/useFileStore'
import { useRef, createRef } from 'react'
import { CropperMethods } from './providers/CropperProvider'
import Footer from './components/Footer'

function App() {
    const files = useFileStore((s) => s.files)
    const setFiles = useFileStore((s) => s.setFiles)
    const croppaRefs = useRef<React.RefObject<CropperMethods | null>[]>([])
    croppaRefs.current = files.map(() => createRef())

    const crop = async () => {
        for (let i = 0; i < files.length; i++) {
            const ref = croppaRefs.current[i]

            if (!ref.current) continue

            await ref.current.download()
        }
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
                <div className="absolute p-2 flex flex-row gap-2 rounded bg-mf-200 bottom-4 left-1/2 -translate-x-1/2 lg:left-auto lg:translate-x-0 lg:right-8">
                    <button
                        onClick={crop}
                        title="Crop all"
                        className="p-2 px-4 text-white rounded-md bg-mf-500 hover:bg-mf-600 transition-colors duration-300 ease-in-out cursor-pointer whitespace-nowrap"
                    >
                        cropemall
                    </button>

                    <button
                        onClick={reset}
                        title="Reset all"
                        className="p-2 px-4 text-white rounded-md bg-gray-500 hover:bg-gray-600 transition-colors duration-300 ease-in-out cursor-pointer whitespace-nowrap"
                    >
                        Reset all
                    </button>

                    <button
                        onClick={() => {
                            setFiles([])
                        }}
                        title="Reset all"
                        className="p-2 px-4 text-white rounded-md bg-gray-500 hover:bg-gray-600 transition-colors duration-300 ease-in-out cursor-pointer whitespace-nowrap"
                    >
                        Start over
                    </button>
                </div>
            )}

            {files.length === 0 && <Footer />}
        </div>
    )
}

export default App
