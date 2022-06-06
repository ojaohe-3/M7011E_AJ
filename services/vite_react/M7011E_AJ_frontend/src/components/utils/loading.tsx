import React, { CSSProperties } from 'react'
import { Spinner } from 'react-bootstrap'

export interface LoadingProps {
    loading: boolean,
    children?: JSX.Element | JSX.Element[] | any
}


function Loading({ loading, children }: LoadingProps) {

    return loading ? (

        <Spinner animation="border" style={{marginRight: '45px'}}/>)
        : (
            <>
                {children}
            </>
        )


}

export default Loading