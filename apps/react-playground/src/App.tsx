import { useEffect, useRef } from 'react'
import { Renderer } from './Renderer'

function App() {
    return (
        <div className="p-2 bg-green-500">
            <Canvas />
        </div>
    )
}

function Canvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        let ignore = false

        async function main() {
            if (!canvasRef.current) return

            console.log('Initializing renderer...')

            const canvas = canvasRef.current

            const renderer = new Renderer(canvas)
            await renderer.initialize()

            if (ignore) {
                renderer.destroy()
                return
            }

            renderer.render()
        }

        main()

        return () => {
            ignore = true
        }
    }, [])

    return <canvas ref={canvasRef} width={600} height={400} />
}

export default App
