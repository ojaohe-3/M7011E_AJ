import axios from 'axios';
import React, { useState } from 'react'
import { useSessionStorage } from '../../../customHooks';
import useFetch from '../../../customHooks/useFetch';
import UserData from '../../../models/userdata';
import Loading from '../../utils/loading';
import PopupTemplate from '../template'
import Body from './body';
import Footer from './footer';

export interface LoginPopupProps {
    display: boolean
    onClose: () => void
    onLogin: (u: UserData) => void
}


export default function LoginPopup({ display, onClose, onLogin }: LoginPopupProps) {
    const [pass, setPass] = useState<string>("");
    const [username, setuser] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<string>("");

    const handleChange = (user: string, pass: string) => {
        setPass(pass);
        setuser(user);
    };
    const handleLogin = async () => {
        try {
            setLoading(true);
            console.log("sending", username, pass)
            const res = await axios.post(`${import.meta.env.VITE_AUTH_ENDPOINT}/api/login`, { username: username, password: pass }, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            setLoading(false);
            setMessage(res.data.message);
            if (res.data.status !== 0 || !res.data.status) {
                const user: UserData = {
                    ...res.data.user,
                    token: res.data.jwt
                }
                onLogin(user)
            }

        } catch (error) {
            console.error(error);
        }

    }
    return (
        <>
            <PopupTemplate
                show={display}
                onClose={onClose}
                body={
                    <>
                        <Body onChange={handleChange} />
                        <Loading loading={loading}>
                            <p style={{color: 'darkgrey', textAlign: 'center'}}>{message}</p>
                        </Loading>
                    </>
                }
                footer={<Footer onLogin={handleLogin} onCancle={onClose} />} />

        </>

    )
}
