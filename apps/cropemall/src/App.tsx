import Dropable from './components/Dropable'
import Editor from './components/Editor'
import Sidebar from './components/Sidebar'
import useFileStore from './hooks/useFileStore'

function App() {
    const files = useFileStore((s) => s.files)
    
    return (
        <div className="flex h-screen bg-white">
            <main className="relative flex flex-col flex-1 overflow-auto">
                {files.length === 0 && <Dropable />}

                {files.length > 0 && <Editor />}
            </main>

            <Sidebar />
        </div>
    )
}

export default App
