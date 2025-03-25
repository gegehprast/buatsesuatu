import { useEffect, useRef, useState } from 'react'
import { App as GApp } from './App/App'
import { Scene } from './App/Scene'
import { Triangle } from './App/Objects/Triangle'
import { Quad } from './App/Objects/Quad'
import { InputListener } from './App/Input'
import { mat4 } from 'gl-matrix'

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
    const trianglesRef = useRef<Triangle[]>([])
    const quadsRef = useRef<Quad[]>([])

    const [debugs, setDebugs] = useState({
        keyCodes: [] as string[],
        mouse: [0, 0] as [number, number],
    })

    const onTick = (keys: string[]) => {
        if (keys.includes('KeyX')) {
            trianglesRef.current.forEach((triangle) => {
                triangle.setRotationX(triangle.rotationX + 0.025)
                triangle.setRotationY(triangle.rotationY + 0.025)
            })
        }
    }

    useEffect(() => {
        const observeControl: InputListener = ({ keys, mouseX, mouseY }) => {
            setDebugs({
                keyCodes: keys,
                mouse: [mouseX, mouseY],
            })
        }
        
        async function main() {
            if (appRef.current) return

            if (!canvasRef.current) return

            console.log('Initializing renderer...')

            const canvas = canvasRef.current

            const app = new GApp(canvas)
            appRef.current = app

            await app.initialize()
            
            const scene = new Scene()
            
            for (let i = -40; i <= 40; i++) {
                const triangle = new Triangle([i * 0.6, i % 2 === 0 ? 0.6 : -0.6, -1.0])
                scene.addObject(triangle)
            }
            
            for (let i = -40; i <= 40; i++) {
                const quad = new Quad([i * 0.6, i % 2 === 0 ? 0.6 : -0.6, 0])
                scene.addObject(quad)
            }
            
            app.addScene(scene)
            
            app.input.observeControl(observeControl)

            app.run(onTick)

            trianglesRef.current = scene.objects.filter((object) => object instanceof Triangle) as Triangle[]
            quadsRef.current = scene.objects.filter((object) => object instanceof Quad) as Quad[]
        }

        main()

        return () => {
            if (appRef.current) {
                appRef.current.input.unobserveControl(observeControl)
            }
        }
    }, [])

    return (
        <>
            <canvas ref={canvasRef} width={600} height={400} />

            <Debug keyCodes={debugs.keyCodes} mouse={debugs.mouse} />

            <button
                onClick={() => appRef.current?.pause()}
                className="bg-gray-500 p-2"
            >
                Pause
            </button>

            <button
                onClick={() => appRef.current?.run(onTick)}
                className="bg-gray-500 p-2"
            >
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
