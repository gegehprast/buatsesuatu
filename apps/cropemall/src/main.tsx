import { scan } from 'react-scan' // import this BEFORE react
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'
import App from './App.tsx'

if (typeof window !== 'undefined') {
    scan({
        enabled: import.meta.env.MODE === 'development',
        log: true, // logs render info to console (default: false)
    })
}

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>,
)
