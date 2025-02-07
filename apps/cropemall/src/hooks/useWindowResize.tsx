import { useEffect } from 'react'

const useWindowResize = (fn: (window: Window & typeof globalThis) => void) => {
    useEffect(() => {
        const handleResize = () => {
            fn(window)
        }

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [fn])
}

export default useWindowResize
