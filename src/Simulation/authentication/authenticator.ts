import assert = require("assert");
import axios from "axios";
import UserData, { Privilage } from "./userdata";

// TODO
// add a profile setting that allows admin control.
export default function Authenticate(key: string, lvl?: number) {
    return async function (req, res, next) { // todo TLS protocols
        const id = req.params.id as string | undefined;
        const token = req.headers.authorization.split(' ')[1];
        if (!token)
            res.status(403).json({ message: 'authentication header required!' });

        const user = await verify(token);
        assert(user);
        const credence = isPrivilaged(key, user, id, lvl);

        if (credence) {
            next();
        } else {
            res.status(403).json({ message: "no access to this endpoint" })
        }



    }

}

function isPrivilaged(key: string, user: UserData, id?: string, lvl?: number): boolean {
    console.log(`getting : ${key}, from ${user}. Member to be found ${id}`)
    for (const [k, value] of Object.entries(user)) {
        if (k === key) {
            if (key === "admin") return value;
            if(!lvl || !id) return false;
            value.filter((v) => v.id === id && lvl <= v.level)
            return value.length > 0;
        }
    }
    return false;
}

async function verify(token: string): Promise<UserData | null> {
    try {
        const data = await (await axios.get(process.env.AUTH_ENDPOINT + '/api/validate', { headers: { 'authorization': 'Bearer ' + token } })).data; // what did i do here???
        assert(data.status)
        return data.body.data;


    } catch (error) {
        console.log(error);
        return null;
    }
}
