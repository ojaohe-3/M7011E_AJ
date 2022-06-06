import React, { useState } from 'react'
import { Container, FormControl, FormGroup, FormLabel, FormText } from 'react-bootstrap'

export interface BodyProps {
    onChange?: (user: string, pass: string) => void

}

export default function Body({ onChange }: BodyProps) {
    const [user, setUser] = useState("");
    const [pass, setPass] = useState("");


    return (
        <Container>
            <FormGroup>
                <FormLabel>Username</FormLabel>
                <FormControl type="username" placeholder='user name' onChange={(u: React.ChangeEvent<HTMLInputElement>) => {
                    let value = u.target.value;
                    if (value !== null) {
                        setUser(value);
                        if (onChange)
                            onChange(value, pass)
                    }
                }} />
                <FormText>
                    Not Registerd? press this: $placeholder$
                </FormText>
            </FormGroup>
            <FormGroup>
                <FormLabel>Password</FormLabel>
                <FormControl type="password" onChange={(u: React.ChangeEvent<HTMLInputElement>) => {
                    let value = u.target.value;
                    if (value !== null) {
                        setPass(value);
                        if (onChange)
                            onChange(user, value)
                    }
                }} />
            </FormGroup>
        </Container>
    )
}
