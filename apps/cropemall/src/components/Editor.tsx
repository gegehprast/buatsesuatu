import useFileStore from '@/hooks/useFileStore'
import Cropper from './Cropper'

const Editor = () => {
    const files = useFileStore((s) => s.files)

    return (
        <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {files.map((file) => (
                <Cropper
                    key={file.name}
                    img={URL.createObjectURL(file)}
                    alt={file.name}
                />
            ))}
        </div>
    )
}

export default Editor
