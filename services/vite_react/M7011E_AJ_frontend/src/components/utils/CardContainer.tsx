import React, { CSSProperties } from 'react'

export interface CardContainerProps {
    children?: React.ReactNode
    width: number

}

export default function CardContainer({ children, width }: CardContainerProps | any) {
    const generateStyle = (width: number) => {
        return {
            display: "grid",
            gridTemplateColumns: "repeat(" + width + ", 1fr)",
            columnGap: "10px"
        } as CSSProperties
    }

    return (
        <div style={{...generateStyle(width)}}>
            {children}
        </div>
    )
}