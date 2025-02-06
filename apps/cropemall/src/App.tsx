import { Button } from '@cropemall/ui/button'
import { useEffect, useState } from 'react'

function App() {
    const [count, setCount] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setCount((prev) => prev + 1)
        }, 1000)

        return () => clearInterval(interval)
    }, [])

    return (
        <main className="text-2xl w-full h-10 bg-amber-400 font-bold">
            Hello
            <Button
                appName="cropemall"
                className="block bg-black text-white p-2 rounded"
                onClick={() => setCount((c) => c + 1)}
            >
                Click me {count}
            </Button>
        </main>
    )
}

export default App
