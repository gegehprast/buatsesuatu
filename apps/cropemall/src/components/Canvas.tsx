import useFileStore from '@/hooks/useFileStore'
import Editor from './Editor'

const Canvas = () => {
    const files = useFileStore((s) => s.files)

    return (
        <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {files.map((file) => (
                <Editor
                    key={file.name}
                    img={URL.createObjectURL(file)}
                    alt={file.name}
                />
            ))}
        </div>
    )
}

export default Canvas
