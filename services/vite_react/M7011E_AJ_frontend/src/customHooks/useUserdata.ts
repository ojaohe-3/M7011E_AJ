
import axios from "axios";
import { useState } from "react";
import Manager from "../models/Manager";
import Prosumer from "../models/Prosumer";
import UserData from "../models/userdata";
import useAsync from "./useAsync";

const useUserdata = async (user: UserData, sim: string, token: string) => {
    const [loading, setLoading] = useState(true);
    const [_l, managers, err1] = useAsync<Manager[]>(async () => {
        const ms: Manager[] = [];
        user.managers?.forEach(async v => {
                const res = await axios.get(import.meta.env.VITE_BACKEND_URL + `/${sim}/api/v1/members/managers/${v.id}`, { headers: { "content-type": "application/json", "Authenticate": `Bearer ${token}` } });
                if (res.status === 200) {
                    ms.push(res.data)
                }
        });
        return ms;
    });

    const [_l2, prosumers, err2] = useAsync<Manager[]>(async () => {
        const ps: Prosumer[] = [];
        user.prosumers?.forEach(async v => {
            const res = await axios.get(import.meta.env.VITE_BACKEND_URL + `/${sim}/api/v1/members/managers/${v.id}`, { headers: { "content-type": "application/json", "Authenticate": `Bearer ${token}` } });
            if (res.status === 200) {
                ps.push(res.data)
            }
        })
        return ps;
    });
    return [loading, managers, prosumers, err1, err2]
}

export default useUserdata;