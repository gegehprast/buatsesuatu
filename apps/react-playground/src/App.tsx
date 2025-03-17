import { useEffect, useRef, useState } from 'react'
import { App as ControlApp } from './controls/App'

function App() {
    return (
        <div className="p-2 bg-green-500">
            <Canvas />
        </div>
    )
}

function Canvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const appRef = useRef<ControlApp>(null)

    const [debugs, setDebugs] = useState({
        keyCode: '',
        mouse: [0, 0] as [number, number],
    })

    useEffect(() => {
        function observeControl(keyCode: string | null, mouse: [number, number]) {
            setDebugs({
                keyCode: keyCode || '',
                mouse,
            })
        }

        async function main() {
            if (appRef.current) return

            if (!canvasRef.current) return

            console.log('Initializing renderer...')

            const canvas = canvasRef.current

            appRef.current = new ControlApp(canvas)

            await appRef.current.initialize()

            appRef.current.observeControl(observeControl)

            appRef.current.run()
        }

        main()

        return () => {
            if (appRef.current) {
                appRef.current.unobserveControl(observeControl)
            }
        }
    }, [])

    return (
        <>
            <canvas ref={canvasRef} width={600} height={400} />

            <Debug keyCode={debugs.keyCode} mouse={debugs.mouse} />
        </>
    )
}

function Debug({ keyCode, mouse }: { keyCode: string; mouse: [number, number] }) {
    return (
        <div className="p-2">
            <h2 className="font-semibold">
                Current key: <span>{keyCode}</span>
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
