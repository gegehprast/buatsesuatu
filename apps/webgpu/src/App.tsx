import { useEffect, useRef, useState } from 'react'
import { App as GApp } from './App/App'
import { Scene } from './App/Scene'
import { Triangle } from './App/Objects/Triangle'
import { Quad } from './App/Objects/Quad'

function App() {
    return (
        <div className="p-2 bg-green-500">
            <Canvas />
        </div>
    )
}

function Canvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const appRef = useRef<GApp>(null)

    const [debugs, setDebugs] = useState({
        keyCodes: [] as string[],
        mouse: [0, 0] as [number, number],
    })

    useEffect(() => {
        async function main() {
            if (appRef.current) return

            if (!canvasRef.current) return

            console.log('Initializing renderer...')

            const canvas = canvasRef.current

            appRef.current = new GApp(canvas)

            await appRef.current.initialize()
            
            const scene = new Scene()
            
            for (let i = -50; i <= 50; i++) {
                const triangle = new Triangle([i * 0.2, i % 2 === 0 ? 0.5 : -0.5, 0])
                // scene.addObject(triangle)
            }
            
            for (let i = -50; i <= 50; i++) {
                const quad = new Quad([i * 0.6, i % 2 === 0 ? 0.6 : -0.6, 0])
                scene.addObject(quad)
            }
            
            appRef.current.addScene(scene)

            appRef.current.run()
        }

        main()

        return () => {}
    }, [])

    return (
        <>
            <canvas ref={canvasRef} width={600} height={400} />

            <Debug keyCodes={debugs.keyCodes} mouse={debugs.mouse} />

            <button onClick={() => appRef.current?.pause()} className="bg-gray-500 p-2">
                Pause
            </button>
            
            <button onClick={() => appRef.current?.run()} className="bg-gray-500 p-2">
                Run
            </button>
        </>
    )
}

function Debug({
    keyCodes,
    mouse,
}: {
    keyCodes: string[]
    mouse: [number, number]
}) {
    return (
        <div className="p-2">
            <h2 className="font-semibold">
                Current keys: {keyCodes.map((keyCode) => keyCode).join(', ')}
            </h2>
            <h2 className="font-semibold">
                Mouse:{' '}
                <span>
                    ({mouse[0]}, {mouse[1]})
                </span>
            </h2>
        </div>
    )
}

export default App
