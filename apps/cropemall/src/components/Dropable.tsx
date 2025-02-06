import React from 'react'
import useFileStore from '@/hooks/useFileStore'

const Dropable = () => {
    const { setFiles } = useFileStore()
    const [dragging, setDragging] = React.useState(false)

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setDragging(true)
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setDragging(false)

        const files = e.dataTransfer.files
        
        setFiles(Array.from(files))
    }

    const handleClick = () => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'image/*'
        input.multiple = true
        input.onchange = (e) => {
            const files = (e.target as HTMLInputElement).files
            
            if (files) {
                setFiles(Array.from(files))
            }
        }
        input.click()
    }

    return (
        <div
            className={`
                absolute inset-0 
                flex flex-col items-center justify-center 
                transition-colors duration-200 ease-in-out 
                ${dragging ? 'bg-mf-100/50' : 'bg-white'}
                hover:bg-mf-100/50
            `}
            onDragOver={handleDragOver}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={handleClick}
        >
            <h1 className="text-2xl font-semibold text-mf-600">
                Drop files here
            </h1>

            <p className="text-gray-500">or click to select files</p>
        </div>
    )
}

export default Dropable
