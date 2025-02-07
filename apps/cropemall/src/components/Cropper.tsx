import React, { useRef, useState } from 'react'
import background from '@/assets/background.png'
import { Vector } from '@cropemall/math'

interface CropperProps {
    img: string
    alt: string
}

const Cropper: React.FC<CropperProps> = ({ img, alt }) => {
    const [translate, setTranslate] = useState(new Vector(0, 0))
    const dragStartPosRef = useRef(new Vector(0, 0))
    const dragEndPosRef = useRef(new Vector(0, 0))

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        dragStartPosRef.current = new Vector(e.clientX, e.clientY)
    }

    const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()

        dragEndPosRef.current = new Vector(e.clientX, e.clientY)

        const force = dragEndPosRef.current.sub(dragStartPosRef.current)
        const pos = translate.add(force)

        setTranslate(pos)

        dragStartPosRef.current = dragEndPosRef.current
    }

    return (
        <div className="flex flex-col">
            <div
                className="relative w-full h-full overflow-hidden border border-collapse border-mf-500 aspect-video"
                style={{ backgroundImage: `url(${background})` }}
                onDragOver={(e) => e.preventDefault()}
            >
                <img
                    src={img}
                    alt={alt}
                    className="absolute top-0 left-0 object-contain h-full select-none cursor-move"
                    style={{
                        transform: `translate(${translate.x}px, ${translate.y}px)`,
                    }}
                    onDragStart={handleDragStart}
                    onDrag={handleDrag}
                    onDragEnd={handleDrag}
                    draggable
                />
            </div>

            <div>
                <button
                    className="px-2 text-white rounded bg-mf-300"
                    onClick={() => setTranslate(translate.add(Vector.left()))}
                >
                    {'<'}
                </button>
                <button
                    className="px-2 text-white rounded bg-mf-300"
                    onClick={() => setTranslate(translate.add(Vector.right()))}
                >
                    {'>'}
                </button>
                <button
                    className="px-2 text-white rounded bg-mf-300"
                    onClick={() => setTranslate(translate.add(Vector.down()))}
                >
                    {'v'}
                </button>
                <button
                    className="px-2 text-white rounded bg-mf-300"
                    onClick={() => setTranslate(translate.add(Vector.up()))}
                >
                    {'^'}
                </button>
            </div>
        </div>
    )
}

export default Cropper
