'use client'

import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode
    appName: string
}

export const Button = ({ children, appName, ...props }: ButtonProps) => {
    return (
        <button
            {...props}
            onClick={(e) => {
                if (props.onClick) return props.onClick(e)

                alert(`Hello from your ${appName} app!`)
            }}
        >
            {children}
        </button>
    )
}
