import React, { useState } from 'react'
import { useSessionStorage } from '../../../customHooks';
import useFetch from '../../../customHooks/useFetch';
import UserData from '../../../models/userdata';
import Loading from '../../utils/loading';
import PopupTemplate from '../template'
import Body from './body';
import Footer from './footer';

export interface LoginPopupProps {

}


export default function LoginPopup() {
    const [active, setActive] = useState(true);
    const [pass, setPass] = useState<string>("");
    const [username, setuser] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    const [value, setValue, remove] =  useSessionStorage<UserData>("user", {username: "NaN", token: ""});

    const handleChange = (user: string, pass: string) => { setPass(pass); setuser(user) };
    const handleLogin = async () => {
        const res = useFetch.post(`${process.env.AUTH_ENDPOINT}/api/login`, "", { username, password: pass })

        setLoading(res.loading);
        // ...
        // action.updateSimdata(res.value)
        
    }
    return (
        <Loading active={loading}>
            <PopupTemplate
                show={active}
                onClose={() => setActive(false)}
                size={'lg'}
                body={<Body onChange={handleChange} />}
                footer={<Footer onLogin={handleLogin} onCancle={() => setActive(false)} />}
            />
        </Loading>

    )
}
