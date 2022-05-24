
import Manager from "../models/Manager";
import Prosumer from "../models/Prosumer";
import UserData from "../models/userdata";
import useArray from "./useArray";
import useFetch from "./useFetch";
import useToggle from "./useToggle";

const useUserdata = async (user: UserData, sim: string, token: string) => {
    const managers = useArray<Manager>();
    const prosumers = useArray<Prosumer>();
    const err: any[] = [];
    user.managers?.forEach(async v => {
        const m = await useFetch.get(process.env.BACKEND_URL + `/${sim}/api/v1/members/managers/${v.id}`, user.token)
        if (!m.error && m.value) {
            managers.push(m.value as Manager);
        } else
            err.push(m.error)

    });
    user.prosumers?.forEach(async v => {
        const p = await useFetch.get(process.env.BACKEND_URL + `/${sim}/api/v1/members/prosumers/${v.id}`, user.token)
        if (!p.error && p.value) {
            prosumers.push(p.value as Prosumer);
        } else
            err.push(p.error)
    });
    return [managers, prosumers, err]
}

export default useUserdata;