import useMovable from '@/hooks/useMovable'
import React from 'react'

interface MoveableProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
}

const Moveable: React.FC<MoveableProps> = ({ children, ...props }) => {
    const [ref] = useMovable<HTMLDivElement>()

    return (
        <div
            ref={ref}
            className={`absolute h-full ${props.className}`}
            {...props}
        >
            {children}

            <div className="absolute inset-0 cursor-move border border-black " />
        </div>
    )
}

export default Moveable
