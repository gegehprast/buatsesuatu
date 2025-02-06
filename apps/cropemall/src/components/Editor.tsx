import useFileStore from '@/hooks/useFileStore'

const Editor = () => {
    const files = useFileStore((s) => s.files)
    
    return (
        <div className="grid grid-cols-4 gap-4 p-4 xl:grid-cols-6">
            {files.map((file) => (
                <div
                    key={file.name}
                    className="relative flex items-center justify-center w-full border border-collapse h-96"
                >
                    <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="object-contain w-auto h-full"
                    />
                </div>
            ))}
        </div>
    )
}

export default Editor
