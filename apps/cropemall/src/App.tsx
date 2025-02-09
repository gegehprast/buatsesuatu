import Dropable from './components/Dropable'
import Canvas from './components/Canvas'
import Sidebar from './components/Sidebar'
import useFileStore from './hooks/useFileStore'
import { CroppaMethods } from './components/Croppa'
import { useRef, createRef } from 'react'

function App() {
    const files = useFileStore((s) => s.files)
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
        <div className="flex h-screen bg-white">
            <main className="relative flex flex-col flex-1 overflow-auto">
                {files.length === 0 && <Dropable />}

                {files.length > 0 && <Canvas croppaRefs={croppaRefs} />}
            </main>

            <Sidebar crop={crop} reset={reset} />
        </div>
    )
}

export default App
