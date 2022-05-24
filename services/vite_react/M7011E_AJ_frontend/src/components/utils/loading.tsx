import React from 'react'
import { Spinner } from 'react-bootstrap'

export interface LoadingProps {
    active: boolean,
    children?: JSX.Element | JSX.Element[]
}

function Loading({ active, children }: LoadingProps) {

    return active ? (
        <Spinner animation="border" />)
        : (
            <>
                {children}
            </>
        )


}

export default Loading