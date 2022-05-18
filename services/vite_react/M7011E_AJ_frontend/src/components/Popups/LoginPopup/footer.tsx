import React from 'react'
import { Button } from 'react-bootstrap'

export interface FooterProps {
    onLogin: () => void,
    onCancle: () => void
}
export default function Footer({onLogin, onCancle}: FooterProps) {

    // TODO: custom css
    return (
    <>
        <Button variant='primary' onClick={onLogin}> Login </Button> 
        <Button variant='danger' onClick={onCancle}> Cancle </Button>
    </>)
}
